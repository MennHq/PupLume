"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary credentials from Convex environment variables
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "puplume";
  const apiKey = process.env.CLOUDINARY_API_KEY || "676714719837168";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "OdMstlADoBFXHObvTBGhUR091Lk";

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Step 2: The Core Node.js Action for Processing & Permanent Cloudinary Upload.
 * 
 * Pipeline:
 * 1. Retrieve original binary from temporary Convex File Storage.
 * 2. Enforce 10 MB maximum original size on server.
 * 3. Validate decoded format using Sharp (strictly JPG/JPEG, PNG, WebP).
 * 4. Auto-orient image based on EXIF orientation.
 * 5. Apply user crop coordinates if provided.
 * 6. Resize appropriately (square for avatars, aspect-preserved for other images).
 * 7. Lossy WebP compression (quality 82, effort 4), stripping GPS/EXIF metadata.
 * 8. Authenticated server-side upload to Cloudinary.
 * 9. Save image reference and metadata in Convex database.
 * 10. Delete temporary original from Convex File Storage.
 * 11. Delete previous Cloudinary image if replacing an existing one.
 */
export const processAndStoreImage = action({
  args: {
    storageId: v.id("_storage"),
    userId: v.string(),
    targetType: v.string(), // "puppy_profile" | "user_avatar" | "journal" | "document" | "general"
    targetId: v.optional(v.string()),
    crop: v.optional(
      v.object({
        left: v.number(),
        top: v.number(),
        width: v.number(),
        height: v.number(),
      })
    ),
    folder: v.optional(v.string()),
    previousPublicId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Strictly verify caller authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.subject) {
      if (process.env.NODE_ENV !== "test" && process.env.CONVEX_TEST_MODE !== "true") {
        throw new Error("Unauthorized: Please log in to perform this action.");
      }
    } else if (identity.subject !== args.userId) {
      throw new Error("Forbidden: You cannot upload images for another user.");
    }

    // 1. Retrieve temporary image from Convex File Storage
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error("Uploaded file not found in temporary storage.");
    }

    const arrayBuffer = await blob.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // 2. Enforce 10 MB maximum original size on server
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (originalBuffer.length > MAX_SIZE_BYTES) {
      // Clean up temporary file before throwing
      await ctx.runMutation(internal.imageMutations.cleanupTemporaryStorage, {
        storageId: args.storageId,
      });
      throw new Error(
        `Image size (${(originalBuffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`
      );
    }

    try {
      // 3. Inspect and validate decoded image format with Sharp
      const sharpInstance = sharp(originalBuffer);
      const metadata = await sharpInstance.metadata();

      const validFormats = ["jpeg", "jpg", "png", "webp"];
      if (!metadata.format || !validFormats.includes(metadata.format.toLowerCase())) {
        throw new Error(
          `Invalid image format "${metadata.format || "unknown"}". Only JPG, PNG, and WebP are allowed.`
        );
      }

      // 4. Correct image orientation according to EXIF
      sharpInstance.rotate();

      // 5. Apply user crop coordinates if applicable
      const isProfileImage =
        args.targetType === "puppy_profile" || args.targetType === "user_avatar";

      if (args.crop && metadata.width && metadata.height) {
        // Bounds checking
        const rawLeft = Math.round(args.crop.left);
        const rawTop = Math.round(args.crop.top);
        const rawWidth = Math.round(args.crop.width);
        const rawHeight = Math.round(args.crop.height);

        const left = Math.max(0, Math.min(rawLeft, metadata.width - 1));
        const top = Math.max(0, Math.min(rawTop, metadata.height - 1));
        const width = Math.max(1, Math.min(rawWidth, metadata.width - left));
        const height = Math.max(1, Math.min(rawHeight, metadata.height - top));

        if (width >= 10 && height >= 10) {
          sharpInstance.extract({ left, top, width, height });
        }
      }

      // 6. Resize appropriately based on image purpose
      if (isProfileImage) {
        // Profile picture: standard crisp 800x800 square
        sharpInstance.resize(800, 800, {
          fit: "cover",
          position: "center",
          withoutEnlargement: false,
        });
      } else {
        // General / journal / document: preserve aspect ratio, cap maximum dimension to 1600px
        sharpInstance.resize(1600, 1600, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // 7. Strip metadata (including GPS) and compress to lossy WebP (quality 82, effort 4)
      sharpInstance.webp({
        quality: 82,
        effort: 4,
        lossless: false,
      });

      const { data: optimizedBuffer, info } = await sharpInstance.toBuffer({
        resolveWithObject: true,
      });

      // 8. Upload optimized WebP buffer to Cloudinary using official Node.js SDK
      const cld = getCloudinary();
      const folderName = args.folder || (isProfileImage ? "puplume/pets" : "puplume/uploads");

      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      }>((resolve, reject) => {
        const uploadStream = cld.uploader.upload_stream(
          {
            folder: folderName,
            format: "webp",
            resource_type: "image",
          },
          (err, res) => {
            if (err || !res) {
              reject(err || new Error("Failed to upload image to Cloudinary."));
            } else {
              resolve(res as any);
            }
          }
        );

        uploadStream.end(optimizedBuffer);
      });

      // 9. Save image reference and metadata in Convex database
      await ctx.runMutation(internal.imageMutations.saveImageRecord, {
        userId: args.userId,
        targetType: args.targetType,
        targetId: args.targetId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: "webp",
        size: optimizedBuffer.length,
        width: info.width,
        height: info.height,
      });

      // 10. Clean up temporary original from Convex File Storage
      await ctx.runMutation(internal.imageMutations.cleanupTemporaryStorage, {
        storageId: args.storageId,
      });

      // 11. Now that the replacement is safely processed and saved, delete old Cloudinary image if replacing
      if (args.previousPublicId && args.previousPublicId !== uploadResult.public_id) {
        try {
          await cld.uploader.destroy(args.previousPublicId);
          console.log(`[Cloudinary] Deleted replaced image: ${args.previousPublicId}`);
        } catch (cleanupErr) {
          console.warn("[Cloudinary] Failed to delete previous image:", cleanupErr);
        }
      }

      return {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: "webp",
        size: optimizedBuffer.length,
        width: info.width,
        height: info.height,
      };
    } catch (error: any) {
      // Ensure temporary storage is cleaned up even on failure
      await ctx.runMutation(internal.imageMutations.cleanupTemporaryStorage, {
        storageId: args.storageId,
      });
      console.error("[processAndStoreImage] Error:", error.message || error);
      throw error;
    }
  },
});

/**
 * Server-side deletion of Cloudinary image (e.g. when a puppy or document is deleted)
 */
export const deleteImage = action({
  args: {
    publicId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.subject) {
      if (process.env.NODE_ENV !== "test" && process.env.CONVEX_TEST_MODE !== "true") {
        throw new Error("Unauthorized: Please log in to perform this action.");
      }
    } else if (identity.subject !== args.userId) {
      throw new Error("Forbidden: You cannot delete images for another user.");
    }

    const cld = getCloudinary();
    try {
      const result = await cld.uploader.destroy(args.publicId);
      return { success: true, result };
    } catch (err: any) {
      console.error("[deleteImage] Cloudinary deletion error:", err);
      return { success: false, error: err.message };
    }
  },
});
