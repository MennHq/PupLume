import { 
  validatePuppySlug, 
  generateDefaultSlug, 
  getPuppyPublicUrl, 
  getPuppyDisplayUrl, 
  normalizeSlug,
  isPublicPuppyPath,
  RESERVED_SLUGS 
} from '../src/lib/slugHelper';
import { generatePupLumeQRSvg } from '../src/lib/qrCodeGenerator';
import { renderPassportCardPng, renderNotFoundCardPng } from '../api/_ogPassportCard';
import pupMetaHandler from '../api/pup-meta';
import ogPupHandler from '../api/og/pup';

let failed = 0;
let passed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runAllTests() {
  console.log('--- TEST SUITE 1: Custom Slug Validation ---');

  // 1. Valid slugs for puppy "Leo"
  const v1 = validatePuppySlug('leo', 'Leo');
  assert(v1.isValid === true, 'Slug "leo" is valid for puppy "Leo"');
  assert(v1.cleanedSlug === 'leo', 'Cleaned slug is "leo"');

  const v2 = validatePuppySlug('leox', 'Leo');
  assert(v2.isValid === true, 'Slug "leox" (4 chars, contains "leo") is valid');

  const v3 = validatePuppySlug('myleo', 'Leo');
  assert(v3.isValid === true, 'Slug "myleo" (5 chars, contains "leo") is valid');

  // Graxo to Graxo2 shift validation
  const vGraxo = validatePuppySlug('graxo', 'Graxo');
  assert(vGraxo.isValid === true, 'Slug "graxo" is valid for puppy "Graxo"');
  const vGraxo2 = validatePuppySlug('graxo2', 'Graxo');
  assert(vGraxo2.isValid === true, 'Shifted slug "graxo2" (6 chars, contains "graxo") is valid for puppy "Graxo"');

  // Graxzo to Graxzo2 shift validation
  const vGraxzo = validatePuppySlug('graxzo', 'Graxzo');
  assert(vGraxzo.isValid === true, 'Slug "graxzo" is valid for puppy "Graxzo"');
  const vGraxzo2 = validatePuppySlug('graxzo2', 'Graxzo');
  assert(vGraxzo2.isValid === true, 'Shifted slug "graxzo2" (7 chars, contains "graxzo") is valid for puppy "Graxzo"');

  // 2. Length violations (must be 3 to 7 chars)
  const vShort = validatePuppySlug('le', 'Leo');
  assert(vShort.isValid === false, 'Slug "le" (< 3 chars) is rejected');
  assert(Boolean(vShort.errors.length), 'Reports length error for short slug');

  const vLong = validatePuppySlug('leopuppy1', 'Leo');
  assert(vLong.isValid === false, 'Slug "leopuppy1" (> 7 chars) is rejected');
  assert(Boolean(vLong.errors.length), 'Reports length error for long slug');

  // 3. Name inclusion rule
  const vNoName = validatePuppySlug('max', 'Leo');
  assert(vNoName.isValid === false, 'Slug "max" does not contain puppy name "Leo"');
  assert(Boolean(vNoName.errors.containsName), 'Reports containsName error');

  // 4. URL-safe characters rule
  const vSpecial = validatePuppySlug('leo_1', 'Leo');
  assert(vSpecial.isValid === false || vSpecial.cleanedSlug === 'leo-1', 'Slug with underscore normalized or rejected');

  // 5. Reserved route collision
  const vReserved = validatePuppySlug('tasks', 'Tasks');
  assert(vReserved.isValid === false, 'Reserved route "tasks" is rejected');
  assert(Boolean(vReserved.errors.reserved), 'Reports reserved route error');

  const vHome = validatePuppySlug('home', 'Home');
  assert(vHome.isValid === false, 'Reserved route "home" is rejected');

  // 6. Long puppy names (> 7 chars)
  const vLongName = validatePuppySlug('max123', 'Maximilian');
  assert(vLongName.isValid === true, 'Slug "max123" is accepted for long name "Maximilian"');

  console.log('\n--- TEST SUITE 2: Default Slug Generation & URL Formats ---');
  assert(generateDefaultSlug('Leo') === 'leo', 'Default slug for Leo is "leo"');
  assert(generateDefaultSlug('Bella') === 'bella', 'Default slug for Bella is "bella"');
  assert(generateDefaultSlug('Maximilian') === 'maximil', 'Default slug for Maximilian capped at 7 chars');
  assert(generateDefaultSlug('Bo') === 'bopup', 'Short name "Bo" padded to 5 chars');

  const canonicalUrl = getPuppyPublicUrl('graxzo2', { canonicalDomain: true });
  assert(canonicalUrl === 'https://puplumepet.vercel.app/graxzo2', 'Canonical URL is https://puplumepet.vercel.app/graxzo2');
  assert(!canonicalUrl.includes('petttttttpuplume'), 'URL strictly excludes petttttttpuplume');

  const displayUrl = getPuppyDisplayUrl('graxzo2');
  assert(displayUrl.includes('/graxzo2'), 'Display URL includes /graxzo2');
  assert(!displayUrl.includes('petttttttpuplume'), 'Display URL strictly excludes petttttttpuplume');

  console.log('\n--- TEST SUITE 3: Application Routing Architecture ---');
  assert(isPublicPuppyPath('/leo') === true, 'Route /leo is recognized as public puppy page');
  assert(isPublicPuppyPath('/graxzo2') === true, 'Route /graxzo2 is recognized as public puppy page');
  assert(isPublicPuppyPath('/pup/graxzo2') === true, 'Route /pup/graxzo2 is recognized as public puppy page');
  assert(isPublicPuppyPath('/safety/graxzo2') === true, 'Route /safety/graxzo2 is recognized as public puppy page');
  assert(isPublicPuppyPath('/home') === false, 'Route /home is NOT a public puppy page');
  assert(isPublicPuppyPath('/tasks') === false, 'Route /tasks is NOT a public puppy page');
  assert(isPublicPuppyPath('/puppy') === false, 'Route /puppy is NOT a public puppy page');
  assert(isPublicPuppyPath('/academy') === false, 'Route /academy is NOT a public puppy page');
  assert(isPublicPuppyPath('/auth') === false, 'Route /auth is NOT a public puppy page');
  assert(isPublicPuppyPath('/api/upload') === false, 'Route /api/upload is NOT a public puppy page');
  assert(isPublicPuppyPath('/assets/vendor.js') === false, 'Route /assets/vendor.js is NOT a public puppy page');
  assert(isPublicPuppyPath('/') === false, 'Root / is NOT a public puppy page');

  console.log('\n--- TEST SUITE 4: QR Code Generation for Custom URL ---');
  const qrSvg = generatePupLumeQRSvg('https://puplumepet.vercel.app/graxzo2', { size: 400 });
  assert(qrSvg.includes('<svg'), 'QR code SVG is generated');
  assert(qrSvg.includes('qr-modules'), 'QR code includes module elements');
  assert(qrSvg.includes('qr-finders'), 'QR code includes custom rounded finder eyes');
  assert(qrSvg.includes('pupQrLogoGrad'), 'QR code includes center logo emblem gradient');

  console.log('\n--- TEST SUITE 5: Dynamic OpenGraph 1200x630 Card Rendering ---');
  const pngCard = await renderPassportCardPng({
    name: 'Graxzo2',
    breed: 'German Shepherd',
    weightLbs: 14,
    ageWeeks: 24,
    slug: 'graxzo2',
    host: 'puplumepet.vercel.app',
    microchipNumber: '985-GRAXZO2-2026',
    temperament: 'Playful, affectionate & loyal',
  });
  assert(Buffer.isBuffer(pngCard), 'Generated card is a valid Buffer');
  assert(pngCard.length > 50000, `Card PNG buffer is high-resolution (${Math.round(pngCard.length / 1024)} KB)`);

  // PNG magic number check: 89 50 4E 47 0D 0A 1A 0A
  const isPng = pngCard[0] === 0x89 && pngCard[1] === 0x50 && pngCard[2] === 0x4E && pngCard[3] === 0x47;
  assert(isPng, 'Card buffer has valid PNG signature');

  console.log('\n--- TEST SUITE 6: Twitter Crawler OpenGraph SSR Meta Tags ---');
  let mockHeaders: Record<string, string> = {};
  let mockStatusCode = 200;
  let mockBody = '';

  const mockReq: any = {
    headers: {
      'user-agent': 'Twitterbot/1.0',
      host: 'puplumepet.vercel.app',
    },
    query: { slug: 'graxzo2' },
    url: '/graxzo2',
  };

  const mockRes: any = {
    setHeader: (k: string, v: string) => { mockHeaders[k.toLowerCase()] = v; },
    status: (code: number) => {
      mockStatusCode = code;
      return {
        send: (body: string) => { mockBody = body; },
      };
    },
  };

  await pupMetaHandler(mockReq, mockRes);

  assert(mockStatusCode === 200, 'Crawler request returns 200 OK');
  assert(mockHeaders['content-type']?.includes('text/html'), 'Content-Type is text/html');
  assert(mockBody.includes('<meta name="twitter:card" content="summary_large_image" />'), 'Includes twitter:card summary_large_image');
  assert(mockBody.includes('content="https://puplumepet.vercel.app/api/og/pup?slug=graxzo2&amp;v=4"'), 'twitter:image points to dynamic card endpoint');
  assert(mockBody.includes('<meta property="og:image"'), 'Includes og:image meta tag');
  assert(mockBody.includes('Graxzo'), 'Includes puppy name Graxzo in rendered HTML');
  assert(mockBody.includes('graxzo2'), 'Includes custom slug graxzo2 in rendered HTML and image URL');

  console.log('\n--- TEST SUITE 7: Dynamic Backend & Zero Hardcoded Fallbacks ---');
  // 1. Check Not-Found Puppy handling via pupMetaHandler (no hardcoded puppy names or mock dogs)
  let nfHeaders: Record<string, string> = {};
  let nfStatusCode = 200;
  let nfBody = '';
  const mockNfReq: any = {
    headers: { 'user-agent': 'Twitterbot/1.0', host: 'puplumepet.vercel.app' },
    query: { slug: 'totally-nonexistent-pup' },
    url: '/totally-nonexistent-pup',
  };
  const mockNfRes: any = {
    setHeader: (k: string, v: string) => { nfHeaders[k.toLowerCase()] = v; },
    status: (code: number) => {
      nfStatusCode = code;
      return { send: (b: string) => { nfBody = b; } };
    },
  };
  await pupMetaHandler(mockNfReq, mockNfRes);
  assert(nfBody.includes('Puppy Passport Not Found'), 'Unregistered puppy returns "Puppy Passport Not Found"');
  assert(!nfBody.includes('German Shepherd'), 'Does NOT invent German Shepherd for unknown dog');
  assert(!nfBody.includes('Golden Retriever'), 'Does NOT invent Golden Retriever for unknown dog');
  assert(!nfBody.includes('French Bulldog'), 'Does NOT invent French Bulldog for unknown dog');

  // 2. Check Not-Found Card rendering
  const nfPng = await renderNotFoundCardPng('totally-nonexistent-pup');
  assert(Buffer.isBuffer(nfPng), 'renderNotFoundCardPng returns valid Buffer');
  assert(nfPng.length > 30000, `Not-found card is high-res PNG (${Math.round(nfPng.length / 1024)} KB)`);

  // 3. Test dynamic API endpoint /api/og/pup handler directly
  let ogHeaders: Record<string, string> = {};
  let ogStatusCode = 200;
  let ogBody: any = null;
  const mockOgReq: any = {
    method: 'GET',
    headers: { host: 'puplumepet.vercel.app' },
    query: { slug: 'graxzo2' },
  };
  const mockOgRes: any = {
    setHeader: (k: string, v: string) => { ogHeaders[k.toLowerCase()] = v; },
    status: (code: number) => {
      ogStatusCode = code;
      return {
        send: (b: any) => { ogBody = b; },
        json: (j: any) => { ogBody = j; },
        end: () => {},
      };
    },
  };
  await ogPupHandler(mockOgReq, mockOgRes);
  assert(ogStatusCode === 200, '/api/og/pup returns 200 OK for live slug graxzo2');
  assert(ogHeaders['content-type'] === 'image/png', 'Returns image/png');
  assert(Buffer.isBuffer(ogBody), 'Returns dynamic passport card PNG buffer');

  // 4. Test /api/og/pup for unregistered slug returns not-found card
  let ogNfHeaders: Record<string, string> = {};
  let ogNfStatusCode = 200;
  let ogNfBody: any = null;
  const mockOgNfReq: any = {
    method: 'GET',
    headers: { host: 'puplumepet.vercel.app' },
    query: { slug: 'unknown-pup-xyz' },
  };
  const mockOgNfRes: any = {
    setHeader: (k: string, v: string) => { ogNfHeaders[k.toLowerCase()] = v; },
    status: (code: number) => {
      ogNfStatusCode = code;
      return {
        send: (b: any) => { ogNfBody = b; },
        json: (j: any) => { ogNfBody = j; },
        end: () => {},
      };
    },
  };
  await ogPupHandler(mockOgNfReq, mockOgNfRes);
  assert(ogNfStatusCode === 200, '/api/og/pup returns not-found card with 200 for crawlers');
  assert(ogNfHeaders['content-type'] === 'image/png', 'Returns image/png');
  assert(Buffer.isBuffer(ogNfBody), 'Returns not-found PNG buffer');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
