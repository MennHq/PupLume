import { PupPageTheme, PupPageFont } from '../types';

export interface ThemeDefinition {
  id: PupPageTheme;
  name: string;
  tagline: string;
  previewBg: string;
  previewAccent: string;
  isDark: boolean;
  backgroundClass: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardClass: string;
  cardSubtleClass: string;
  accentButtonClass: string;
  secondaryButtonClass: string;
  pillTagClass: string;
  borderClass: string;
  scrimGradient: string;
  linkHoverSheen: string;
}

// -------------------------------------------------------------
// PupLume Authentic Brand Themes
// Rooted in PupLume's warm cream (#FFF9F2), baked clay (#8B5E3C),
// organic sage (#3D5A40), and soft peach (#E07A5F) identity.
// -------------------------------------------------------------
export const PUP_PAGE_THEMES: Record<PupPageTheme, ThemeDefinition> = {
  puplume_classic: {
    id: 'puplume_classic',
    name: 'PupLume Signature',
    tagline: 'Warm cream, baked clay & emerald seal',
    previewBg: '#FFF9F2',
    previewAccent: '#8B5E3C',
    isDark: false,
    backgroundClass: 'bg-[#FFF9F2] text-[#2C211B]',
    textPrimary: 'text-[#2C211B]',
    textSecondary: 'text-[#5F4E44]',
    textMuted: 'text-[#766A63]',
    cardClass: 'bg-white border border-[#E8DDD3] shadow-[0_8px_30px_rgba(44,33,27,0.04)]',
    cardSubtleClass: 'bg-[#FFFDF9] border border-[#E8DDD3]',
    accentButtonClass: 'bg-[#8B5E3C] text-white hover:bg-[#5F3E29] shadow-sm shadow-[#8B5E3C]/25',
    secondaryButtonClass: 'bg-[#FFF9F2] text-[#8B5E3C] hover:bg-[#F3E7DA] border border-[#E8DDD3]',
    pillTagClass: 'bg-[#F3E7DA] text-[#8B5E3C] border border-[#E8DDD3]',
    borderClass: 'border-[#E8DDD3]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#8B5E3C] hover:shadow-[0_4px_20px_rgba(139,94,60,0.12)]'
  },
  puplume_sage: {
    id: 'puplume_sage',
    name: 'PupLume Meadow Sage',
    tagline: 'Fresh organic sage, meadow grass & earthy cream',
    previewBg: '#F4F7F2',
    previewAccent: '#3D5A40',
    isDark: false,
    backgroundClass: 'bg-[#F4F7F2] text-[#1E2922]',
    textPrimary: 'text-[#1E2922]',
    textSecondary: 'text-[#3F4F45]',
    textMuted: 'text-[#6A7B70]',
    cardClass: 'bg-white border border-[#D8E2D6] shadow-[0_8px_30px_rgba(61,90,64,0.04)]',
    cardSubtleClass: 'bg-[#F8FAF7] border border-[#D8E2D6]',
    accentButtonClass: 'bg-[#3D5A40] text-white hover:bg-[#2C4230] shadow-sm shadow-[#3D5A40]/25',
    secondaryButtonClass: 'bg-[#F4F7F2] text-[#3D5A40] hover:bg-[#EAF0E8] border border-[#D8E2D6]',
    pillTagClass: 'bg-[#EAF0E8] text-[#3D5A40] border border-[#D8E2D6]',
    borderClass: 'border-[#D8E2D6]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#3D5A40] hover:shadow-[0_4px_20px_rgba(61,90,64,0.12)]'
  },
  puplume_peach: {
    id: 'puplume_peach',
    name: 'PupLume Golden Peach',
    tagline: 'Sunny golden peach, honey apricot & warm clay',
    previewBg: '#FFF8F3',
    previewAccent: '#E07A5F',
    isDark: false,
    backgroundClass: 'bg-[#FFF8F3] text-[#2D1B14]',
    textPrimary: 'text-[#2D1B14]',
    textSecondary: 'text-[#624033]',
    textMuted: 'text-[#916B5C]',
    cardClass: 'bg-white border border-[#F5DDD0] shadow-[0_8px_30px_rgba(224,122,95,0.05)]',
    cardSubtleClass: 'bg-[#FFFDFB] border border-[#F5DDD0]',
    accentButtonClass: 'bg-[#E07A5F] text-white hover:bg-[#C9654C] shadow-sm shadow-[#E07A5F]/25',
    secondaryButtonClass: 'bg-[#FFF8F3] text-[#E07A5F] hover:bg-[#FDECE4] border border-[#F5DDD0]',
    pillTagClass: 'bg-[#FDECE4] text-[#E07A5F] border border-[#F5DDD0]',
    borderClass: 'border-[#F5DDD0]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#E07A5F] hover:shadow-[0_4px_20px_rgba(224,122,95,0.12)]'
  },
  puplume_midnight: {
    id: 'puplume_midnight',
    name: 'PupLume Midnight Pup',
    tagline: 'Tactile dark canvas with warm caramel & cream',
    previewBg: '#181513',
    previewAccent: '#D4A373',
    isDark: true,
    backgroundClass: 'bg-[#181513] text-[#F9F6F0]',
    textPrimary: 'text-[#F9F6F0]',
    textSecondary: 'text-[#D4C8B8]',
    textMuted: 'text-[#8C8276]',
    cardClass: 'bg-[#221E1B] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
    cardSubtleClass: 'bg-[#2A2522] border border-white/8',
    accentButtonClass: 'bg-[#D4A373] text-[#181513] hover:bg-[#C59262] shadow-sm shadow-[#D4A373]/20',
    secondaryButtonClass: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    pillTagClass: 'bg-[#2E2824] text-[#D4A373] border border-white/10',
    borderClass: 'border-white/10',
    scrimGradient: 'from-transparent via-black/40 to-black/90',
    linkHoverSheen: 'hover:border-[#D4A373] hover:shadow-[0_4px_20px_rgba(212,163,115,0.15)]'
  },

  // Backward-compatible aliases mapped to PupLume brand tokens
  warm_editorial: {
    id: 'warm_editorial',
    name: 'PupLume Signature',
    tagline: 'Warm cream, baked clay & emerald seal',
    previewBg: '#FFF9F2',
    previewAccent: '#8B5E3C',
    isDark: false,
    backgroundClass: 'bg-[#FFF9F2] text-[#2C211B]',
    textPrimary: 'text-[#2C211B]',
    textSecondary: 'text-[#5F4E44]',
    textMuted: 'text-[#766A63]',
    cardClass: 'bg-white border border-[#E8DDD3] shadow-[0_8px_30px_rgba(44,33,27,0.04)]',
    cardSubtleClass: 'bg-[#FFFDF9] border border-[#E8DDD3]',
    accentButtonClass: 'bg-[#8B5E3C] text-white hover:bg-[#5F3E29] shadow-sm shadow-[#8B5E3C]/25',
    secondaryButtonClass: 'bg-[#FFF9F2] text-[#8B5E3C] hover:bg-[#F3E7DA] border border-[#E8DDD3]',
    pillTagClass: 'bg-[#F3E7DA] text-[#8B5E3C] border border-[#E8DDD3]',
    borderClass: 'border-[#E8DDD3]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#8B5E3C] hover:shadow-[0_4px_20px_rgba(139,94,60,0.12)]'
  },
  luxe_obsidian: {
    id: 'luxe_obsidian',
    name: 'PupLume Midnight Pup',
    tagline: 'Tactile dark canvas with warm caramel & cream',
    previewBg: '#181513',
    previewAccent: '#D4A373',
    isDark: true,
    backgroundClass: 'bg-[#181513] text-[#F9F6F0]',
    textPrimary: 'text-[#F9F6F0]',
    textSecondary: 'text-[#D4C8B8]',
    textMuted: 'text-[#8C8276]',
    cardClass: 'bg-[#221E1B] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
    cardSubtleClass: 'bg-[#2A2522] border border-white/8',
    accentButtonClass: 'bg-[#D4A373] text-[#181513] hover:bg-[#C59262] shadow-sm shadow-[#D4A373]/20',
    secondaryButtonClass: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    pillTagClass: 'bg-[#2E2824] text-[#D4A373] border border-white/10',
    borderClass: 'border-white/10',
    scrimGradient: 'from-transparent via-black/40 to-black/90',
    linkHoverSheen: 'hover:border-[#D4A373] hover:shadow-[0_4px_20px_rgba(212,163,115,0.15)]'
  },
  minimal_clean: {
    id: 'minimal_clean',
    name: 'PupLume Signature',
    tagline: 'Warm cream, baked clay & emerald seal',
    previewBg: '#FFF9F2',
    previewAccent: '#8B5E3C',
    isDark: false,
    backgroundClass: 'bg-[#FFF9F2] text-[#2C211B]',
    textPrimary: 'text-[#2C211B]',
    textSecondary: 'text-[#5F4E44]',
    textMuted: 'text-[#766A63]',
    cardClass: 'bg-white border border-[#E8DDD3] shadow-[0_8px_30px_rgba(44,33,27,0.04)]',
    cardSubtleClass: 'bg-[#FFFDF9] border border-[#E8DDD3]',
    accentButtonClass: 'bg-[#8B5E3C] text-white hover:bg-[#5F3E29] shadow-sm shadow-[#8B5E3C]/25',
    secondaryButtonClass: 'bg-[#FFF9F2] text-[#8B5E3C] hover:bg-[#F3E7DA] border border-[#E8DDD3]',
    pillTagClass: 'bg-[#F3E7DA] text-[#8B5E3C] border border-[#E8DDD3]',
    borderClass: 'border-[#E8DDD3]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#8B5E3C] hover:shadow-[0_4px_20px_rgba(139,94,60,0.12)]'
  },
  sunset_amber: {
    id: 'sunset_amber',
    name: 'PupLume Golden Peach',
    tagline: 'Sunny golden peach, honey apricot & warm clay',
    previewBg: '#FFF8F3',
    previewAccent: '#E07A5F',
    isDark: false,
    backgroundClass: 'bg-[#FFF8F3] text-[#2D1B14]',
    textPrimary: 'text-[#2D1B14]',
    textSecondary: 'text-[#624033]',
    textMuted: 'text-[#916B5C]',
    cardClass: 'bg-white border border-[#F5DDD0] shadow-[0_8px_30px_rgba(224,122,95,0.05)]',
    cardSubtleClass: 'bg-[#FFFDFB] border border-[#F5DDD0]',
    accentButtonClass: 'bg-[#E07A5F] text-white hover:bg-[#C9654C] shadow-sm shadow-[#E07A5F]/25',
    secondaryButtonClass: 'bg-[#FFF8F3] text-[#E07A5F] hover:bg-[#FDECE4] border border-[#F5DDD0]',
    pillTagClass: 'bg-[#FDECE4] text-[#E07A5F] border border-[#F5DDD0]',
    borderClass: 'border-[#F5DDD0]',
    scrimGradient: 'from-transparent via-black/20 to-black/70',
    linkHoverSheen: 'hover:border-[#E07A5F] hover:shadow-[0_4px_20px_rgba(224,122,95,0.12)]'
  }
};

