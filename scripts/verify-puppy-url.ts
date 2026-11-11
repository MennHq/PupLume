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

console.log('--- TEST SUITE 1: Custom Slug Validation ---');

// 1. Valid slugs for puppy "Leo"
const v1 = validatePuppySlug('leo', 'Leo');
assert(v1.isValid === true, 'Slug "leo" is valid for puppy "Leo"');
assert(v1.cleanedSlug === 'leo', 'Cleaned slug is "leo"');

const v2 = validatePuppySlug('leox', 'Leo');
assert(v2.isValid === true, 'Slug "leox" (4 chars, contains "leo") is valid');

const v3 = validatePuppySlug('myleo', 'Leo');
assert(v3.isValid === true, 'Slug "myleo" (5 chars, contains "leo") is valid');

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

assert(getPuppyDisplayUrl('leo') === 'puplume.com/leo', 'Display URL is puplume.com/leo');
assert(getPuppyPublicUrl('leo', { canonicalDomain: true }) === 'https://puplume.com/leo', 'Canonical URL is https://puplume.com/leo');

console.log('\n--- TEST SUITE 3: Application Routing Architecture ---');
assert(isPublicPuppyPath('/leo') === true, 'Route /leo is recognized as public puppy page');
assert(isPublicPuppyPath('/pup/leo') === true, 'Route /pup/leo is recognized as public puppy page');
assert(isPublicPuppyPath('/safety/leo') === true, 'Route /safety/leo is recognized as public puppy page');
assert(isPublicPuppyPath('/home') === false, 'Route /home is NOT a public puppy page');
assert(isPublicPuppyPath('/tasks') === false, 'Route /tasks is NOT a public puppy page');
assert(isPublicPuppyPath('/puppy') === false, 'Route /puppy is NOT a public puppy page');
assert(isPublicPuppyPath('/academy') === false, 'Route /academy is NOT a public puppy page');
assert(isPublicPuppyPath('/auth') === false, 'Route /auth is NOT a public puppy page');
assert(isPublicPuppyPath('/api/upload') === false, 'Route /api/upload is NOT a public puppy page');
assert(isPublicPuppyPath('/assets/vendor.js') === false, 'Route /assets/vendor.js is NOT a public puppy page');
assert(isPublicPuppyPath('/') === false, 'Root / is NOT a public puppy page');

console.log('\n--- TEST SUITE 4: QR Code Generation for Custom URL ---');
const qrSvg = generatePupLumeQRSvg('https://puplume.com/leo', { size: 400 });
assert(qrSvg.includes('<svg'), 'QR code SVG is generated');
assert(qrSvg.includes('qr-modules'), 'QR code includes module elements');
assert(qrSvg.includes('qr-finders'), 'QR code includes custom rounded finder eyes');
assert(qrSvg.includes('pupQrLogoGrad'), 'QR code includes center logo emblem gradient');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
