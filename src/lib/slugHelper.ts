/**
 * Custom Puppy Page URL slug validation, formatting, and generation helpers.
 */

export const RESERVED_SLUGS = new Set([
  'home',
  'tasks',
  'plan',
  'ai',
  'academy',
  'more',
  'potty',
  'health',
  'expenses',
  'vault',
  'socialization',
  'journal',
  'recap',
  'puppy',
  'profile',
  'sharing',
  'settings',
  'onboarding',
  'privacy',
  'terms',
  'auth',
  'signin',
  'signup',
  'login',
  'api',
  'pup',
  'safety',
  'p',
  'sw',
  'assets',
  'favicon',
  'robots',
  'paddlelog',
  'share-target',
]);

/**
 * Checks whether a given path is a public puppy route (e.g. /leo, /pup/leo, /safety/leo)
 * as opposed to an internal application view or asset.
 */
export function isPublicPuppyPath(pathname: string): boolean {
  if (!pathname || pathname === '/') return false;
  const clean = pathname.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return false;
  if (clean.startsWith('pup/') || clean === 'pup' || clean.startsWith('safety/') || clean === 'safety') {
    return true;
  }
  if (
    clean.startsWith('assets/') || 
    clean.startsWith('api/') || 
    clean.startsWith('@') ||
    clean.includes('.')
  ) {
    return false;
  }
  if (
    RESERVED_SLUGS.has(clean) || 
    clean === 'sign-in' || 
    clean === 'sign-up' || 
    clean === 'signup' || 
    clean === 'login' || 
    clean === 'paddlelog' ||
    clean === 'share-target'
  ) {
    return false;
  }
  return true;
}

export interface SlugValidationResult {
  isValid: boolean;
  cleanedSlug: string;
  errors: {
    length?: string;
    characters?: string;
    containsName?: string;
    reserved?: string;
  };
  checks: {
    length: boolean;
    characters: boolean;
    containsName: boolean;
    notReserved: boolean;
  };
}

/**
 * Normalizes a raw string into a clean lowercase URL slug.
 */
export function normalizeSlug(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates a puppy URL slug against all requirements:
 * 1. Between 3 and 7 characters.
 * 2. URL-safe characters only (lowercase letters a-z, numbers 0-9, and hyphen).
 * 3. Must contain the puppy's name (or the first 3+ letters if the name is >7 chars).
 * 4. Must not collide with reserved app routes.
 */
export function validatePuppySlug(slug: string, puppyName: string): SlugValidationResult {
  const cleaned = normalizeSlug(slug);
  const cleanName = (puppyName || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  const errors: SlugValidationResult['errors'] = {};

  // Check 1: Length (3 to 7 characters)
  const lengthOk = cleaned.length >= 3 && cleaned.length <= 7;
  if (!lengthOk) {
    if (cleaned.length < 3) {
      errors.length = 'Slug must be at least 3 characters long.';
    } else {
      errors.length = 'Slug cannot exceed 7 characters.';
    }
  }

  // Check 2: URL-safe characters
  const charRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const charactersOk = cleaned.length > 0 && charRegex.test(cleaned);
  if (!charactersOk && cleaned.length > 0) {
    errors.characters = 'Only lowercase letters, numbers, and single hyphens are allowed.';
  }

  // Check 3: Must contain puppy's name
  let nameOk = false;
  if (!cleanName) {
    nameOk = true; // No name to verify against
  } else if (cleanName.length <= 7) {
    // If name is <= 7 characters, the slug must contain the puppy's full name
    nameOk = cleaned.includes(cleanName) || cleaned.replace(/-/g, '').includes(cleanName);
    if (!nameOk) {
      errors.containsName = `Slug must contain your puppy's name ("${cleanName}").`;
    }
  } else {
    // For long puppy names (> 7 characters), slug must contain at least the first 3 characters of the name
    const prefix = cleanName.slice(0, Math.min(cleanName.length, 4));
    nameOk = cleaned.includes(prefix) || cleaned.replace(/-/g, '').includes(prefix.slice(0, 3));
    if (!nameOk) {
      errors.containsName = `Slug must contain at least "${prefix.slice(0, 3)}" from your puppy's name.`;
    }
  }

  // Check 4: Reserved route check
  const notReserved = !RESERVED_SLUGS.has(cleaned);
  if (!notReserved) {
    errors.reserved = `"${cleaned}" is a reserved system keyword. Please pick another slug.`;
  }

  const isValid = lengthOk && charactersOk && nameOk && notReserved;

  return {
    isValid,
    cleanedSlug: cleaned,
    errors,
    checks: {
      length: lengthOk,
      characters: charactersOk,
      containsName: nameOk,
      notReserved,
    },
  };
}

/**
 * Returns an initial suggested slug for a given puppy name:
 * 3 to 7 characters, url-safe, containing the name.
 */
export function generateDefaultSlug(puppyName: string): string {
  if (!puppyName) return 'pup';
  const clean = puppyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  if (clean.length >= 3 && clean.length <= 7) {
    return clean;
  }
  if (clean.length > 7) {
    return clean.slice(0, 7);
  }
  // If < 3 characters (e.g. "Bo", "Al"), pad with "pup" or numbers
  return (clean + 'pup').slice(0, 7);
}

/**
 * Constructs the canonical public URL for a puppy slug.
 * Always returns a clean, direct URL like "https://puplume.com/leo"
 * or "http://localhost:3000/leo" during local development.
 */
export function getPuppyPublicUrl(slugOrName: string, options: { canonicalDomain?: boolean } = {}): string {
  const cleanSlug = normalizeSlug(slugOrName);
  if (!cleanSlug) return '';

  if (options.canonicalDomain) {
    return `https://puplume.com/${cleanSlug}`;
  }

  if (typeof window !== 'undefined') {
    // If local dev or custom preview host, use window.location.origin
    return `${window.location.origin}/${cleanSlug}`;
  }

  return `https://puplume.com/${cleanSlug}`;
}

/**
 * Returns the short display string (e.g. "puplume.com/leo").
 */
export function getPuppyDisplayUrl(slugOrName: string): string {
  const cleanSlug = normalizeSlug(slugOrName);
  return `puplume.com/${cleanSlug || 'your-puppy'}`;
}
