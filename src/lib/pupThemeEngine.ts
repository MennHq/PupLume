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

export const PUP_PAGE_THEMES: Record<PupPageTheme, ThemeDefinition> = {
  luxe_obsidian: {
    id: 'luxe_obsidian',
    name: 'Luxe Obsidian',
    tagline: 'Titanium noir & champagne gold',
    previewBg: '#121110',
    previewAccent: '#E5C378',
    isDark: true,
    backgroundClass: 'bg-[#0E0D0C] text-[#FDFCFB]',
    textPrimary: 'text-[#FDFCFB]',
    textSecondary: 'text-[#C7BEAF]',
    textMuted: 'text-[#877E71]',
    cardClass: 'bg-[#181614]/95 border border-white/12 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
    cardSubtleClass: 'bg-[#221F1C]/90 border border-white/8',
    accentButtonClass: 'bg-[#E5C378] text-[#141210] hover:bg-[#D4AF37] shadow-md shadow-[#E5C378]/15',
    secondaryButtonClass: 'bg-white/10 text-white hover:bg-white/15 border border-white/15',
    pillTagClass: 'bg-[#26221D] text-[#E5C378] border border-[#E5C378]/30',
    borderClass: 'border-white/10',
    scrimGradient: 'from-transparent via-black/40 to-black/90',
    linkHoverSheen: 'hover:border-[#E5C378]/60 hover:shadow-[0_4px_20px_rgba(229,195,120,0.12)]'
  },
  warm_editorial: {
    id: 'warm_editorial',
    name: 'Warm Editorial',
    tagline: 'Heritage cream & rich espresso roast',
    previewBg: '#FAF6F0',
    previewAccent: '#8B5E3C',
    isDark: false,
    backgroundClass: 'bg-[#FAF6F0] text-[#1C140E]',
    textPrimary: 'text-[#1C140E]',
    textSecondary: 'text-[#5F4E44]',
    textMuted: 'text-[#8C7A70]',
    cardClass: 'bg-white border border-[#EFE8E1] shadow-[0_8px_30px_rgba(44,33,27,0.04)]',
    cardSubtleClass: 'bg-[#FAF6F0]/80 border border-[#EFE8E1]',
    accentButtonClass: 'bg-[#8B5E3C] text-white hover:bg-[#6D492F] shadow-sm shadow-[#8B5E3C]/20',
    secondaryButtonClass: 'bg-[#FAF6F0] text-[#8B5E3C] hover:bg-[#F3E7DA] border border-[#EFE8E1]',
    pillTagClass: 'bg-[#FFF9F2] text-[#8B5E3C] border border-[#E8DDD3]',
    borderClass: 'border-[#EFE8E1]',
    scrimGradient: 'from-transparent via-black/30 to-black/80',
    linkHoverSheen: 'hover:border-[#8B5E3C]/50 hover:shadow-[0_4px_20px_rgba(139,94,60,0.08)]'
  },
  minimal_clean: {
    id: 'minimal_clean',
    name: 'Minimalist Clean',
    tagline: 'Nordic pearl white & crisp slate',
    previewBg: '#F8F9FA',
    previewAccent: '#09090B',
    isDark: false,
    backgroundClass: 'bg-[#F8F9FA] text-[#09090B]',
    textPrimary: 'text-[#09090B]',
    textSecondary: 'text-[#475569]',
    textMuted: 'text-[#94A3B8]',
    cardClass: 'bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)]',
    cardSubtleClass: 'bg-slate-50 border border-slate-200',
    accentButtonClass: 'bg-[#09090B] text-white hover:bg-slate-800 shadow-sm shadow-black/15',
    secondaryButtonClass: 'bg-white text-[#09090B] hover:bg-slate-100 border border-slate-200',
    pillTagClass: 'bg-slate-100 text-slate-800 border border-slate-200',
    borderClass: 'border-slate-200',
    scrimGradient: 'from-transparent via-black/30 to-black/80',
    linkHoverSheen: 'hover:border-slate-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
  },
  sunset_amber: {
    id: 'sunset_amber',
    name: 'Sunset Amber',
    tagline: 'Warm terracotta clay & desert caramel',
    previewBg: '#FAF4ED',
    previewAccent: '#C85A17',
    isDark: false,
    backgroundClass: 'bg-[#FAF4ED] text-[#2E180E]',
    textPrimary: 'text-[#2E180E]',
    textSecondary: 'text-[#6B4226]',
    textMuted: 'text-[#9E6B47]',
    cardClass: 'bg-white border border-[#F2DECE] shadow-[0_6px_24px_rgba(200,90,23,0.05)]',
    cardSubtleClass: 'bg-[#FDF7F2] border border-[#F2DECE]',
    accentButtonClass: 'bg-[#C85A17] text-white hover:bg-[#A8480F] shadow-sm shadow-[#C85A17]/20',
    secondaryButtonClass: 'bg-[#FDF7F2] text-[#C85A17] hover:bg-[#F9ECE0] border border-[#F2DECE]',
    pillTagClass: 'bg-[#FFF5ED] text-[#C85A17] border border-[#F5D8C2]',
    borderClass: 'border-[#F2DECE]',
    scrimGradient: 'from-transparent via-black/30 to-black/80',
    linkHoverSheen: 'hover:border-[#C85A17]/50 hover:shadow-[0_4px_20px_rgba(200,90,23,0.1)]'
  }
};

