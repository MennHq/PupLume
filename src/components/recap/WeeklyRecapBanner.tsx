import React, { useState } from 'react';
import { Sparkles, ChevronRight, Award, Calendar, X, Clock, AlertCircle } from 'lucide-react';
import { PuppyProfile } from '../../types';
import { getPuppyAgeInfo, getWeeklyRecapData } from '../../lib/recapEngine';

interface WeeklyRecapBannerProps {
  puppy: PuppyProfile;
  onOpenRecap: () => void;
}

export const WeeklyRecapBanner: React.FC<WeeklyRecapBannerProps> = ({ puppy, onOpenRecap }) => {
  const ageInfo = getPuppyAgeInfo(puppy);
  const recap = getWeeklyRecapData(puppy, 0);

  const storageKey = `dismissed_weekly_banner_${puppy.id}_w${ageInfo.currentWeekNumber}`;
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(storageKey) === 'true';
  });

  if (isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  const isOffTrack = recap.scoreBreakdown.score < 3.5;
  const isNeedsWork = recap.scoreBreakdown.score < 6.5;

  return (
    <div
      onClick={onOpenRecap}
      className={`relative overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group ${
        isOffTrack 
          ? 'bg-gradient-to-br from-[#FFF9F6] via-[#FFF5EF] to-[#FAF0E6] border-[#EACEC3] hover:border-[#C46849]/50' 
          : isNeedsWork 
          ? 'bg-gradient-to-br from-[#FFFBF2] via-[#FFF6E9] to-[#FAF2E4] border-[#EAD7C4] hover:border-[#8B5E3C]/50' 
          : 'bg-gradient-to-br from-[#FFF9F2] via-[#FFF4E8] to-[#F3E7DA] border-[#E8DDD3] hover:border-[#8B5E3C]/50'
      }`}
    >
      {/* Warm ambient background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#8B5E3C]/5 blur-2xl pointer-events-none" />

      <div className="flex items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Theme-aligned icon container */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform ${
            isOffTrack 
              ? 'bg-[#A45238] text-white' 
              : isNeedsWork 
              ? 'bg-[#A86438] text-white' 
              : 'bg-[#8B5E3C] text-white'
          }`}>
            {isOffTrack ? (
              <AlertCircle className="w-6 h-6 text-white/95" />
            ) : isNeedsWork ? (
              <Clock className="w-6 h-6 text-amber-200" />
            ) : (
              <Award className="w-6 h-6 text-amber-200" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isOffTrack 
                  ? 'bg-[#F6E8E2] text-[#8C3F24] border-[#EACEC3]' 
                  : isNeedsWork 
                  ? 'bg-[#F9EDE0] text-[#8C4E28] border-[#EBD6C4]' 
                  : 'bg-[#F3E7DA] text-[#5F3E29] border-[#E8DDD3]'
              }`}>
                {isOffTrack 
                  ? `Weekly Audit • Score: ${recap.scoreBreakdown.score}/10` 
                  : `Week ${ageInfo.currentWeekNumber} • Score: ${recap.scoreBreakdown.score}/10`}
              </span>
              <span className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#A86438]" />
                {recap.displayRange}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-[#2C211B] mt-1 flex items-center gap-1.5 truncate">
              {isOffTrack
                ? `🐾 ${puppy.name}'s Routine Needs Focus`
                : isNeedsWork
                ? `🐾 ${puppy.name}'s Routine Building Up`
                : `🐾 ${puppy.name}'s Weekly Paw-gress Report is Live!`}
            </h3>

            <p className="text-xs text-[#766A63] mt-0.5 line-clamp-1">
              {isOffTrack 
                ? `${recap.tasks.completed}/${recap.tasks.total} habits completed • Tap to review action plan`
                : `${recap.tasks.completed}/${recap.tasks.total} habits completed • ${recap.potty.totalLogs > 0 ? `${recap.potty.reliabilityRate}% potty accuracy` : '0 breaks logged'} • Tap to view full breakdown`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-0.5 text-xs font-bold text-[#8B5E3C] group-hover:text-[#5F3E29] group-hover:translate-x-0.5 transition-all">
            {isOffTrack ? 'Review Plan' : 'View Recap'} <ChevronRight className="w-4 h-4" />
          </span>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-xl hover:bg-black/5 text-[#A69B95] hover:text-[#5F3E29] transition-colors cursor-pointer"
            title="Dismiss until next cycle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
