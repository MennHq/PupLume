import test from 'node:test';
import assert from 'node:assert/strict';

import { requireAuthUser, getAuthUser, verifyPuppyAccess } from '../convex/authHelper';

test('7. Convex Authorization: Authentication & IDOR Spoofing Prevention', async (t) => {
  await t.test('requireAuthUser succeeds when authenticated subject matches requestedUserId', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({
          subject: 'user_clerk_123',
          email: 'doglover@example.com',
        }),
      },
    } as any;

    const userId = await requireAuthUser(mockCtx, 'user_clerk_123');
    assert.equal(userId, 'user_clerk_123');
  });

  await t.test('requireAuthUser succeeds without requestedUserId and returns verified identity', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({
          subject: 'user_clerk_456',
          email: 'owner@example.com',
        }),
      },
    } as any;

    const userId = await requireAuthUser(mockCtx);
    assert.equal(userId, 'user_clerk_456');
  });

  await t.test('requireAuthUser strictly rejects IDOR spoofing attempt (requestedUserId !== identity.subject)', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({
          subject: 'attacker_user_id',
          email: 'attacker@example.com',
        }),
      },
    } as any;

    await assert.rejects(
      async () => requireAuthUser(mockCtx, 'victim_user_id'),
      /Forbidden: You cannot access or modify records belonging to another user/
    );
  });

  await t.test('requireAuthUser throws Unauthorized if unauthenticated', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => null,
      },
    } as any;

    await assert.rejects(
      async () => requireAuthUser(mockCtx),
      /Unauthorized: Please log in to perform this action/
    );
  });

  await t.test('getAuthUser returns null if unauthenticated or on spoof attempt', async () => {
    const unauthCtx = {
      auth: { getUserIdentity: async () => null },
    } as any;
    assert.equal(await getAuthUser(unauthCtx), null);

    const spoofCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'user_1' }),
      },
    } as any;
    assert.equal(await getAuthUser(spoofCtx, 'user_2'), null);
  });
});

test('8. Convex Authorization: Multi-Pet & Family Puppy Access', async (t) => {
  await t.test('verifyPuppyAccess allows direct owner of a persisted puppy', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'owner_user_1', email: 'owner@example.com' }),
      },
      db: {
        normalizeId: (table: string, id: string) => (id === 'pup_valid_1' ? ('pup_valid_1' as any) : null),
        get: async (id: any) => ({
          _id: id,
          userId: 'owner_user_1',
          name: 'Buddy',
        }),
      },
    } as any;

    const result = await verifyPuppyAccess(mockCtx, 'pup_valid_1', 'owner_user_1');
    assert.deepEqual(result, { isPersisted: true });
  });

  await t.test('verifyPuppyAccess allows authorized family member by email', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'family_user_2', email: 'spouse@example.com' }),
      },
      db: {
        normalizeId: (table: string, id: string) => (id === 'pup_valid_1' ? ('pup_valid_1' as any) : null),
        get: async (id: any) => ({
          _id: id,
          userId: 'owner_user_1',
          name: 'Buddy',
        }),
        query: (table: string) => ({
          withIndex: (index: string, filterFn: any) => ({
            filter: (predicate: any) => ({
              first: async () => ({
                _id: 'fam_1',
                userId: 'owner_user_1',
                email: 'spouse@example.com',
                role: 'Co-Owner',
              }),
            }),
          }),
        }),
      },
    } as any;

    const result = await verifyPuppyAccess(mockCtx, 'pup_valid_1', 'family_user_2');
    assert.deepEqual(result, { isPersisted: true });
  });

  await t.test('verifyPuppyAccess strictly blocks unauthorized stranger', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'stranger_user_3', email: 'stranger@example.com' }),
      },
      db: {
        normalizeId: (table: string, id: string) => (id === 'pup_valid_1' ? ('pup_valid_1' as any) : null),
        get: async (id: any) => ({
          _id: id,
          userId: 'owner_user_1',
          name: 'Buddy',
        }),
        query: (table: string) => ({
          withIndex: () => ({
            first: async () => null,
            filter: () => ({
              first: async () => null,
            }),
          }),
        }),
      },
    } as any;

    await assert.rejects(
      async () => verifyPuppyAccess(mockCtx, 'pup_valid_1', 'stranger_user_3'),
      /Forbidden: You do not have permission to access or modify records for this puppy/
    );
  });

  await t.test('verifyPuppyAccess throws if puppy does not exist in database', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'user_1', email: 'test@example.com' }),
      },
      db: {
        normalizeId: (table: string, id: string) => ('pup_valid_ghost' as any),
        get: async () => null, // Deleted/phantom puppy
      },
    } as any;

    await assert.rejects(
      async () => verifyPuppyAccess(mockCtx, 'pup_valid_ghost', 'user_1'),
      /Puppy not found/
    );
  });

  await t.test('verifyPuppyAccess returns isPersisted: false for temporary client ID', async () => {
    const mockCtx = {
      auth: {
        getUserIdentity: async () => ({ subject: 'user_1' }),
      },
      db: {
        normalizeId: () => null, // "pup-1" is not a Convex document ID
      },
    } as any;

    const result = await verifyPuppyAccess(mockCtx, 'pup-1', 'user_1');
    assert.deepEqual(result, { isPersisted: false });
  });
});
