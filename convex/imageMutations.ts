import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Client calls this mutation to obtain a secure temporary
 * Convex File Storage upload URL.
 */
export const generateUploadUrl = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Internal mutation to save the image record and update target puppy/user profile.
 */
export const saveImageRecord = internalMutation({
  args: {
    userId: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    url: v.string(),
    publicId: v.string(),
    format: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Insert into images table
    const imageId = await ctx.db.insert("images", {
      userId: args.userId,
      targetType: args.targetType,
      targetId: args.targetId,
      url: args.url,
      publicId: args.publicId,
      format: args.format,
      size: args.size,
      width: args.width,
      height: args.height,
      uploadedAt: new Date().toISOString(),
    });

    // 2. If target is puppy_profile, update puppy record
    if (args.targetType === "puppy_profile" && args.targetId) {
      try {
        const puppy = await ctx.db.get(args.targetId as Id<"puppies">);
        if (puppy && (puppy.userId === args.userId || puppy._id === args.targetId)) {
          await ctx.db.patch(puppy._id, {
            photoUrl: args.url,
            photoPublicId: args.publicId,
            photoFormat: args.format,
            photoSize: args.size,
            photoWidth: args.width,
            photoHeight: args.height,
          });
        }
      } catch (err) {
        console.warn("[saveImageRecord] Could not patch puppy profile:", err);
      }
    }

    // 3. If target is user_avatar, update user record
    if (args.targetType === "user_avatar") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          avatarUrl: args.url,
          avatarPublicId: args.publicId,
          avatarFormat: args.format,
          avatarSize: args.size,
          avatarWidth: args.width,
          avatarHeight: args.height,
        });
      }
    }

    return imageId;
  },
});

/**
 * Internal mutation to delete temporary file from Convex File Storage.
 */
export const cleanupTemporaryStorage = internalMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.storage.delete(args.storageId);
    } catch (err) {
      console.warn("[cleanupTemporaryStorage] Warning deleting temporary storage:", err);
    }
  },
});
