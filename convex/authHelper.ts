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

  // Allow explicit test execution mode only
  if (process.env.NODE_ENV === "test" || process.env.CONVEX_TEST_MODE === "true") {
    if (requestedUserId && requestedUserId.trim().length > 0) {
      return requestedUserId.trim();
    }
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

  if (process.env.NODE_ENV === "test" || process.env.CONVEX_TEST_MODE === "true") {
    if (requestedUserId && requestedUserId.trim().length > 0) {
      return requestedUserId.trim();
    }
  }

  return null;
}

/**
 * Verifies that the authenticated user has authorized access (owner or family member)
 * to the puppy specified by puppyId.
 * Throws Forbidden error if the puppy belongs to a different family.
 */
export async function verifyPuppyAccess(
  ctx: QueryCtx | MutationCtx,
  puppyId: string,
  userId: string
): Promise<{ isPersisted: boolean }> {
  if (!puppyId) {
    throw new Error("Invalid request: puppyId is required.");
  }

  // 1. Resolve Convex document ID
  const normId = ctx.db.normalizeId("puppies", puppyId);
  if (normId) {
    const puppy = await ctx.db.get(normId);
    if (!puppy) {
      throw new Error("Puppy not found.");
    }

    // Direct owner check
    if (puppy.userId === userId) {
      return { isPersisted: true };
    }

    // Check family membership: get caller's email from identity or users table
    const identity = await ctx.auth.getUserIdentity();
    let callerEmail = identity?.email?.trim().toLowerCase();

    if (!callerEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();
      callerEmail = user?.email?.trim().toLowerCase();
    }

    if (callerEmail) {
      const familyMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_user", (q) => q.eq("userId", puppy.userId))
        .filter((q) => q.eq(q.field("email"), callerEmail))
        .first();

      if (familyMember) {
        return { isPersisted: true };
      }
    }

    throw new Error("Forbidden: You do not have permission to access or modify records for this puppy.");
  }

  // 2. Client-side temporary ID (e.g. "pup-1" during onboarding or before sync)
  return { isPersisted: false };
}
