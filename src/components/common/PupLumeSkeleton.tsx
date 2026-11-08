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
  | 'expenses'
  | 'vault'
  | 'journal'
  | 'socialization'
  | 'puppy'
  | 'settings'
  | 'sharing'
  | 'recap'
  | 'onboarding'
  | 'safety'
  | 'legal'
  | 'privacy'
  | 'terms'
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
    className="min-h-screen bg-[#FFF9F2] flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto w-full select-none" 
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EBE1] border border-[#EADCCF] shadow-xs">
          <SkeletonBox width={20} height={20} radius="50%" className="skullet-deep shrink-0" />
          <SkeletonBox width={64} height={14} radius={6} />
        </div>

        {/* User Profile Avatar */}
        <SkeletonBox width={36} height={36} radius="50%" className="skullet-deep shadow-xs shrink-0" />
      </div>

      {/* 1. Hero Puppy Card */}
      <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-4">
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

        {/* Quick Action Buttons Row: Exactly these two only */}
        <div className="flex items-center gap-3 pt-1">
          <SkeletonBox width="50%" height={42} radius={14} className="flex-1" />
          <SkeletonBox width="50%" height={42} radius={14} className="flex-1" />
        </div>
      </div>

      {/* 2. Daily Routine Progress Card */}
      <div className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-3">
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
        <div className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
            <SkeletonBox width={10} height={10} radius="50%" />
          </div>
          <SkeletonBox width={90} height={16} radius={6} />
          <SkeletonBox width={68} height={12} radius={4} />
        </div>

        {/* Health & Vet Center Card */}
        <div className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
            <SkeletonBox width={44} height={18} radius={999} />
          </div>
          <SkeletonBox width={100} height={16} radius={6} />
          <SkeletonBox width={72} height={12} radius={4} />
        </div>
      </div>

      {/* 5. Next Up Routine Activity Card */}
      <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-3">
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
    <div className="bg-[#F5EBE1] rounded-2xl p-3 border border-[#EADCCF] flex items-center justify-around shadow-xs mt-4 md:hidden">
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
        <div className="bg-[#F5EBE1] rounded-2xl rounded-tl-sm p-4 border border-[#EADCCF] shadow-xs space-y-2.5 flex-1">
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
        <div className="bg-[#F5EBE1] rounded-2xl rounded-tl-sm p-4 border border-[#EADCCF] shadow-xs space-y-2.5 flex-1">
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
    <div className="bg-[#F5EBE1] rounded-2xl p-2.5 border border-[#EADCCF] shadow-md flex items-center gap-2.5 shrink-0">
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
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
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
            idx === 2 ? 'bg-[#F5EBE1] border-[#8B5E3C]' : 'bg-[#F5EBE1] border-[#E5D2C1]'
          }`}
        >
          <SkeletonBox width={18} height={10} radius={4} />
          <SkeletonBox width={22} height={16} radius={6} className={idx === 2 ? 'skullet-deep' : ''} />
        </div>
      ))}
    </div>

    {/* Routine Progress Summary Card */}
    <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-3">
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
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs flex items-center justify-between gap-3">
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
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
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
    <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-3">
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
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-2.5">
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
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
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
    <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F5EBE1] rounded-2xl border border-[#EADCCF]">
      {['Vaccines', 'Meds', 'Visits', 'Weight'].map((_, i) => (
        <SkeletonBox key={i} width="100%" height={32} radius={12} className={i === 0 ? 'skullet-deep' : ''} />
      ))}
    </div>

    {/* Puppy Vitals Overview Card */}
    <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-3">
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
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs flex items-center justify-between">
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
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Puppy & Owner Profile Hero Card */}
    <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs flex items-center gap-4">
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
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-2">
          <SkeletonBox width={36} height={36} radius={12} className="skullet-deep" />
          <SkeletonBox width="80%" height={14} radius={4} />
          <SkeletonBox width="50%" height={11} radius={3} />
        </div>
      ))}
    </div>

    {/* Settings List */}
    <div className="bg-[#F5EBE1] rounded-3xl p-2 border border-[#EADCCF] shadow-xs divide-y divide-[#E5D2C1]/60">
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
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 select-none"
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
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs flex flex-col items-center gap-2">
          <SkeletonBox width={42} height={42} radius={14} className="skullet-deep" />
          <SkeletonBox width={65} height={14} radius={4} />
        </div>
      ))}
    </div>

    {/* Potty Reliability Card */}
    <div className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox width={140} height={16} radius={6} />
        <SkeletonBox width={55} height={16} radius={999} className="skullet-deep" />
      </div>
      <SkeletonBox width="100%" height={10} radius={999} />
    </div>

    {/* Log Entries Timeline */}
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-xl p-3 border border-[#EADCCF] flex items-center justify-between">
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
    className="bg-[#F5EBE1] rounded-3xl p-5 border border-[#EADCCF] shadow-xs space-y-4 my-2" 
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
// 9. Public Smart Collar Tag Safety Skeleton (/pup/* and /safety/*)
// -------------------------------------------------------------
export const PublicPupSafetySkeleton: React.FC<{ label?: string }> = ({ label = 'Loading puppy safety card...' }) => (
  <div 
    className="min-h-screen bg-[#FFF9F2] text-[#2C211B] flex flex-col items-center select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Top Emergency / Safety Strip */}
    <div className="w-full bg-[#EADCCF]/70 py-2.5 px-4 flex items-center justify-center gap-2 border-b border-[#DEC8B5]">
      <SkeletonBox width={18} height={18} radius="50%" className="skullet-deep shrink-0" />
      <SkeletonBox width={260} height={14} radius={6} />
    </div>

    {/* Main Container */}
    <div className="w-full max-w-xl px-4 py-6 sm:py-8 space-y-5">
      {/* Puppy Hero Profile Card */}
      <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <SkeletonBox width={128} height={128} radius={24} className="skullet-deep shrink-0 shadow-md" />
        <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
          <div className="flex items-center justify-center sm:justify-between gap-2">
            <SkeletonBox width={150} height={22} radius={999} className="skullet-deep" />
            <SkeletonBox width={60} height={24} radius={12} className="hidden sm:block" />
          </div>
          <SkeletonBox width={180} height={32} radius={8} className="mx-auto sm:mx-0" />
          <SkeletonBox width={140} height={16} radius={6} className="mx-auto sm:mx-0" />
          <div className="pt-1">
            <SkeletonBox width={110} height={24} radius={10} className="mx-auto sm:mx-0" />
          </div>
        </div>
      </div>

      {/* Emergency Contact Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <SkeletonBox width={16} height={16} radius={4} />
          <SkeletonBox width={160} height={14} radius={4} />
        </div>
        <SkeletonBox width="100%" height={52} radius={16} className="skullet-deep" />
        <SkeletonBox width="100%" height={50} radius={16} />
        <SkeletonBox width="100%" height={46} radius={16} />
      </div>

      {/* Veterinary & Medical Info Card */}
      <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 shadow-xs space-y-3">
        <SkeletonBox width={160} height={18} radius={6} />
        <div className="space-y-2">
          <SkeletonBox width="90%" height={14} radius={4} />
          <SkeletonBox width="75%" height={14} radius={4} />
        </div>
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// 10. Legal Document Skeleton (/privacy and /terms)
// -------------------------------------------------------------
export const LegalDocumentSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading document...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Top Header Card */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex items-center gap-4">
      <SkeletonBox width={38} height={38} radius={12} className="skullet-deep shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <SkeletonBox width={20} height={20} radius={6} />
          <SkeletonBox width={180} height={24} radius={8} />
        </div>
        <SkeletonBox width={220} height={13} radius={4} />
      </div>
    </div>

    {/* Document Body */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-2.5">
        <SkeletonBox width="100%" height={15} radius={4} />
        <SkeletonBox width="95%" height={15} radius={4} />
        <SkeletonBox width="80%" height={15} radius={4} />
      </div>

      {/* Section 1 */}
      <div className="space-y-3 pt-2">
        <SkeletonBox width={160} height={20} radius={6} className="skullet-deep" />
        <SkeletonBox width="90%" height={14} radius={4} />
        <div className="space-y-2 pl-4">
          <SkeletonBox width="85%" height={13} radius={4} />
          <SkeletonBox width="80%" height={13} radius={4} />
          <SkeletonBox width="90%" height={13} radius={4} />
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-3 pt-2">
        <SkeletonBox width={180} height={20} radius={6} className="skullet-deep" />
        <SkeletonBox width="88%" height={14} radius={4} />
        <div className="space-y-2 pl-4">
          <SkeletonBox width="75%" height={13} radius={4} />
          <SkeletonBox width="82%" height={13} radius={4} />
        </div>
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// 11. Expenses Tracker Skeleton (/expenses)
// -------------------------------------------------------------
export const ExpensesSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Expenses...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBox width={200} height={24} radius={8} />
          <SkeletonBox width={90} height={22} radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={280} height={13} radius={4} />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox width={95} height={36} radius={12} />
        <SkeletonBox width={110} height={36} radius={12} className="skullet-deep" />
      </div>
    </div>

    {/* Category Breakdown Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {['Vet Care', 'Food', 'Insurance', 'Toys'].map((_, idx) => (
        <div key={idx} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-2">
          <SkeletonBox width={70} height={12} radius={4} />
          <SkeletonBox width={90} height={22} radius={6} className={idx === 0 ? 'skullet-deep' : ''} />
          <SkeletonBox width={60} height={10} radius={3} />
        </div>
      ))}
    </div>

    {/* Expense Record Rows */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-4 shadow-xs divide-y divide-[#E5D2C1]/60">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="py-3.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
          <div className="flex items-center gap-3">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep shrink-0" />
            <div className="space-y-1.5">
              <SkeletonBox width={140} height={15} radius={4} />
              <SkeletonBox width={90} height={12} radius={3} />
            </div>
          </div>
          <SkeletonBox width={65} height={18} radius={6} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 12. Document Vault Skeleton (/vault)
// -------------------------------------------------------------
export const VaultSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Document Vault...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBox width={190} height={24} radius={8} />
          <SkeletonBox width={110} height={22} radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={260} height={13} radius={4} />
      </div>
      <SkeletonBox width={140} height={36} radius={12} className="skullet-deep" />
    </div>

    {/* 2-Column Grid of Document Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <SkeletonBox width={85} height={20} radius={6} className="skullet-deep" />
            <SkeletonBox width={90} height={14} radius={4} />
          </div>
          <SkeletonBox width="80%" height={16} radius={6} />
          <SkeletonBox width="60%" height={12} radius={4} />
          <div className="flex items-center justify-between pt-2 border-t border-[#E5D2C1]/60">
            <SkeletonBox width={70} height={28} radius={8} />
            <SkeletonBox width={28} height={28} radius={8} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 13. Puppy Journal Skeleton (/journal)
// -------------------------------------------------------------
export const JournalSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Puppy Journal...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBox width={210} height={24} radius={8} />
          <SkeletonBox width={95} height={22} radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={270} height={13} radius={4} />
      </div>
      <SkeletonBox width={145} height={36} radius={12} className="skullet-deep" />
    </div>

    {/* Journal Entry Cards */}
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <SkeletonBox width={110} height={16} radius={4} />
            <SkeletonBox width={100} height={22} radius={999} className="skullet-deep" />
          </div>
          <SkeletonBox width="100%" height={180} radius={18} className="skullet-deep" />
          <SkeletonBox width="70%" height={18} radius={6} />
          <div className="space-y-1.5">
            <SkeletonBox width="95%" height={13} radius={4} />
            <SkeletonBox width="80%" height={13} radius={4} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 14. Socialization & Grooming Skeleton (/socialization)
// -------------------------------------------------------------
export const SocializationSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Socialization...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBox width={210} height={24} radius={8} />
          <SkeletonBox width={130} height={22} radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={260} height={13} radius={4} />
      </div>
      <div className="flex gap-2">
        <SkeletonBox width={115} height={34} radius={12} className="skullet-deep" />
        <SkeletonBox width={95} height={34} radius={12} />
      </div>
    </div>

    {/* Exposure Checklist Category Cards */}
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SkeletonBox width={36} height={36} radius={12} className="skullet-deep shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <SkeletonBox width="65%" height={15} radius={4} />
              <SkeletonBox width="40%" height={12} radius={3} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <SkeletonBox width={30} height={30} radius={8} />
            <SkeletonBox width={30} height={30} radius={8} />
            <SkeletonBox width={30} height={30} radius={8} className="skullet-deep" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 15. Puppy Profile Detail Skeleton (/puppy)
// -------------------------------------------------------------
export const PuppyProfileSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Puppy Profile...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Hero Profile Card */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
      <SkeletonBox width={120} height={120} radius={24} className="skullet-deep shrink-0 shadow-md" />
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center justify-center sm:justify-between gap-2">
          <SkeletonBox width={170} height={28} radius={8} />
          <SkeletonBox width={90} height={32} radius={12} className="skullet-deep" />
        </div>
        <SkeletonBox width={140} height={16} radius={6} className="mx-auto sm:mx-0" />
        <div className="grid grid-cols-3 gap-2 pt-1 max-w-sm mx-auto sm:mx-0">
          {[1, 2, 3].map((idx) => (
            <SkeletonBox key={idx} width="100%" height={32} radius={10} />
          ))}
        </div>
      </div>
    </div>

    {/* Smart Collar Tag QR Safety Box */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      <SkeletonBox width={130} height={130} radius={18} className="skullet-deep shrink-0 shadow-inner" />
      <div className="flex-1 space-y-3 text-center sm:text-left w-full">
        <SkeletonBox width={180} height={20} radius={6} className="mx-auto sm:mx-0" />
        <SkeletonBox width="85%" height={14} radius={4} className="mx-auto sm:mx-0" />
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <SkeletonBox width={120} height={36} radius={12} className="skullet-deep" />
          <SkeletonBox width={140} height={36} radius={12} />
        </div>
      </div>
    </div>

    {/* Detail Info Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs space-y-2">
          <SkeletonBox width={100} height={13} radius={4} />
          <SkeletonBox width="80%" height={16} radius={6} className={i === 1 ? 'skullet-deep' : ''} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 16. App Settings Skeleton (/settings)
// -------------------------------------------------------------
export const SettingsSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Settings...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs space-y-1.5">
      <SkeletonBox width={160} height={24} radius={8} />
      <SkeletonBox width={260} height={13} radius={4} />
    </div>

    {/* Settings Cards */}
    <div className="space-y-4">
      {/* Notifications Section */}
      <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 shadow-xs space-y-4">
        <SkeletonBox width={140} height={18} radius={6} className="skullet-deep" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <SkeletonBox width={150} height={15} radius={4} />
              <SkeletonBox width={110} height={11} radius={3} />
            </div>
            <SkeletonBox width={44} height={26} radius={999} className={i <= 2 ? 'skullet-deep' : ''} />
          </div>
        ))}
      </div>

      {/* Preferences Section */}
      <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 shadow-xs space-y-4">
        <SkeletonBox width={120} height={18} radius={6} className="skullet-deep" />
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <SkeletonBox width={130} height={15} radius={4} />
            <SkeletonBox width={90} height={11} radius={3} />
          </div>
          <div className="flex gap-1.5">
            <SkeletonBox width={60} height={30} radius={8} className="skullet-deep" />
            <SkeletonBox width={60} height={30} radius={8} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// 17. Family & Caretaker Sharing Skeleton (/sharing)
// -------------------------------------------------------------
export const FamilySharingSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Family Sharing...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Page Header */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBox width={210} height={24} radius={8} />
          <SkeletonBox width={90} height={22} radius={999} className="skullet-deep" />
        </div>
        <SkeletonBox width={280} height={13} radius={4} />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox width={120} height={36} radius={12} className="skullet-deep" />
        <SkeletonBox width={130} height={36} radius={12} />
      </div>
    </div>

    {/* Members List Cards */}
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkeletonBox width={44} height={44} radius="50%" className="skullet-deep shrink-0" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <SkeletonBox width={120} height={16} radius={4} />
                <SkeletonBox width={70} height={16} radius={999} className={i === 1 ? 'skullet-deep' : ''} />
              </div>
              <SkeletonBox width={160} height={12} radius={3} />
            </div>
          </div>
          <SkeletonBox width={28} height={28} radius={8} />
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// 18. Weekly / Monthly Recap Skeleton (/recap)
// -------------------------------------------------------------
export const RecapSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading Recap...' }) => (
  <div 
    className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 select-none"
    aria-busy="true" 
    aria-label={label}
  >
    {/* Period Selector Tabs */}
    <div className="flex items-center justify-center gap-2 py-1">
      <SkeletonBox width={100} height={34} radius={999} className="skullet-deep" />
      <SkeletonBox width={100} height={34} radius={999} />
      <SkeletonBox width={100} height={34} radius={999} />
    </div>

    {/* Hero Score Card */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 shadow-xs text-center space-y-3">
      <SkeletonBox width={140} height={16} radius={6} className="mx-auto" />
      <SkeletonBox width={110} height={48} radius={14} className="skullet-deep mx-auto" />
      <SkeletonBox width={150} height={24} radius={999} className="mx-auto" />
      <SkeletonBox width="70%" height={14} radius={4} className="mx-auto" />
    </div>

    {/* 3 Stat Breakdown Cards */}
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="bg-[#F5EBE1] rounded-2xl p-4 border border-[#EADCCF] shadow-xs text-center space-y-2">
          <SkeletonBox width={32} height={32} radius="50%" className="skullet-deep mx-auto" />
          <SkeletonBox width={50} height={18} radius={4} className="mx-auto" />
          <SkeletonBox width={65} height={11} radius={3} className="mx-auto" />
        </div>
      ))}
    </div>

    {/* AI Insight Narrative Card */}
    <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox width={140} height={18} radius={6} />
        <SkeletonBox width={70} height={28} radius={8} />
      </div>
      <div className="space-y-2">
        <SkeletonBox width="96%" height={14} radius={4} />
        <SkeletonBox width="90%" height={14} radius={4} />
        <SkeletonBox width="75%" height={14} radius={4} />
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// 19. AI Onboarding Wizard Skeleton (/onboarding)
// -------------------------------------------------------------
export const OnboardingSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading AI Onboarding...' }) => (
  <div 
    className="min-h-screen bg-[#FFF9F2] flex flex-col justify-between p-4 sm:p-6 max-w-2xl mx-auto w-full select-none"
    aria-busy="true" 
    aria-label={label}
  >
    <div className="space-y-6">
      {/* Top Header & Step Progress Bar */}
      <div className="flex items-center justify-between pt-2">
        <SkeletonBox width={110} height={28} radius={8} className="skullet-deep" />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} width={i === 1 ? 24 : 8} height={8} radius={999} className={i === 1 ? 'skullet-deep' : ''} />
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-[#F5EBE1] rounded-3xl border border-[#EADCCF] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="space-y-2">
          <SkeletonBox width={180} height={24} radius={8} />
          <SkeletonBox width={260} height={14} radius={4} />
        </div>

        {/* Photo Uploader Box */}
        <div className="flex justify-center py-2">
          <SkeletonBox width={96} height={96} radius={24} className="skullet-deep" />
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 pt-1">
          <SkeletonBox width={80} height={14} radius={4} />
          <SkeletonBox width="100%" height={46} radius={14} />
          <SkeletonBox width={90} height={14} radius={4} />
          <SkeletonBox width="100%" height={46} radius={14} />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <SkeletonBox width="100%" height={48} radius={16} className="skullet-deep" />
        </div>
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// Route-to-Skeleton Resolver
// -------------------------------------------------------------
export function getSkeletonVariantForPath(path?: string | null): PupLumeSkeletonVariant {
  let raw = path;
  if (!raw && typeof window !== 'undefined') {
    const searchView = new URLSearchParams(window.location.search).get('view');
    raw = searchView || window.location.pathname;
  }
  if (!raw) return 'home';

  const clean = raw.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  
  if (!clean || clean === 'home') return 'home';
  if (clean === 'ai' || clean === 'ask' || clean === 'chat') return 'ai';
  if (clean === 'tasks' || clean === 'plan') return 'tasks';
  if (clean === 'academy' || clean === 'training') return 'academy';
  if (clean === 'health' || clean === 'vet') return 'health';
  if (clean === 'more') return 'more';
  if (clean === 'potty') return 'potty';
  if (clean.startsWith('pup') || clean.startsWith('safety')) return 'safety';
  if (clean === 'expenses') return 'expenses';
  if (clean === 'vault') return 'vault';
  if (clean === 'journal') return 'journal';
  if (clean === 'socialization' || clean === 'grooming') return 'socialization';
  if (clean === 'puppy' || clean === 'profile') return 'puppy';
  if (clean === 'settings') return 'settings';
  if (clean === 'sharing' || clean === 'family') return 'sharing';
  if (clean === 'recap') return 'recap';
  if (clean === 'privacy' || clean === 'legal') return 'privacy';
  if (clean === 'terms') return 'terms';
  if (clean === 'onboarding') return 'onboarding';
  
  return 'card';
}

// -------------------------------------------------------------
// Unified Dispatcher: PupLumeSkeleton
// -------------------------------------------------------------
export const PupLumeSkeleton: React.FC<PupLumeSkeletonProps> = ({
  label = 'Loading PupLume...',
  variant,
  showPreviewSwitcher = false
}) => {
  const resolveTarget = (): PupLumeSkeletonVariant => {
    if (variant && variant !== 'home') return variant;
    if (typeof window !== 'undefined') {
      const fromPath = getSkeletonVariantForPath();
      if (fromPath !== 'home') return fromPath;
    }
    return variant || 'home';
  };

  const [activeTab, setActiveTab] = useState<PupLumeSkeletonVariant>(resolveTarget);

  React.useEffect(() => {
    setActiveTab(resolveTarget());
  }, [variant]);

  const renderContent = () => {
    let tab = activeTab;
    // Hard guard: NEVER render HomeSkeleton if URL indicates another route
    if (typeof window !== 'undefined') {
      const urlVariant = getSkeletonVariantForPath();
      if (urlVariant !== 'home') {
        tab = urlVariant;
      }
    }

    switch (tab) {
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
      case 'safety':
        return <PublicPupSafetySkeleton label={label} />;
      case 'privacy':
      case 'terms':
      case 'legal':
        return <LegalDocumentSkeleton label={label} />;
      case 'expenses':
        return <ExpensesSkeleton label={label} />;
      case 'vault':
        return <VaultSkeleton label={label} />;
      case 'journal':
        return <JournalSkeleton label={label} />;
      case 'socialization':
        return <SocializationSkeleton label={label} />;
      case 'puppy':
        return <PuppyProfileSkeleton label={label} />;
      case 'settings':
        return <SettingsSkeleton label={label} />;
      case 'sharing':
        return <FamilySharingSkeleton label={label} />;
      case 'recap':
        return <RecapSkeleton label={label} />;
      case 'onboarding':
        return <OnboardingSkeleton label={label} />;
      case 'insight':
        return <InsightSkeleton label={label} />;
      case 'card':
        return <CardSkeleton label={label} />;
      case 'home':
      case 'app':
        // Strict protection: only show HomeSkeleton if the user is truly at / or /home
        if (typeof window !== 'undefined') {
          const fromUrl = getSkeletonVariantForPath();
          if (fromUrl !== 'home') {
            return <AskAISkeleton label={label} />;
          }
        }
        return <HomeSkeleton label={label} />;
      default:
        return <CardSkeleton label={label} />;
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
            { id: 'safety', label: '🚨 Safety QR' },
            { id: 'expenses', label: '💰 Expenses' },
            { id: 'vault', label: '📁 Vault' },
            { id: 'journal', label: '📖 Journal' },
            { id: 'socialization', label: '🐶 Socialize' },
            { id: 'puppy', label: '🐕 Profile' },
            { id: 'settings', label: '⚙️ Settings' },
            { id: 'sharing', label: '👨‍👩‍👧 Sharing' },
            { id: 'recap', label: '📊 Recap' },
            { id: 'privacy', label: '📜 Privacy' },
            { id: 'terms', label: '⚖️ Terms' },
            { id: 'onboarding', label: '🚀 Onboarding' },
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
