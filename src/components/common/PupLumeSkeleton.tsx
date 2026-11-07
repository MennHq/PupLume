import React from 'react';
import { SkeletonBox } from 'skullet/react';

interface PupLumeSkeletonProps {
  label?: string;
  variant?: 'app' | 'card' | 'insight';
}

export const PupLumeSkeleton: React.FC<PupLumeSkeletonProps> = ({
  label = 'Loading PupLume...',
  variant = 'app'
}) => {
  if (variant === 'insight') {
    return (
      <div className="space-y-2 py-1 w-full" aria-busy="true" aria-label={label}>
        <SkeletonBox width="85%" height="13px" radius="6px" />
        <SkeletonBox width="65%" height="13px" radius="6px" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-3xl p-5 border border-[#E8DDD3] shadow-xs space-y-3" aria-busy="true" aria-label={label}>
        <div className="flex items-center gap-3">
          <SkeletonBox width="48px" height="48px" radius="16px" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBox width="60%" height="14px" radius="6px" />
            <SkeletonBox width="40%" height="11px" radius="4px" />
          </div>
        </div>
        <SkeletonBox width="100%" height="32px" radius="12px" />
      </div>
    );
  }

  // Default 'app' screen skeleton: mirrors PupLume's exact mobile layout
  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto w-full select-none" aria-busy="true" aria-label={label}>
      <div className="space-y-5">
        {/* Top App Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <SkeletonBox width="36px" height="36px" radius="12px" />
            <SkeletonBox width="84px" height="18px" radius="6px" />
          </div>
          <SkeletonBox width="110px" height="32px" radius="999px" />
          <SkeletonBox width="36px" height="36px" radius="50%" />
        </div>

        {/* Hero Puppy Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8DDD3] shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            <SkeletonBox width="64px" height="64px" radius="20px" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonBox width="55%" height="20px" radius="6px" />
                <SkeletonBox width="48px" height="18px" radius="999px" />
              </div>
              <SkeletonBox width="70%" height="13px" radius="4px" />
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 pt-1 overflow-hidden">
            <SkeletonBox width="38px" height="34px" radius="12px" />
            <SkeletonBox width="38px" height="34px" radius="12px" />
            <SkeletonBox width="88px" height="34px" radius="14px" />
            <SkeletonBox width="100px" height="34px" radius="14px" />
          </div>
        </div>

        {/* Daily Routine Summary Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8DDD3] space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonBox width="110px" height="13px" radius="4px" />
            <SkeletonBox width="50px" height="13px" radius="4px" />
          </div>
          <SkeletonBox width="100%" height="8px" radius="999px" />
        </div>

        {/* Twin Quick Tracker Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-[#E8DDD3] space-y-2">
            <SkeletonBox width="28px" height="28px" radius="8px" />
            <SkeletonBox width="70%" height="14px" radius="4px" />
            <SkeletonBox width="50%" height="11px" radius="4px" />
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E8DDD3] space-y-2">
            <SkeletonBox width="28px" height="28px" radius="8px" />
            <SkeletonBox width="80%" height="14px" radius="4px" />
            <SkeletonBox width="60%" height="11px" radius="4px" />
          </div>
        </div>

        {/* Next Up Activity Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8DDD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox width="70px" height="18px" radius="999px" />
            <SkeletonBox width="90px" height="12px" radius="4px" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1.5 flex-1">
              <SkeletonBox width="65%" height="16px" radius="6px" />
              <SkeletonBox width="45%" height="12px" radius="4px" />
            </div>
            <SkeletonBox width="34px" height="34px" radius="10px" />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#E8DDD3] flex items-center justify-around shadow-xs mt-6">
        <SkeletonBox width="26px" height="26px" radius="8px" />
        <SkeletonBox width="26px" height="26px" radius="8px" />
        <SkeletonBox width="26px" height="26px" radius="8px" />
        <SkeletonBox width="26px" height="26px" radius="8px" />
        <SkeletonBox width="26px" height="26px" radius="8px" />
      </div>
    </div>
  );
};
