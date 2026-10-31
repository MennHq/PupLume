/**
 * Contact & Safety Information Validation Utilities
 * Validates international and local phone numbers, finder instructions,
 * reward amounts, and communication platform links.
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleanedValue?: string;
  country?: string;
}

/**
 * Sanitizes phone number input by strictly stripping all alphabet letters
 * and keeping only digits and standard dialing symbols (+, -, (, ), ., space).
 */
export function sanitizePhoneInput(input: string): string {
  if (!input) return '';
  return input.replace(/[a-zA-Z]/g, '').replace(/[^\d+\-()\s.]/g, '');
}

/**
 * KeyDown event handler to block alphabetic letters from being typed in phone inputs.
 */
export function preventLetterInput(e: { key?: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; preventDefault: () => void }): void {
  // Allow shortcuts (Ctrl+C, Ctrl+V, Cmd+A, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  // If user presses any single character that is an alphabetic letter, block it
  if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Validates real, callable phone numbers globally using genuine national and international dial plans.
 * Rejects keyboard mash / fake numbers (e.g. 4564654678446, 1234567890).
 * Supports:
 * - Pakistan: 03XX XXXXXXX (11 digits mobile) & landlines
 * - US/Canada: (NXX) NXX-XXXX (10 digits)
 * - UK: 07XXX XXXXXX (11 digits mobile) & landlines
 * - International: Any genuine country code with '+' (e.g. +92 320 7000700, +1 415-555-2671)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Owner phone number is required.' };
  }

  // Reject alphabetic letters or invalid symbols
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Phone number cannot contain letters.' };
  }

  // Allowed characters only: digits, +, -, (, ), ., and spaces
  if (/[^\d+\-()\s.]/.test(trimmed)) {
    return { isValid: false, error: 'Phone number contains invalid symbols. Only numbers and +, -, () allowed.' };
  }

  // 1. Direct international check if starts with '+'
  if (trimmed.startsWith('+')) {
    const p = parsePhoneNumberFromString(trimmed);
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatInternational(), country: p.country };
    }
    return { isValid: false, error: 'Invalid international phone number. Please check country code and digit count.' };
  }

  const clean = trimmed.replace(/\D/g, '');

  // 2. Local Pakistan format (starts with 03 for mobile, or 02x/04x/05x for landline)
  if (/^03\d{9}$/.test(clean) || /^0[24-9]\d{8,9}$/.test(clean)) {
    const p = parsePhoneNumberFromString(clean, 'PK');
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatNational(), country: 'PK' };
    }
  }

  // 3. Local US / Canada format (10 digits NANP)
  if (clean.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(clean)) {
    const p = parsePhoneNumberFromString(clean, 'US');
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatNational(), country: 'US' };
    }
  }

  // 4. Local UK format (starts with 07 for mobile, 01/02 for landline)
  if (/^0[127]\d{9}$/.test(clean)) {
    const p = parsePhoneNumberFromString(clean, 'GB');
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatNational(), country: 'GB' };
    }
  }

  // 5. Local Australia format (starts with 04, 10 digits)
  if (/^04\d{8}$/.test(clean)) {
    const p = parsePhoneNumberFromString(clean, 'AU');
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatNational(), country: 'AU' };
    }
  }

  // 6. Local India format (10 digits starting with 6, 7, 8, or 9)
  if (/^[6-9]\d{9}$/.test(clean)) {
    const p = parsePhoneNumberFromString(clean, 'IN');
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatNational(), country: 'IN' };
    }
  }

  // 7. Full international number entered without '+' prefix (e.g. 923207000700 or 14155552671)
  if (clean.length >= 10 && clean.length <= 15) {
    const p = parsePhoneNumberFromString('+' + clean);
    if (p && p.isValid()) {
      return { isValid: true, cleanedValue: p.formatInternational(), country: p.country };
    }
  }

  return { 
    isValid: false, 
    error: 'Please enter a valid number' 
  };
}

/**
 * Auto-detects the 2-letter ISO country code from partial or complete phone number input.
 * Supports international prefix (+92, +1, +44, etc.) and common national mobile prefixes (03, 07, 04, etc.)
 */
