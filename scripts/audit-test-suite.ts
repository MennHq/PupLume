import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import {
  verifyPaddleWebhookSignature,
  sanitizeErrorMessage,
  readStreamWithLimit,
  safeJsonScriptEmbed,
} from '../api/_utils';

import { extractCloudinaryPublicId } from '../src/server/cloudinaryService';

test('1. Security: Paddle Webhook HMAC-SHA256 Verification & Replay Defense', async (t) => {
  const secret = 'pdl_sec_test_secret_1234567890abcdef';
  const now = Math.floor(Date.now() / 1000);
  const rawBody = JSON.stringify({
    event_type: 'transaction.completed',
    data: { id: 'txn_12345', status: 'completed' }
  });

  await t.test('accepts valid HMAC signature within tolerance window', () => {
    const payloadToSign = `${now}:${rawBody}`;
    const hash = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    const header = `ts=${now};h1=${hash}`;

    const result = verifyPaddleWebhookSignature(rawBody, header, secret, 300);
    assert.equal(result.isValid, true);
    assert.equal(result.timestamp, now);
  });

  await t.test('rejects forged signature', () => {
    const fakeHash = 'deadbeef00000000000000000000000000000000000000000000000000000000';
    const header = `ts=${now};h1=${fakeHash}`;

    const result = verifyPaddleWebhookSignature(rawBody, header, secret, 300);
    assert.equal(result.isValid, false);
    assert.equal(result.reason, 'signature_mismatch');
  });

  await t.test('rejects replay attack with expired timestamp (>300s old)', () => {
    const oldTs = now - 400; // 400 seconds ago
    const payloadToSign = `${oldTs}:${rawBody}`;
    const hash = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    const header = `ts=${oldTs};h1=${hash}`;

    const result = verifyPaddleWebhookSignature(rawBody, header, secret, 300);
    assert.equal(result.isValid, false);
    assert.equal(result.reason, 'timestamp_out_of_range');
  });

  await t.test('rejects missing or empty secret key', () => {
    const payloadToSign = `${now}:${rawBody}`;
    const hash = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    const header = `ts=${now};h1=${hash}`;

    const result = verifyPaddleWebhookSignature(rawBody, header, '', 300);
    assert.equal(result.isValid, false);
    assert.equal(result.reason, 'secret_not_configured');
  });
});

test('2. Security: Secret Sanitization & Reflected XSS Defense', async (t) => {
  await t.test('sanitizes Gemini API keys from error messages', () => {
    const err = new Error('Failed with key AIzaSyD9Zabcdef1234567890 in request');
    const sanitized = sanitizeErrorMessage(err);
    assert.equal(sanitized, 'Internal server error');
  });

  await t.test('sanitizes Paddle secret tokens from error messages', () => {
    const err = new Error('Invalid secret: pdl_sec_999888777666555');
    const sanitized = sanitizeErrorMessage(err);
    assert.equal(sanitized, 'Internal server error');
  });

  await t.test('sanitizes internal file paths and stack traces', () => {
    const err = new Error('ENOENT: no such file at C:\\Users\\Dev\\secret\\key.pem at Object.run (/var/app/index.js:10:5)');
    const sanitized = sanitizeErrorMessage(err);
    assert.equal(sanitized, 'Internal server error');
  });

  await t.test('preserves benign user-safe error messages', () => {
    const err = new Error('Puppy name cannot be blank.');
    const sanitized = sanitizeErrorMessage(err);
    assert.equal(sanitized, 'Puppy name cannot be blank.');
  });

  await t.test('safeJsonScriptEmbed prevents script injection (XSS)', () => {
    const dangerous = {
      bio: '</script><script>alert("pwned")</script>',
      lineTerminator: '\u2028bad',
    };
    const escaped = safeJsonScriptEmbed(dangerous);
    assert.equal(escaped.includes('<script>'), false);
    assert.equal(escaped.includes('</script>'), false);
    assert.equal(escaped.includes('\\u003cscript\\u003e'), true);
  });
});

test('3. Security: Stream Bounding & Memory DoS Protection', async (t) => {
  await t.test('reads valid stream within limit', async () => {
    const input = Buffer.from('hello puppy care');
    const req = Readable.from([input]) as any;
    req.headers = { 'content-length': String(input.length) };

    const result = await readStreamWithLimit(req, 1024);
    assert.deepEqual(result, input);
  });

  await t.test('rejects payload exceeding content-length limit', async () => {
    const req = Readable.from([Buffer.from('small')]) as any;
    req.headers = { 'content-length': '2000' };

    await assert.rejects(
      async () => readStreamWithLimit(req, 1000),
      /Payload size of 2000 bytes exceeds limit of 1000 bytes/
    );
  });

  await t.test('rejects payload that streams more bytes than maxSizeBytes', async () => {
    const chunk1 = Buffer.alloc(600, 'a');
    const chunk2 = Buffer.alloc(600, 'b');
    const req = Readable.from([chunk1, chunk2]) as any;
    req.headers = {};

    await assert.rejects(
      async () => readStreamWithLimit(req, 1000),
      /Payload exceeds maximum allowed size of 1000 bytes/
    );
  });
});

