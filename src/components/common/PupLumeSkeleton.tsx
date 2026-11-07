import React from 'react';

interface PupLumeSkeletonProps {
  label?: string;
  variant?: 'app' | 'card' | 'insight';
}

export const PupLumeSkeleton: React.FC<PupLumeSkeletonProps> = ({
  label = 'Loading PupLume...',
  variant = 'app'
}) => {
  // Inline text skeleton for AI daily tips & insights
  if (variant === 'insight') {
    return (
      <div className="space-y-2 py-1.5 w-full" aria-busy="true" aria-label={label}>
        <div className="w-[85%] h-4 rounded-md puplume-shimmer" />
        <div className="w-[60%] h-4 rounded-md puplume-shimmer" />
      </div>
    );
  }

  // Card skeleton for lazy-loaded modals and views
  if (variant === 'card') {
    return (
      <div 
        className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-4 my-2" 
        aria-busy="true" 
        aria-label={label}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl puplume-shimmer-deep shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-3/5 h-5 rounded-lg puplume-shimmer" />
            <div className="w-2/5 h-3.5 rounded-md puplume-shimmer" />
          </div>
        </div>
        <div className="w-full h-11 rounded-xl puplume-shimmer" />
      </div>
    );
  }

  // Full native app skeleton: mirrors PupLume's exact layout with warm bronze shimmer loops
  return (
    <div 
      className="min-h-screen bg-[#FFF9F2] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto w-full select-none" 
      aria-busy="true" 
      aria-label={label}
    >
      <div className="space-y-4">
        {/* Top App Header */}
        <div className="flex items-center justify-between pt-1 pb-1">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl puplume-shimmer-deep shadow-xs shrink-0" />
            <div className="w-24 h-5 rounded-md puplume-shimmer" />
          </div>

          {/* Puppy Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDFB] border-2 border-[#E5D2C1] shadow-xs">
            <div className="w-5 h-5 rounded-full puplume-shimmer-deep shrink-0" />
            <div className="w-16 h-4 rounded-md puplume-shimmer" />
          </div>

          {/* User Profile Avatar */}
          <div className="w-9 h-9 rounded-full puplume-shimmer-deep shadow-xs shrink-0" />
        </div>

        {/* 1. Hero Puppy Card */}
        <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            {/* Puppy Photo Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl puplume-shimmer-deep shadow-xs shrink-0" />
            
            {/* Name, Breed & Age Chips */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="w-40 h-6 rounded-lg puplume-shimmer" />
                <div className="w-16 h-5 rounded-full puplume-shimmer shrink-0" />
              </div>
              <div className="w-52 h-4 rounded-md puplume-shimmer" />
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-11 h-11 rounded-xl puplume-shimmer shrink-0" />
            <div className="w-11 h-11 rounded-xl puplume-shimmer shrink-0" />
            <div className="flex-1 h-11 rounded-xl puplume-shimmer" />
            <div className="flex-1 h-11 rounded-xl puplume-shimmer" />
          </div>
        </div>

        {/* 2. Daily Routine Progress Card */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-36 h-4.5 rounded-md puplume-shimmer" />
            <div className="w-18 h-5 rounded-full puplume-shimmer" />
          </div>
          {/* Progress bar track with active shimmering fill */}
          <div className="w-full h-3.5 rounded-full bg-[#E5D2C1]/40 overflow-hidden">
            <div className="w-3/5 h-full rounded-full puplume-shimmer-deep" />
          </div>
          <div className="w-28 h-3.5 rounded-md puplume-shimmer" />
        </div>

        {/* 3 & 4. Twin Quick Tracker Cards (Potty & Health) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Potty Tracking Card */}
          <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl puplume-shimmer-deep" />
              <div className="w-3 h-3 rounded-full puplume-shimmer" />
            </div>
            <div className="w-24 h-4.5 rounded-md puplume-shimmer" />
            <div className="w-18 h-3.5 rounded-md puplume-shimmer" />
          </div>

          {/* Health & Vet Center Card */}
          <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl puplume-shimmer-deep" />
              <div className="w-14 h-4.5 rounded-full puplume-shimmer" />
            </div>
            <div className="w-28 h-4.5 rounded-md puplume-shimmer" />
            <div className="w-20 h-3.5 rounded-md puplume-shimmer" />
          </div>
        </div>

        {/* 5. Next Up Routine Activity Card */}
        <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-22 h-5 rounded-full puplume-shimmer" />
            <div className="w-28 h-4 rounded-md puplume-shimmer" />
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="space-y-2 flex-1">
              <div className="w-48 h-5 rounded-md puplume-shimmer" />
              <div className="w-36 h-3.5 rounded-md puplume-shimmer" />
            </div>
            <div className="w-11 h-11 rounded-2xl puplume-shimmer-deep shrink-0" />
          </div>
        </div>
      </div>

      {/* 6. Bottom Navigation Bar */}
      <div className="bg-[#FFFDFB] rounded-2xl p-3 border-2 border-[#E5D2C1] flex items-center justify-around shadow-xs mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-1 px-2">
            <div className="w-7 h-7 rounded-lg puplume-shimmer shrink-0" />
            <div className="w-9 h-2.5 rounded-full puplume-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};
