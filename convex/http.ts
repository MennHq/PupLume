import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Validates HMAC-SHA256 signature from Paddle webhooks
 * Format in Paddle-Signature: ts=1690000000;h1=hash_hex
 */
async function verifyPaddleWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string | undefined
): Promise<boolean> {
  if (!secretKey) {
    // If webhook secret isn't yet set in Convex env, allow in dev/sandbox
    return true;
  }
  if (!signatureHeader) {
    return false;
  }

  try {
    const parts = signatureHeader.split(";");
    let ts = "";
    let h1 = "";
    for (const part of parts) {
      const [k, v] = part.split("=");
      if (k === "ts") ts = v;
      if (k === "h1") h1 = v;
    }
    if (!ts || !h1) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    const signedPayload = `${ts}:${rawBody}`;
    const signatureBuffer = new Uint8Array(
      h1.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(signedPayload)
    );
  } catch (err) {
    console.warn("[Paddle Webhook] Signature verification failed:", err);
    return false;
  }
}

http.route({
  path: "/paddle-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadText = await request.text();
    const signatureHeader = request.headers.get("Paddle-Signature") || request.headers.get("paddle-signature");
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;

    // Verify cryptographic signature from Paddle
    const isValid = await verifyPaddleWebhookSignature(payloadText, signatureHeader, secretKey);
    if (!isValid) {
      console.warn("[Paddle Webhook] Rejected unauthorized webhook with invalid HMAC signature");
      return new Response("Invalid signature", { status: 401 });
    }
    
    try {
      const parsedEvent = JSON.parse(payloadText);
      const isSandbox = 
        parsedEvent.data?.status === "sandbox" || 
        parsedEvent.event_type?.includes("sandbox") ||
        parsedEvent.data?.id?.startsWith("txn_01m4") === false;

      await ctx.runMutation(internal.debugLogs.logWebhook, {
        action: "PADDLE_" + (parsedEvent.event_type || "unknown"),
        payload: parsedEvent,
        environment: isSandbox ? "sandbox" : "live",
      });

      // Process completed transactions
      if (parsedEvent.event_type === "transaction.completed") {
        const customData = parsedEvent.data?.custom_data || {};
        const email = customData.email || parsedEvent.data?.customer?.email;
        const isSmartTagPurchase = 
          customData.type === "smart_tag_pass" || 
          parsedEvent.data?.items?.some((i: any) => 
            i.price?.id === "pri_01m4x67js5vkds3y6zcc18fntf" ||
            i.price_id === "pri_01m4x67js5vkds3y6zcc18fntf"
          );
        
        if (isSmartTagPurchase) {
          await ctx.runMutation(internal.puppies.unlockSmartTagPassInternal, {
            puppyId: customData.puppyId,
            puppyName: customData.puppyName,
          });
          console.log(`[Paddle] Unlocked Smart Tag Pass for puppy: ${customData.puppyName || customData.puppyId}`);
        } else if (email) {
          await ctx.runMutation(internal.users.unlockPro, {
            email: email
          });
          console.log(`[Paddle] Unlocked user: ${email}`);
        } else {
          console.error("[Paddle] No email or puppy found in custom_data!");
        }
      }
      
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error("[Paddle] Webhook Error:", e);
      return new Response("Internal Error", { status: 500 });
    }
  })
});

export default http;