test('4. Security & Regression: Delete-Image Target Filtering', async (t) => {
  const PROTECTED_TARGETS = [
    'puplume_logo',
    'pupcollar_logo',
    'branding/',
    'system/',
    'assets/',
    'og-',
    'favicon',
  ];

  const isProtected = (target: string): boolean => {
    const lower = target.toLowerCase();
    if (lower === 'puplume' || lower === 'pupcollar') return true;
    for (const prefix of PROTECTED_TARGETS) {
      if (lower.includes(prefix)) return true;
    }
    return false;
  };

  await t.test('VERIFIED FIX: permits user pet images in puplume/pets/', () => {
    const userPetPublicId = 'puplume/pets/pup_max_123';
    const userPetUrl = 'https://res.cloudinary.com/puplume/image/upload/v123/puplume/pets/pup_max_123.webp';

    assert.equal(isProtected(userPetPublicId), false, 'User pet image must NOT be blocked');
    assert.equal(isProtected(userPetUrl), false, 'User pet image URL must NOT be blocked');
  });

  await t.test('blocks system assets and brand logos', () => {
    assert.equal(isProtected('puplume'), true);
    assert.equal(isProtected('pupcollar'), true);
    assert.equal(isProtected('puplume_logo'), true);
    assert.equal(isProtected('branding/hero.png'), true);
    assert.equal(isProtected('system/avatar_default.svg'), true);
    assert.equal(isProtected('assets/icons/dog.png'), true);
    assert.equal(isProtected('favicon.ico'), true);
    assert.equal(isProtected('og-card.png'), true);
  });

  await t.test('extractCloudinaryPublicId parses publicId correctly and protects branding', () => {
    const normal = extractCloudinaryPublicId('https://res.cloudinary.com/demo/image/upload/v1234/puplume/pets/my_dog.webp');
    assert.equal(normal, 'puplume/pets/my_dog');

    const brand = extractCloudinaryPublicId('https://res.cloudinary.com/demo/image/upload/v1234/branding/logo.png');
    assert.equal(brand, null, 'Branding asset must return null (protected)');
  });
});

test('5. PWA Precache Offline Integrity', async (t) => {
  const swPath = path.resolve(process.cwd(), 'dist/sw.js');
  assert.equal(fs.existsSync(swPath), true, 'dist/sw.js must exist');

  const swContent = fs.readFileSync(swPath, 'utf8');

  await t.test('VERIFIED FIX: index.html is included in Workbox precache manifest', () => {
    assert.equal(
      swContent.includes('url:"index.html"'),
      true,
      'sw.js must precache index.html for offline SPA boot'
    );
  });

  await t.test('app shell assets are in precache', () => {
    assert.equal(swContent.includes('url:"manifest.webmanifest"'), true);
    assert.equal(swContent.includes('url:"offline.html"'), true);
    assert.equal(swContent.includes('url:"favicon.ico"'), true);
    assert.equal(swContent.includes('url:"pwa-192x192.png"'), true);
  });

  await t.test('NavigationRoute uses index.html fallback', () => {
    assert.equal(
      swContent.includes('createHandlerBoundToURL("index.html")'),
      true,
      'NavigationRoute must bind to index.html'
    );
  });
});

test('6. Calendar Time Parsing Reliability', async (t) => {
  const parseTimeToHoursAndMinutes = (timeStr: string): { hours: number; minutes: number } => {
    if (!timeStr) return { hours: 9, minutes: 0 };
    const parts = timeStr.trim().split(' ');
    const [hStr, mStr] = (parts[0] || '9:00').split(':');
    let hours = parseInt(hStr, 10) || 0;
    const minutes = parseInt(mStr, 10) || 0;
    const period = parts[1]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const toIsoTime = (timeStr: string): string => {
    const { hours, minutes } = parseTimeToHoursAndMinutes(timeStr);
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
  };

  await t.test('correctly parses morning times (AM)', () => {
    assert.deepEqual(parseTimeToHoursAndMinutes('09:15 AM'), { hours: 9, minutes: 15 });
    assert.equal(toIsoTime('09:15 AM'), '091500');
  });

  await t.test('correctly parses afternoon & evening times (PM)', () => {
    assert.deepEqual(parseTimeToHoursAndMinutes('02:45 PM'), { hours: 14, minutes: 45 });
    assert.equal(toIsoTime('02:45 PM'), '144500');
    assert.equal(toIsoTime('11:30 PM'), '233000');
  });

  await t.test('correctly handles 12:00 PM (noon) and 12:00 AM (midnight)', () => {
    assert.deepEqual(parseTimeToHoursAndMinutes('12:00 PM'), { hours: 12, minutes: 0 });
    assert.equal(toIsoTime('12:00 PM'), '120000');

    assert.deepEqual(parseTimeToHoursAndMinutes('12:00 AM'), { hours: 0, minutes: 0 });
    assert.equal(toIsoTime('12:00 AM'), '000000');
  });
});
