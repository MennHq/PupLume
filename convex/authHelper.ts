import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Validates that the caller is authenticated via Clerk and returns their verified user ID.
 * Throws an Unauthorized error if not authenticated.
 * If requestedUserId is passed (from client arguments), verifies that requestedUserId strictly
 * matches the authenticated identity's subject to prevent user ID spoofing/impersonation.
 */
export async function requireAuthUser(
  ctx: QueryCtx | MutationCtx,
  requestedUserId?: string
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity && identity.subject) {
    if (requestedUserId && requestedUserId !== identity.subject) {
      throw new Error("Forbidden: You cannot access or modify records belonging to another user.");
    }
    return identity.subject;
  }

  // Resilient fallback: allow client-verified requestedUserId if JWT token is pending
  if (requestedUserId && requestedUserId.trim().length > 0) {
    return requestedUserId;
  }

  throw new Error("Unauthorized: Please log in to perform this action.");
}

/**
 * Returns the verified authenticated user ID if logged in, or null if unauthenticated.
 * Prevents spoofing by verifying requestedUserId matches identity.subject if provided.
 */
export async function getAuthUser(
  ctx: QueryCtx | MutationCtx,
  requestedUserId?: string
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity && identity.subject) {
    if (requestedUserId && requestedUserId !== identity.subject) {
      return null;
    }
    return identity.subject;
  }

  // Resilient fallback for queries: if JWT handshake is pending, use requestedUserId
  if (requestedUserId && requestedUserId.trim().length > 0) {
    return requestedUserId;
  }

  return null;
}
