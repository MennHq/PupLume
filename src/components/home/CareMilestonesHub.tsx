import React from 'react';
import { 
  Scissors, 
  Heart, 
  Activity, 
  DollarSign, 
  ChevronRight, 
  Camera, 
  Sparkles, 
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Compass,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';

interface CareMilestonesHubProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
  className?: string;
  variant?: 'grid' | 'sidebar';
}

function getPuppyDevelopmentStage(birthDateStr?: string) {
  if (!birthDateStr) {
    return {
      weeks: 10,
      stage: 'Golden Socialization Window',
      badge: 'Critical 8–16 Wks',
      tip: 'Prime window to introduce novel sounds, surfaces, and friendly people.'
    };
  }
  const birthDate = new Date(birthDateStr);
  const diffDays = Math.max(1, Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeks = Math.max(1, Math.floor(diffDays / 7));

  if (weeks <= 12) {
    return {
      weeks,
      stage: 'Golden Socialization Window',
      badge: 'Peak Window',
      tip: 'Introduce to 5+ safe novel sounds, surfaces, and friendly people every week.'
    };
  } else if (weeks <= 16) {
    return {
      weeks,
      stage: 'Fear Imprint & Habituation Window',
      badge: 'Fear-Free Exposure',
      tip: 'Keep new experiences strictly positive with gentle pacing and high-value treats.'
    };
  } else if (weeks <= 24) {
    return {
      weeks,
      stage: 'Juvenile & Teething Phase',
      badge: 'Manners & Leash',
      tip: 'Channel teething energy into chew toys and loose-leash neighborhood strolls.'
    };
  } else {
    return {
      weeks,
      stage: 'Adolescent Skill Mastery',
      badge: 'Impulse Control',
      tip: 'Reinforce stay, recall, and calm greeting manners during hormone development.'
    };
  }
}

export const CareMilestonesHub: React.FC<CareMilestonesHubProps> = ({ 
  puppy, 
  onNavigate, 
  className = '',
  variant = 'grid'
}) => {
  const devStage = getPuppyDevelopmentStage(puppy.birthDate);

  // 1. Socialization Data
  const socialList = storage.getSocialization();
  const totalSocial = socialList.length || 11;
  const exposedSocial = socialList.filter(s => s.status && s.status !== 'unexposed' && s.status !== 'not_started').length;
  const socialPercent = Math.min(100, Math.round((exposedSocial / totalSocial) * 100));
  const nextSocialItem = socialList.find(s => !s.status || s.status === 'unexposed' || s.status === 'not_started') || socialList[0];

  // 2. Journal & Memories Data
  const journalEntries = storage.getJournal(puppy.id);
  const photos = journalEntries.filter(j => Boolean(j.mediaUrl));
  const hasCustomPhoto = Boolean(photos[0]?.mediaUrl || (puppy.photoUrl && !puppy.photoUrl.includes('placeholder') && !puppy.photoUrl.includes('via.placeholder')));
  const latestPhoto = photos[0]?.mediaUrl || puppy.photoUrl;

  // 3. Health & Vaccines Data
  const vaccinations = storage.getVaccinations(puppy.id);
  const appointments = storage.getAppointments(puppy.id);
  const nextVac = vaccinations.find(v => v.status === 'due_soon' || v.status === 'overdue');
  const nextApt = appointments.find(a => a.status === 'scheduled');

  // 4. Expenses & Vault Data
  const expenses = storage.getExpenses(puppy.id);
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
  const monthName = now.toLocaleString('default', { month: 'short' });
  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(currentMonthStr));
  const monthTotal = monthExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const documents = storage.getDocuments(puppy.id);

  // DESKTOP SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Developmental Milestone Stage Header */}
        <div className="bg-gradient-to-br from-[#FFF9F2] to-[#F3E7DA] rounded-2xl border border-[#E8DDD3] p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#8B5E3C] text-white px-2 py-0.5 rounded-full">
              Week {devStage.weeks} • {devStage.badge}
            </span>
            <span className="text-[11px] font-bold text-[#8B5E3C] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {puppy.name}'s Growth Hub
            </span>
          </div>
          <h4 className="text-xs font-black text-[#2C211B]">
            {devStage.stage}
          </h4>
          <p className="text-[11px] text-[#5F3E29] mt-1 leading-snug">
            {devStage.tip}
          </p>
        </div>

        {/* 1. Socialization & Grooming Card */}
        <div 
          onClick={() => onNavigate('socialization')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs hover:border-[#245C3C]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3EE] text-[#245C3C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#2C211B] group-hover:text-[#245C3C] transition-colors">
                  Socialization & Grooming
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  {exposedSocial} of {totalSocial} experiences checked
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#245C3C] bg-[#EAF3EE] px-2 py-0.5 rounded-lg border border-[#C8DEC3]">
              {socialPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#FAF6F0] h-2 rounded-full overflow-hidden border border-[#E8DDD3]/40">
            <div 
              className="bg-[#245C3C] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(8, socialPercent)}%` }}
            />
          </div>

          {/* Next Recommended Checklist Item */}
          {nextSocialItem && (
            <div className="mt-3 pt-2.5 border-t border-[#E8DDD3]/60 flex items-center justify-between text-[11px]">
              <span className="text-[#766A63] truncate max-w-[170px]">
                <strong className="text-[#2C211B] font-semibold">Next:</strong> {nextSocialItem.title}
              </span>
              <span className="text-[#245C3C] font-bold flex items-center gap-0.5 shrink-0 hover:underline">
                Log <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>

        {/* 2. Photo Memory Polaroid Card */}
        <div 
          onClick={() => onNavigate('journal')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs hover:border-[#8B5E3C]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2E4] text-[#8B5E3C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#2C211B] group-hover:text-[#8B5E3C] transition-colors">
                  Journal & Memories
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  {journalEntries.length > 0 ? `${journalEntries.length} puppyhood memories` : 'Capture first memories'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#8B5E3C] bg-[#FAF2E4] px-2 py-0.5 rounded-lg border border-[#EBD6C4] flex items-center gap-1">
              📸 {photos.length}
            </span>
          </div>

          {hasCustomPhoto && latestPhoto ? (
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#E8DDD3] shadow-inner group-hover:bg-white transition-colors">
              <div className="relative rounded-lg overflow-hidden aspect-[16/10]">
                <img 
                  src={latestPhoto} 
                  alt={puppy.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                  <div className="w-full flex items-center justify-between text-white">
                    <span className="text-[11px] font-bold truncate max-w-[170px] flex items-center gap-1">
                      <Heart className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                      {journalEntries[0]?.title || `${puppy.name}'s special day`}
                    </span>
                    <span className="text-[9px] font-medium text-white/80">
                      {journalEntries[0]?.date ? new Date(journalEntries[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#EBD6C4] bg-[#FFF9F2] rounded-xl p-3.5 text-center flex flex-col items-center justify-center gap-1 hover:bg-[#FAF2E4]/60 transition-colors">
              <Camera className="w-5 h-5 text-[#8B5E3C]" />
              <p className="text-xs font-bold text-[#2C211B]">Snap {puppy.name}'s first memory</p>
              <span className="text-[10px] text-[#8B5E3C] font-semibold">+ Add photo to storybook</span>
            </div>
          )}
        </div>

        {/* 3. Health & Clinic Hub Card */}
        <div 
          onClick={() => onNavigate('health')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs hover:border-[#A45238]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F8EBE3] text-[#A45238] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#2C211B] group-hover:text-[#A45238] transition-colors">
                  Health & Clinic Hub
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  {puppy.weightLbs} lbs • {vaccinations.length} vaccine records
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#766A63] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="bg-[#FAF6F0] rounded-xl p-2.5 border border-[#E8DDD3]/60 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              {nextVac ? (
                <span className="w-2 h-2 rounded-full bg-[#C46849] animate-pulse shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="text-xs font-bold text-[#2C211B] truncate">
                {nextVac ? `Due: ${nextVac.vaccineName}` : nextApt ? `Apt: ${nextApt.title}` : 'All core vaccines current'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#8C3F24] shrink-0 ml-1">
              {nextVac ? 'Schedule' : 'Records'}
            </span>
          </div>
        </div>

        {/* 4. Budget & Document Vault Card */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#2C211B] group-hover:text-amber-900 transition-colors">
                  Budget & Document Vault
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  ${monthTotal} this month • {documents.length} official docs
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#766A63] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200/60">
              {monthName} Spending: ${monthTotal}
            </span>
            <span className="text-[10px] font-semibold bg-[#FAF6F0] text-[#5F3E29] px-2 py-0.5 rounded-md border border-[#E8DDD3]">
              {documents.length > 0 ? `${documents.length} files saved` : 'Vault ready'}
            </span>
          </div>
        </div>

        {/* 1-Tap Quick Action Toolbar */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('journal')}
            className="flex-1 py-2 px-2.5 rounded-xl bg-white hover:bg-pink-50 border border-[#E8DDD3] hover:border-pink-200 text-xs font-bold text-[#2C211B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-pink-600" />
            + Memory
          </button>
          <button
            type="button"
            onClick={() => onNavigate('socialization')}
            className="flex-1 py-2 px-2.5 rounded-xl bg-white hover:bg-purple-50 border border-[#E8DDD3] hover:border-purple-200 text-xs font-bold text-[#2C211B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-purple-600" />
            + Socialize
          </button>
          <button
            type="button"
            onClick={() => onNavigate('expenses')}
            className="flex-1 py-2 px-2.5 rounded-xl bg-white hover:bg-amber-50 border border-[#E8DDD3] hover:border-amber-200 text-xs font-bold text-[#2C211B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-700" />
            + Expense
          </button>
        </div>
      </div>
    );
  }

  // MOBILE & TABLET GLANCEABLE GRID VARIANT
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#2C211B] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8B5E3C]" />
            Care & Milestones Hub
          </h3>
          <p className="text-[11px] text-[#766A63]">
            Week {devStage.weeks} • {devStage.badge}
          </p>
        </div>
        <button
          onClick={() => onNavigate('more')}
          className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-0.5 cursor-pointer bg-[#F3E7DA] px-2.5 py-1 rounded-full"
        >
          All Tools <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Socialization */}
        <div 
          onClick={() => onNavigate('socialization')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-xs hover:border-[#245C3C]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EE] text-[#245C3C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black bg-[#EAF3EE] text-[#245C3C] px-1.5 py-0.5 rounded-md border border-[#C8DEC3]">
                {socialPercent}%
              </span>
            </div>
            <h4 className="text-xs font-black text-[#2C211B] line-clamp-1">Socialization</h4>
            <p className="text-[10px] text-[#766A63] mt-0.5 line-clamp-1">
              {exposedSocial}/{totalSocial} checked
            </p>
          </div>
          <div className="mt-2.5 w-full bg-[#FAF6F0] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#245C3C] h-full rounded-full transition-all duration-300" 
              style={{ width: `${Math.max(10, socialPercent)}%` }} 
            />
          </div>
        </div>

        {/* Card 2: Journal & Memories */}
        <div 
          onClick={() => onNavigate('journal')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-xs hover:border-[#8B5E3C]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF2E4] text-[#8B5E3C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black bg-[#FAF2E4] text-[#8B5E3C] px-1.5 py-0.5 rounded-md border border-[#EBD6C4]">
                📸 {photos.length}
              </span>
            </div>
            <h4 className="text-xs font-black text-[#2C211B] line-clamp-1">Journal & Pics</h4>
            <p className="text-[10px] text-[#766A63] mt-0.5 line-clamp-1">
              {journalEntries.length > 0 ? `${journalEntries.length} memories` : 'Snap first story'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#8B5E3C] mt-2 block">
            + Add Memory
          </span>
        </div>

        {/* Card 3: Health & Vet */}
        <div 
          onClick={() => onNavigate('health')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-xs hover:border-[#A45238]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#F8EBE3] text-[#A45238] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black bg-[#F8EBE3] text-[#8C3F24] px-1.5 py-0.5 rounded-md border border-[#EACEC3]">
                {puppy.weightLbs} lbs
              </span>
            </div>
            <h4 className="text-xs font-black text-[#2C211B] line-clamp-1">Health & Clinic</h4>
            <p className="text-[10px] text-[#766A63] mt-0.5 line-clamp-1">
              {nextVac ? `Due: ${nextVac.vaccineName}` : nextApt ? `Apt: ${nextApt.title}` : 'Vaccines up to date'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#8C3F24] mt-2 block truncate">
            {nextVac ? 'Vaccine due' : 'View records'}
          </span>
        </div>

        {/* Card 4: Budget & Vault */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-xs hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-100">
                ${monthTotal}
              </span>
            </div>
            <h4 className="text-xs font-black text-[#2C211B] line-clamp-1">Budget & Vault</h4>
            <p className="text-[10px] text-[#766A63] mt-0.5 line-clamp-1">
              {documents.length > 0 ? `${documents.length} docs filed` : 'Store documents'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-800 mt-2 block">
            Scan receipts
          </span>
        </div>
      </div>
    </div>
  );
};