export const AVAILABLE_PUP_THEMES: PupPageTheme[] = [
  'puplume_classic',
  'puplume_sage',
  'puplume_peach',
  'puplume_midnight'
];

export interface FontDefinition {
  id: PupPageFont;
  name: string;
  sample: string;
  headingClass: string;
  bodyClass: string;
  category: 'PupLume Signature' | 'PupLume UI' | 'Modern Geometric' | 'Precision Sans';
}

export const PUP_PAGE_FONTS: Record<PupPageFont, FontDefinition> = {
  grandstander: {
    id: 'grandstander',
    name: 'Grandstander',
    sample: 'PupLume Brand Signature Face',
    headingClass: "font-['Grandstander',cursive] font-bold tracking-tight",
    bodyClass: "font-['Outfit',sans-serif]",
    category: 'PupLume Signature'
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    sample: 'Warm, Friendly & Clean UI',
    headingClass: "font-['Outfit',sans-serif] font-bold tracking-tight",
    bodyClass: "font-['Outfit',sans-serif]",
    category: 'PupLume UI'
  },
  jakarta: {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    sample: 'Contemporary Geometric Sans',
    headingClass: "font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-tight",
    bodyClass: "font-['Plus_Jakarta_Sans',sans-serif]",
    category: 'Modern Geometric'
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    sample: 'Minimalist Precision UI',
    headingClass: "font-['Inter',sans-serif] font-bold tracking-tight",
    bodyClass: "font-['Inter',sans-serif]",
    category: 'Precision Sans'
  },

  // Backward-compatible aliases
  fraunces: {
    id: 'fraunces',
    name: 'Grandstander',
    sample: 'PupLume Brand Signature Face',
    headingClass: "font-['Grandstander',cursive] font-bold tracking-tight",
    bodyClass: "font-['Outfit',sans-serif]",
    category: 'PupLume Signature'
  },
  space_grotesk: {
    id: 'space_grotesk',
    name: 'Plus Jakarta Sans',
    sample: 'Contemporary Geometric Sans',
    headingClass: "font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-tight",
    bodyClass: "font-['Plus_Jakarta_Sans',sans-serif]",
    category: 'Modern Geometric'
  }
};

export const AVAILABLE_PUP_FONTS: PupPageFont[] = [
  'grandstander',
  'outfit',
  'jakarta',
  'inter'
];

export const DEFAULT_LINK_CATEGORIES = [
  { id: 'social', label: 'Social & Media', icon: 'Share2' },
  { id: 'gear', label: 'Favorite Treats & Gear', icon: 'ShoppingBag' },
  { id: 'service', label: 'Care & Vet Services', icon: 'Stethoscope' },
  { id: 'story', label: 'Story & Pedigree', icon: 'BookOpen' },
  { id: 'custom', label: 'Custom Destination', icon: 'Link2' }
] as const;
