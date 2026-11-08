import React, { useState } from 'react';
import { SkeletonBox } from 'skullet/react';

export type PupLumeSkeletonVariant = 
  | 'home' 
  | 'app' 
  | 'ai' 
  | 'ask' 
  | 'tasks' 
  | 'plan' 
  | 'academy' 
  | 'health' 
  | 'more' 
  | 'potty' 
  | 'card' 
  | 'insight';

interface PupLumeSkeletonProps {
  label?: string;
  variant?: PupLumeSkeletonVariant;
  showPreviewSwitcher?: boolean;
}

// -------------------------------------------------------------
// 1. Home Dashboard Skeleton
// -------------------------------------------------------------
export const HomeSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading PupLume Home...' }) => (
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
          <SkeletonBox width={36} height={36} radius={14} className="skullet-deep shrink-0 shadow-xs" />
          <SkeletonBox width={96} height={20} radius={6} />
        </div>

        {/* Puppy Selector Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDFB] border-2 border-[#E5D2C1] shadow-xs">
          <SkeletonBox width={20} height={20} radius="50%" className="skullet-deep shrink-0" />
          <SkeletonBox width={64} height={14} radius={6} />
        </div>

        {/* User Profile Avatar */}
        <SkeletonBox width={36} height={36} radius="50%" className="skullet-deep shadow-xs shrink-0" />
      </div>

      {/* 1. Hero Puppy Card */}
      <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          {/* Puppy Photo Avatar */}
          <SkeletonBox width={72} height={72} radius={22} className="skullet-deep shadow-xs shrink-0" />
          
          {/* Name, Breed & Age Chips */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBox width={150} height={22} radius={8} />
              <SkeletonBox width={64} height={20} radius={999} />
            </div>
            <SkeletonBox width={190} height={14} radius={6} />
          </div>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <SkeletonBox width={44} height={44} radius={14} className="shrink-0" />
          <SkeletonBox width={44} height={44} radius={14} className="shrink-0" />
          <SkeletonBox width="30%" height={44} radius={14} className="flex-1" />
          <SkeletonBox width="35%" height={44} radius={14} className="flex-1" />
        </div>
      </div>

      {/* 2. Daily Routine Progress Card */}
      <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox width={140} height={16} radius={6} />
          <SkeletonBox width={68} height={20} radius={999} />
        </div>
        {/* Progress bar track with active fill */}
        <div className="w-full h-3.5 rounded-full bg-[#E5D2C1]/40 overflow-hidden">
          <SkeletonBox width="60%" height="100%" radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={110} height={12} radius={4} />
      </div>

      {/* 3 & 4. Twin Quick Tracker Cards (Potty & Health) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Potty Tracking Card */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
            <SkeletonBox width={10} height={10} radius="50%" />
          </div>
          <SkeletonBox width={90} height={16} radius={6} />
          <SkeletonBox width={68} height={12} radius={4} />
        </div>

        {/* Health & Vet Center Card */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
            <SkeletonBox width={44} height={18} radius={999} />
          </div>
          <SkeletonBox width={100} height={16} radius={6} />
          <SkeletonBox width={72} height={12} radius={4} />
        </div>
      </div>

      {/* 5. Next Up Routine Activity Card */}
      <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox width={84} height={20} radius={999} />
          <SkeletonBox width={100} height={14} radius={6} />
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="space-y-2 flex-1">
            <SkeletonBox width="75%" height={18} radius={6} />
            <SkeletonBox width="50%" height={13} radius={4} />
          </div>
          <SkeletonBox width={44} height={44} radius={14} className="skullet-deep shrink-0" />
        </div>
      </div>
    </div>

    {/* Bottom Navigation Bar */}
    <div className="bg-[#FFFDFB] rounded-2xl p-3 border-2 border-[#E5D2C1] flex items-center justify-around shadow-xs mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 py-1 px-2">
          <SkeletonBox width={26} height={26} radius={8} className="shrink-0" />
          <SkeletonBox width={36} height={10} radius={4} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 2. Ask AI Chat View Skeleton
// -------------------------------------------------------------
export const AskAISkeleton: React.FC<{ label?: string }> = ({ label = 'Loading PupLume AI Assistant...' }) => (
  <div 
    className="flex flex-col h-[calc(100dvh-140px)] sm:h-[calc(100vh-120px)] max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Sleek Professional AI Chat Header */}
    <div className="flex items-center justify-between pb-3 mb-1 border-b border-[#E8DDD3] shrink-0">
      <div className="flex items-center gap-3">
        <SkeletonBox width={38} height={38} radius="50%" className="skullet-deep shrink-0" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SkeletonBox width={100} height={17} radius={6} />
            <SkeletonBox width={86} height={16} radius={4} className="skullet-deep" />
          </div>
          <SkeletonBox width={160} height={12} radius={4} />
        </div>
      </div>
      <SkeletonBox width={34} height={34} radius="50%" className="shrink-0" />
    </div>

    {/* Messages Stream Scroll Area */}
    <div className="flex-1 overflow-hidden space-y-4 pt-1">
      {/* 1. AI Welcome Message (Left Bubble) */}
      <div className="flex items-start gap-3 max-w-[90%] sm:max-w-md">
        <SkeletonBox width={34} height={34} radius={12} className="skullet-deep shrink-0 mt-1" />
        <div className="bg-[#FFFDFB] rounded-2xl rounded-tl-sm p-4 border-2 border-[#E5D2C1] shadow-xs space-y-2.5 flex-1">
          <SkeletonBox width="85%" height={15} radius={6} />
          <SkeletonBox width="96%" height={13} radius={4} />
          <SkeletonBox width="65%" height={13} radius={4} />
          
          {/* Action Suggestion Pill inside AI response */}
          <div className="pt-2">
            <SkeletonBox width={150} height={32} radius={999} className="skullet-deep" />
          </div>
        </div>
      </div>

      {/* 2. User Message Bubble (Right Bubble) */}
      <div className="flex justify-end">
        <div className="bg-[#E5D2C1]/40 rounded-2xl rounded-tr-sm p-3.5 max-w-[80%] sm:max-w-xs space-y-2 border border-[#DEC8B5]">
          <SkeletonBox width={180} height={14} radius={6} />
          <SkeletonBox width={120} height={12} radius={4} />
        </div>
      </div>

      {/* 3. AI Streaming Response Bubble (Left Bubble) */}
      <div className="flex items-start gap-3 max-w-[95%] sm:max-w-lg">
        <SkeletonBox width={34} height={34} radius={12} className="skullet-deep shrink-0 mt-1" />
        <div className="bg-[#FFFDFB] rounded-2xl rounded-tl-sm p-4 border-2 border-[#E5D2C1] shadow-xs space-y-2.5 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SkeletonBox width={80} height={16} radius={6} />
            <SkeletonBox width={95} height={13} radius={4} />
          </div>
          <SkeletonBox width="92%" height={13} radius={4} />
          <SkeletonBox width="88%" height={13} radius={4} />
          <SkeletonBox width="70%" height={13} radius={4} />
          <div className="flex items-center gap-2 pt-2">
            <SkeletonBox width={130} height={32} radius={12} className="skullet-deep" />
            <SkeletonBox width={110} height={32} radius={12} />
          </div>
        </div>
      </div>
    </div>

    {/* Quick Starter Prompts Row */}
    <div className="flex items-center gap-2 overflow-hidden py-1">
      <SkeletonBox width={155} height={34} radius={999} />
      <SkeletonBox width={175} height={34} radius={999} />
      <SkeletonBox width={140} height={34} radius={999} />
    </div>

    {/* Bottom Chat Input Bar */}
    <div className="bg-[#FFFDFB] rounded-2xl p-2.5 border-2 border-[#E5D2C1] shadow-md flex items-center gap-2.5 shrink-0">
      <SkeletonBox width={38} height={38} radius={12} className="shrink-0" />
      <div className="flex-1">
        <SkeletonBox width="60%" height={16} radius={6} />
      </div>
      <SkeletonBox width={46} height={40} radius={14} className="skullet-deep shrink-0" />
    </div>
  </div>
);

// -------------------------------------------------------------
// 3. Tasks / Plan View Skeleton
// -------------------------------------------------------------
export const TasksSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Daily Plan...' }) => (
  <div 
    className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="flex items-center justify-between pt-1">
      <div className="space-y-1.5">
        <SkeletonBox width={170} height={22} radius={8} />
        <SkeletonBox width={120} height={13} radius={4} />
      </div>
      <SkeletonBox width={100} height={38} radius={14} className="skullet-deep" />
    </div>

    {/* 7-Day Date Selector Strip */}
    <div className="flex items-center justify-between gap-1.5 py-1">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 flex-1 ${
            idx === 2 ? 'bg-[#FFFDFB] border-[#8B5E3C]' : 'bg-[#FFFDFB] border-[#E5D2C1]'
          }`}
        >
          <SkeletonBox width={18} height={10} radius={4} />
          <SkeletonBox width={22} height={16} radius={6} className={idx === 2 ? 'skullet-deep' : ''} />
        </div>
      ))}
    </div>

    {/* Routine Progress Summary Card */}
    <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBox width={145} height={18} radius={6} />
          <SkeletonBox width={95} height={12} radius={4} />
        </div>
        <SkeletonBox width={50} height={50} radius="50%" className="skullet-deep" />
      </div>
      <div className="w-full h-3 rounded-full bg-[#E5D2C1]/40 overflow-hidden">
        <SkeletonBox width="65%" height="100%" radius={999} className="skullet-deep" />
      </div>
    </div>

    {/* Filter Chips */}
    <div className="flex items-center gap-2">
      <SkeletonBox width={64} height={30} radius={999} className="skullet-deep" />
      <SkeletonBox width={84} height={30} radius={999} />
      <SkeletonBox width={90} height={30} radius={999} />
    </div>

    {/* Time-blocked Task List Items */}
    <div className="space-y-3">
      {[
        { time: '07:00 AM', title: 'Morning Potty Break', cat: 'Potty' },
        { time: '07:30 AM', title: 'Breakfast Kibble & Water', cat: 'Feeding' },
        { time: '10:00 AM', title: 'Loose Leash Walking Drill', cat: 'Training' },
        { time: '01:00 PM', title: 'Quiet Crate Nap Time', cat: 'Sleep' },
      ].map((task, i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <SkeletonBox width={26} height={26} radius={8} className="shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SkeletonBox width={140} height={16} radius={6} />
                <SkeletonBox width={55} height={16} radius={999} className="skullet-deep" />
              </div>
              <SkeletonBox width={110} height={12} radius={4} />
            </div>
          </div>
          <SkeletonBox width={28} height={28} radius={8} className="shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 4. Training Academy View Skeleton
// -------------------------------------------------------------
export const AcademySkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Training Academy...' }) => (
  <div 
    className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Academy Header */}
    <div className="flex items-center justify-between pt-1">
      <div className="space-y-1.5">
        <SkeletonBox width={180} height={22} radius={8} />
        <SkeletonBox width={120} height={13} radius={4} />
      </div>
      <SkeletonBox width={90} height={34} radius={999} className="skullet-deep" />
    </div>

    {/* Module Category Filter Pills */}
    <div className="flex items-center gap-2 overflow-hidden py-1">
      <SkeletonBox width={60} height={32} radius={999} className="skullet-deep" />
      <SkeletonBox width={105} height={32} radius={999} />
      <SkeletonBox width={85} height={32} radius={999} />
      <SkeletonBox width={95} height={32} radius={999} />
    </div>

    {/* Featured Interactive Drill Banner Card */}
    <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
      {/* Video Thumbnail Box */}
      <div className="relative">
        <SkeletonBox width="100%" height={160} radius={18} className="skullet-deep" />
        <div className="absolute inset-0 flex items-center justify-center">
          <SkeletonBox width={48} height={48} radius="50%" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1.5 flex-1">
          <SkeletonBox width="70%" height={18} radius={6} />
          <SkeletonBox width="45%" height={13} radius={4} />
        </div>
        <SkeletonBox width={85} height={36} radius={12} className="skullet-deep" />
      </div>
    </div>

    {/* Training Drill Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-2.5">
          <SkeletonBox width="100%" height={92} radius={14} className="skullet-deep" />
          <SkeletonBox width="75%" height={15} radius={6} />
          <div className="flex items-center justify-between pt-1">
            <SkeletonBox width={65} height={13} radius={4} />
            <SkeletonBox width={55} height={16} radius={999} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 5. Health & Veterinary Center Skeleton
// -------------------------------------------------------------
export const HealthSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Health Center...' }) => (
  <div 
    className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Health Header */}
    <div className="flex items-center justify-between pt-1">
      <div className="space-y-1.5">
        <SkeletonBox width={175} height={22} radius={8} />
        <SkeletonBox width={135} height={13} radius={4} />
      </div>
      <SkeletonBox width={105} height={34} radius={999} className="skullet-deep" />
    </div>

    {/* Tab Switcher Pills */}
    <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#FFFDFB] rounded-2xl border-2 border-[#E5D2C1]">
      {['Vaccines', 'Meds', 'Visits', 'Weight'].map((_, i) => (
        <SkeletonBox key={i} width="100%" height={32} radius={12} className={i === 0 ? 'skullet-deep' : ''} />
      ))}
    </div>

    {/* Puppy Vitals Overview Card */}
    <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox width={135} height={18} radius={6} />
        <SkeletonBox width={75} height={18} radius={999} className="skullet-deep" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="p-3 bg-[#FFF9F2] rounded-xl space-y-1.5 text-center border border-[#E5D2C1]/60">
            <SkeletonBox width="60%" height={18} radius={4} className="mx-auto skullet-deep" />
            <SkeletonBox width="80%" height={11} radius={3} className="mx-auto" />
          </div>
        ))}
      </div>
    </div>

    {/* Vaccine / Meds Record Rows */}
    <div className="space-y-3">
      {[
        { name: 'DHPP Core Puppy Booster', due: 'Due in 2 weeks' },
        { name: 'Rabies 1-Year Vaccine', due: 'Completed' },
        { name: 'Bordetella (Kennel Cough)', due: 'Scheduled' },
      ].map((v, i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox width={38} height={38} radius={12} className="skullet-deep shrink-0" />
            <div className="space-y-1.5">
              <SkeletonBox width={140} height={16} radius={6} />
              <SkeletonBox width={95} height={12} radius={4} />
            </div>
          </div>
          <SkeletonBox width={72} height={22} radius={999} className="skullet-deep" />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 6. More Menu & Hub Skeleton
// -------------------------------------------------------------
export const MoreMenuSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Menu & Settings...' }) => (
  <div 
    className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Puppy & Owner Profile Hero Card */}
    <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs flex items-center gap-4">
      <SkeletonBox width={68} height={68} radius={22} className="skullet-deep shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBox width={145} height={20} radius={6} />
        <SkeletonBox width={105} height={13} radius={4} />
        <SkeletonBox width={85} height={16} radius={999} className="skullet-deep" />
      </div>
    </div>

    {/* Quick Feature Grid (Vault, Expenses, Socialization, Journal) */}
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs space-y-2">
          <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
          <SkeletonBox width="80%" height={14} radius={4} />
          <SkeletonBox width="50%" height={11} radius={3} />
        </div>
      ))}
    </div>

    {/* Settings List */}
    <div className="bg-[#FFFDFB] rounded-3xl p-2 border-2 border-[#E5D2C1] shadow-xs divide-y divide-[#E5D2C1]/60">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox width={26} height={26} radius={8} className="skullet-deep" />
            <SkeletonBox width={130} height={14} radius={4} />
          </div>
          <SkeletonBox width={16} height={16} radius={4} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 7. Potty Tracker Skeleton
// -------------------------------------------------------------
export const PottySkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Potty Tracker...' }) => (
  <div 
    className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    <div className="flex items-center justify-between pt-1">
      <div className="space-y-1.5">
        <SkeletonBox width={165} height={22} radius={8} />
        <SkeletonBox width={125} height={13} radius={4} />
      </div>
      <SkeletonBox width={85} height={34} radius={999} className="skullet-deep" />
    </div>

    {/* 4 Quick 1-Tap Potty Buttons */}
    <div className="grid grid-cols-2 gap-3">
      {['Pee Log', 'Poo Log', 'Both', 'Accident'].map((_, i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#E5D2C1] shadow-xs flex flex-col items-center gap-2">
          <SkeletonBox width={42} height={42} radius={14} className="skullet-deep" />
          <SkeletonBox width={65} height={14} radius={4} />
        </div>
      ))}
    </div>

    {/* Potty Reliability Card */}
    <div className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox width={140} height={16} radius={6} />
        <SkeletonBox width={55} height={16} radius={999} className="skullet-deep" />
      </div>
      <SkeletonBox width="100%" height={10} radius={999} />
    </div>

    {/* Log Entries Timeline */}
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#FFFDFB] rounded-xl p-3 border-2 border-[#E5D2C1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SkeletonBox width={28} height={28} radius={8} className="skullet-deep" />
            <SkeletonBox width={105} height={14} radius={4} />
          </div>
          <SkeletonBox width={65} height={12} radius={4} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 8. Minimal Insight / Card Skeletons
// -------------------------------------------------------------
export const InsightSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading insight...' }) => (
  <div className="space-y-2 py-1.5 w-full" aria-busy="true" aria-label={label}>
    <SkeletonBox width="85%" height={16} radius={6} />
    <SkeletonBox width="60%" height={16} radius={6} />
  </div>
);

export const CardSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading card...' }) => (
  <div 
    className="bg-[#FFFDFB] rounded-3xl p-5 border-2 border-[#E5D2C1] shadow-xs space-y-4 my-2" 
    aria-busy="true" 
    aria-label={label}
  >
    <div className="flex items-center gap-3.5">
      <SkeletonBox width={56} height={56} radius={18} className="skullet-deep shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox width="60%" height={20} radius={8} />
        <SkeletonBox width="40%" height={14} radius={6} />
      </div>
    </div>
    <SkeletonBox width="100%" height={44} radius={14} />
  </div>
);

// -------------------------------------------------------------
// Unified Dispatcher: PupLumeSkeleton
// -------------------------------------------------------------
export const PupLumeSkeleton: React.FC<PupLumeSkeletonProps> = ({
  label = 'Loading PupLume...',
  variant = 'home',
  showPreviewSwitcher = false
}) => {
  const [activeTab, setActiveTab] = useState<PupLumeSkeletonVariant>(variant);

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
      case 'ask':
        return <AskAISkeleton label={label} />;
      case 'tasks':
      case 'plan':
        return <TasksSkeleton label={label} />;
      case 'academy':
        return <AcademySkeleton label={label} />;
      case 'health':
        return <HealthSkeleton label={label} />;
      case 'more':
        return <MoreMenuSkeleton label={label} />;
      case 'potty':
        return <PottySkeleton label={label} />;
      case 'insight':
        return <InsightSkeleton label={label} />;
      case 'card':
        return <CardSkeleton label={label} />;
      case 'home':
      case 'app':
      default:
        return <HomeSkeleton label={label} />;
    }
  };

  return (
    <div className="w-full">
      {/* Interactive Switcher for testing/previewing all page skeletons */}
      {showPreviewSwitcher && (
        <div className="sticky top-0 z-50 bg-[#2D1B10] text-[#FFF9F2] p-2.5 shadow-md flex items-center justify-start gap-1.5 overflow-x-auto border-b border-[#F59E0B]/30 select-none">
          <span className="text-[11px] font-bold text-[#FDE68A] uppercase tracking-wider px-2 py-1 shrink-0">
            🦴 Skullet Pages:
          </span>
          {[
            { id: 'home', label: '🏠 Home' },
            { id: 'ai', label: '✨ Ask AI' },
            { id: 'tasks', label: '📅 Plan' },
            { id: 'academy', label: '🎓 Academy' },
            { id: 'health', label: '🩺 Health' },
            { id: 'more', label: '🐾 More' },
            { id: 'potty', label: '🚽 Potty' },
            { id: 'card', label: '🃏 Card' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as PupLumeSkeletonVariant)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#F59E0B] text-[#1D1107] shadow-sm font-bold scale-105'
                  : 'bg-[#422B1E] text-[#E5D2C1] hover:bg-[#533726]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {renderContent()}
    </div>
  );
};
