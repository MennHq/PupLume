import React from 'react';
import { 
  ExternalLink, 
  ChevronRight, 
  ShoppingBag, 
  Share2, 
  Stethoscope, 
  BookOpen, 
  Link2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { PupCustomLink, PupPageTheme } from '../../types';
import { PUP_PAGE_THEMES } from '../../lib/pupThemeEngine';

interface PupLinkTreeCardProps {
  link: PupCustomLink;
  themeId?: PupPageTheme;
  onClick?: () => void;
}

export const PupLinkTreeCard: React.FC<PupLinkTreeCardProps> = ({ 
  link, 
  themeId = 'warm_editorial',
  onClick 
}) => {
  const theme = PUP_PAGE_THEMES[themeId] || PUP_PAGE_THEMES.warm_editorial;

  const getCategoryIcon = () => {
    switch (link.category) {
      case 'gear':
        return <ShoppingBag className="w-4 h-4" />;
      case 'service':
        return <Stethoscope className="w-4 h-4" />;
      case 'story':
        return <BookOpen className="w-4 h-4" />;
      case 'social':
        return <Share2 className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  const favicon = getFaviconUrl(link.url);

  return (
    <a
      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`group relative w-full p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] ${
        theme.isDark 
          ? 'bg-[#181614]/90 hover:bg-[#201D1A] border border-white/10 hover:border-[#E5C378]/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
          : 'bg-white hover:bg-[#FFFDF9] border border-[#EFE8E1] hover:border-[#8B5E3C]/40 shadow-[0_2px_12px_rgba(44,33,27,0.03)] hover:shadow-[0_6px_20px_rgba(44,33,27,0.06)]'
      }`}
    >
      {/* Subtle Ambient Hover Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r ${
        theme.isDark ? 'from-white/[0.03] to-transparent' : 'from-black/[0.02] to-transparent'
      }`} />

      <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
        {/* Leading Icon / Favicon Frame */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
          theme.isDark 
            ? 'bg-[#26221D] border-white/10 text-[#E5C378]' 
            : 'bg-[#FAF6F0] border-[#E8DDD3] text-[#8B5E3C]'
        }`}>
          {favicon ? (
            <img 
              src={favicon} 
              alt="" 
              className="w-5 h-5 object-contain rounded-xs"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }} 
            />
          ) : (
            getCategoryIcon()
          )}
        </div>

        {/* Content Labels */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-extrabold truncate transition-colors ${
              theme.isDark 
                ? 'text-[#FDFCFB] group-hover:text-[#E5C378]' 
                : 'text-[#1C140E] group-hover:text-[#8B5E3C]'
            }`}>
              {link.title}
            </h4>
            {link.highlight && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                theme.isDark 
                  ? 'bg-[#E5C378]/20 text-[#E5C378] border border-[#E5C378]/40' 
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{link.badgeText || 'Featured'}</span>
              </span>
            )}
          </div>
          {link.subtitle && (
            <p className={`text-xs mt-0.5 truncate font-medium ${
              theme.isDark ? 'text-[#A89F91]' : 'text-[#766A63]'
            }`}>
              {link.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Trailing Action Icon with Sliding Motion */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 relative z-10 ${
        theme.isDark 
          ? 'bg-white/5 text-[#A89F91] group-hover:text-[#E5C378] group-hover:bg-[#E5C378]/10' 
          : 'bg-[#FAF6F0] text-[#766A63] group-hover:text-[#8B5E3C] group-hover:bg-[#F3E7DA]'
      }`}>
        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
};
