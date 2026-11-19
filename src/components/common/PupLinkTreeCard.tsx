import React, { useState, useMemo, useEffect } from 'react';
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
import { getFaviconCandidates, extractHostname } from '../../lib/faviconExtractor';

interface PupLinkTreeCardProps {
  link: PupCustomLink;
  themeId?: PupPageTheme;
  onClick?: () => void;
}

export const PupLinkTreeCard: React.FC<PupLinkTreeCardProps> = ({ 
  link, 
  themeId = 'puplume_classic',
  onClick 
}) => {
  const theme = PUP_PAGE_THEMES[themeId] || PUP_PAGE_THEMES.puplume_classic;

  // Resolve favicon candidate chain
  const candidates = useMemo(() => {
    return getFaviconCandidates(link.url, link.icon);
  }, [link.url, link.icon]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Reset state if URL changes
  useEffect(() => {
    setCandidateIndex(0);
    setIsLoaded(false);
    setHasFailedAll(false);
  }, [link.url, link.icon]);

  const currentSrc = candidates[candidateIndex] || null;
  const isDataSvg = currentSrc?.startsWith('data:image/svg+xml');

  // Semantic category fallback icon (used "until you fetch" or on complete fallback)
  const renderCategoryIcon = () => {
    switch (link.category) {
      case 'gear':
        return <ShoppingBag className="w-5 h-5 text-amber-700 dark:text-amber-300" />;
      case 'service':
        return <Stethoscope className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />;
      case 'story':
        return <BookOpen className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-rose-700 dark:text-rose-300" />;
      default:
        return <Link2 className="w-5 h-5 text-[#8B5E3C] dark:text-[#E5C378]" />;
    }
  };

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Reject Google's generic fallback 16x16 globe icon
    if (img.naturalWidth <= 16 && img.naturalHeight <= 16 && currentSrc?.includes('gstatic.com')) {
      handleImageError();
      return;
    }
    setIsLoaded(true);
  };

  const hostname = useMemo(() => extractHostname(link.url), [link.url]);

  return (
    <a
      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`group relative w-full p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] ${
        theme.isDark 
          ? 'bg-[#181614]/90 hover:bg-[#201D1A] border border-white/10 hover:border-[#E5C378]/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
          : 'bg-white hover:bg-[#FFFDF9] border border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-[0_2px_12px_rgba(44,33,27,0.03)] hover:shadow-[0_6px_20px_rgba(44,33,27,0.06)]'
      }`}
    >
      {/* Subtle Ambient Hover Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r ${
        theme.isDark ? 'from-white/[0.03] to-transparent' : 'from-black/[0.02] to-transparent'
      }`} />

      <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
        {/* Leading Icon / 100% Extracted Favicon Frame */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 shadow-2xs relative overflow-hidden ${
          theme.isDark 
            ? 'bg-[#26221D] border-white/10 text-[#E5C378]' 
            : 'bg-[#FAF6F0] border-[#E8DDD3] text-[#8B5E3C]'
        }`}>
          {/* 1. Category Fallback / Placeholder (Always rendered "until you fetch" or if failed) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            (isLoaded || isDataSvg) && !hasFailedAll ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {renderCategoryIcon()}
          </div>

          {/* 2. Extracted Favicon Image (Smoothly fades in once loaded) */}
          {currentSrc && !hasFailedAll && (
            <img 
              key={currentSrc}
              src={currentSrc} 
              alt={hostname || 'link favicon'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-6 h-6 object-contain rounded-md relative z-10 transition-all duration-300 ${
                (isLoaded || isDataSvg) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`} 
            />
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