export interface FontDefinition {
  id: PupPageFont;
  name: string;
  sample: string;
  headingClass: string;
  bodyClass: string;
  category: 'Modern Sans' | 'Geometric' | 'Editorial Serif' | 'Neo-Grotesque' | 'Tech Mono-Sans';
}

export const PUP_PAGE_FONTS: Record<PupPageFont, FontDefinition> = {
  jakarta: {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    sample: 'Agile & Contemporary Luxury',
    headingClass: "font-['Plus_Jakarta_Sans',sans-serif] tracking-tight",
    bodyClass: "font-['Plus_Jakarta_Sans',sans-serif]",
    category: 'Modern Sans'
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    sample: 'Geometric, Friendly & Warm',
    headingClass: "font-['Outfit',sans-serif] tracking-tight",
    bodyClass: "font-['Outfit',sans-serif]",
    category: 'Geometric'
  },
  fraunces: {
    id: 'fraunces',
    name: 'Fraunces Editorial',
    sample: 'Heritage Canine Elegance',
    headingClass: "font-['Fraunces',serif] font-black tracking-tight",
    bodyClass: "font-['Plus_Jakarta_Sans',sans-serif]",
    category: 'Editorial Serif'
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    sample: 'Surgical & Ultra-Clean',
    headingClass: "font-['Inter',sans-serif] font-black tracking-tight",
    bodyClass: "font-['Inter',sans-serif]",
    category: 'Neo-Grotesque'
  },
  space_grotesk: {
    id: 'space_grotesk',
    name: 'Space Grotesk',
    sample: 'Modern Digital Monospace Accent',
    headingClass: "font-['Space_Grotesk',sans-serif] font-bold tracking-tight",
    bodyClass: "font-['Plus_Jakarta_Sans',sans-serif]",
    category: 'Tech Mono-Sans'
  }
};

export const DEFAULT_LINK_CATEGORIES = [
  { id: 'social', label: 'Social & Media', icon: 'Share2' },
  { id: 'gear', label: 'Favorite Treats & Gear', icon: 'ShoppingBag' },
  { id: 'service', label: 'Care & Vet Services', icon: 'Stethoscope' },
  { id: 'story', label: 'Story & Pedigree', icon: 'BookOpen' },
  { id: 'custom', label: 'Custom Destination', icon: 'Link2' }
] as const;