export function detectCountryCode(phone?: string): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // 1. Direct international '+' check
  if (trimmed.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (parsed && parsed.country) return parsed.country;

    // Fast prefix matching while user is still typing country code
    const cleanPlus = trimmed.replace(/[^\d+]/g, '');
    if (cleanPlus.startsWith('+92')) return 'PK';
    if (cleanPlus.startsWith('+1')) return 'US';
    if (cleanPlus.startsWith('+44')) return 'GB';
    if (cleanPlus.startsWith('+971')) return 'AE';
    if (cleanPlus.startsWith('+966')) return 'SA';
    if (cleanPlus.startsWith('+91')) return 'IN';
    if (cleanPlus.startsWith('+49')) return 'DE';
    if (cleanPlus.startsWith('+33')) return 'FR';
    if (cleanPlus.startsWith('+61')) return 'AU';
    if (cleanPlus.startsWith('+81')) return 'JP';
    if (cleanPlus.startsWith('+86')) return 'CN';
    if (cleanPlus.startsWith('+90')) return 'TR';
    if (cleanPlus.startsWith('+39')) return 'IT';
    if (cleanPlus.startsWith('+34')) return 'ES';
    if (cleanPlus.startsWith('+7')) return 'RU';
  }

  const clean = trimmed.replace(/\D/g, '');
  if (!clean) return null;

  // 2. Direct calling code entered without '+'
  if (clean.startsWith('92') && clean.length >= 3) return 'PK';
  if (clean.startsWith('44') && clean.length >= 4) return 'GB';
  if (clean.startsWith('971') && clean.length >= 4) return 'AE';
  if (clean.startsWith('91') && clean.length >= 4) return 'IN';
  if (clean.startsWith('1') && clean.length >= 10) return 'US';

  // 3. National mobile and area prefixes
  if (/^03\d*/.test(clean)) return 'PK';
  if (/^0[24-9]\d*/.test(clean) && clean.length >= 3) return 'PK';
  if (/^07\d*/.test(clean)) return 'GB';
  if (/^04\d*/.test(clean)) return 'AU';
  if (/^[2-9]\d{2}/.test(clean) && clean.length <= 10) return 'US';

  const parsed = parsePhoneNumberFromString('+' + clean);
  if (parsed && parsed.country) return parsed.country;

  return null;
}

/**
 * Validates finder emergency handling instructions
 * Must be non-empty and contain meaningful guidance (at least 5 characters).
 */
export function validateFinderInstructions(instructions: string): ValidationResult {
  const trimmed = instructions.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Instructions for finder are required so anyone finding your puppy knows how to handle them.' };
  }

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Please enter at least 5 characters of care instructions (e.g. Loves treats, do not chase).' };
  }

  return { isValid: true, cleanedValue: trimmed };
}

/**
 * Validates optional reward amount
 */
export function validateRewardAmount(reward?: string): ValidationResult {
  if (!reward) return { isValid: true, cleanedValue: '' };
  const trimmed = reward.trim();
  if (!trimmed) return { isValid: true, cleanedValue: '' };

  if (trimmed.length > 60) {
    return { isValid: false, error: 'Reward description is too long (maximum 60 characters).' };
  }

  return { isValid: true, cleanedValue: trimmed };
}

/**
 * Validates communication app link or handle
 */
export function validateCommunicationLink(platformId: string, value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: true, cleanedValue: '' };
  }

  if (platformId === 'whatsapp') {
    const isUrl = /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/.+/i.test(trimmed);
    const digits = trimmed.replace(/\D/g, '');
    if (!isUrl) {
      if (/[a-zA-Z]/.test(trimmed)) {
        return { isValid: false, error: 'WhatsApp requires a valid phone number or wa.me/ link.' };
      }
      if (digits.length < 7 || digits.length > 15) {
        return { isValid: false, error: 'WhatsApp phone number must have 7 to 15 digits.' };
      }
    }
    return { isValid: true, cleanedValue: trimmed };
  }

  if (platformId === 'instagram') {
    const clean = trimmed.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
    if (!clean || !/^[a-zA-Z0-9._]{1,30}$/.test(clean)) {
      return { isValid: false, error: 'Enter a valid Instagram username (e.g. @username) or profile link.' };
    }
    return { isValid: true, cleanedValue: trimmed };
  }

  if (platformId === 'telegram') {
    const clean = trimmed.replace(/^https?:\/\/(www\.)?t\.me\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
    if (!clean || !/^[a-zA-Z0-9_]{3,32}$/.test(clean)) {
      return { isValid: false, error: 'Enter a valid Telegram username or t.me/ link.' };
    }
    return { isValid: true, cleanedValue: trimmed };
  }

  if (platformId === 'external') {
    const withProtocol = /^[a-zA-Z]+:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(withProtocol);
      if (!url.hostname || !url.hostname.includes('.')) {
        return { isValid: false, error: 'Enter a valid website URL (e.g. mypet.com).' };
      }
      return { isValid: true, cleanedValue: trimmed };
    } catch {
      return { isValid: false, error: 'Enter a valid website URL.' };
    }
  }

  return { isValid: true, cleanedValue: trimmed };
}
