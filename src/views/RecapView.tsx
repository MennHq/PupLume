import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  Calendar, 
  Award, 
  Droplet, 
  Moon, 
  Footprints, 
  GraduationCap, 
  Share2, 
  Copy, 
  Check, 
  Flame, 
  Heart, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { 
  getWeeklyRecapData, 
  getMonthlyRecapData, 
  formatRecapShareText,
  WeeklyRecapData,
  MonthlyRecapData
} from '../lib/recapEngine';
import { FullScreenConfetti } from '../components/ui/FullScreenConfetti';
import { Button } from '../components/ui/Button';

interface RecapViewProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
}

type PeriodOption = 'this_week' | 'last_week' | 'this_month';

export const RecapView: React.FC<RecapViewProps> = ({ puppy, onNavigate }) => {
  const [period, setPeriod] = useState<PeriodOption>('this_week');
  const [copiedToast, setCopiedToast] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isWeekly = period !== 'this_month';
  const weekOffset = period === 'last_week' ? 1 : 0;
  const monthOffset = 0;

  const weeklyData: WeeklyRecapData = getWeeklyRecapData(puppy, weekOffset);
  const monthlyData: MonthlyRecapData = getMonthlyRecapData(puppy, monthOffset);

  const activeData = isWeekly ? weeklyData : monthlyData;
  const currentScore = activeData.scoreBreakdown;
  const currentBadge = activeData.badge;
  const currentInsight = activeData.insightSummary;

  // Only fire confetti when the score is legitimately good (>= 7.0/10)
  const isPassingGrade = currentScore.score >= 7.0;

  useEffect(() => {
    if (isPassingGrade) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4500);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [period, isPassingGrade]);

  const handleShare = async () => {
    const recapType = isWeekly ? 'weekly' : 'monthly';
    const shareText = formatRecapShareText(recapType, activeData, puppy);

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${puppy.name}'s ${isWeekly ? 'Weekly' : 'Monthly'} Paw-gress Report`,
          text: shareText,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const completedHabits = activeData.tasks.completed;
  const totalHabits = activeData.tasks.total;
  const habitRate = activeData.tasks.completionRate;

  const totalPotty = activeData.potty.totalLogs;
  const outdoorPotty = activeData.potty.outdoor;
  const pottyRate = activeData.potty.reliabilityRate;

  const walkMinutes = activeData.walks.totalMinutes;
  const walkCount = activeData.walks.totalWalks;

  const sleepHours = activeData.sleep.dailyAverageHours;

  const isOffTrack = currentScore.score < 3.5;
  const isNeedsWork = currentScore.score < 6.5;

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-6 animate-in fade-in duration-200">
      {showConfetti && <FullScreenConfetti />}

      {/* Floating Toast Notification */}
      {copiedToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#2C211B] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-[#E8DDD3]/30 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Pupdate summary copied to clipboard!</span>
        </div>
      )}

      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] transition-colors cursor-pointer self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* 3-Way Segmented Period Selector */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-[#E8DDD3] shadow-2xs self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setPeriod('this_week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              period === 'this_week'
                ? 'bg-[#8B5E3C] text-white shadow-xs'
                : 'text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('last_week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              period === 'last_week'
                ? 'bg-[#8B5E3C] text-white shadow-xs'
                : 'text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              period === 'this_month'
                ? 'bg-[#8B5E3C] text-white shadow-xs'
                : 'text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Hero Scorecard: All-in-One, Clean & Honest */}
      <div className={`rounded-3xl border-2 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${
        isOffTrack 
          ? 'bg-gradient-to-br from-[#FFF9F6] via-[#FFF5EF] to-[#FAF0E6] border-[#EACEC3]' 
          : isNeedsWork 
          ? 'bg-gradient-to-br from-[#FFFBF2] via-[#FFF6E9] to-[#FAF2E4] border-[#EAD7C4]' 
          : 'bg-gradient-to-br from-[#FFF9F2] via-[#FFF4E8] to-[#F3E7DA] border-[#E8DDD3]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={puppy.photoUrl}
              alt={puppy.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#8B5E3C] shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isOffTrack 
                    ? 'bg-[#F6E8E2] text-[#8C3F24] border-[#EACEC3]' 
                    : isNeedsWork 
                    ? 'bg-[#F9EDE0] text-[#8C4E28] border-[#EBD6C4]' 
                    : 'bg-[#F3E7DA] text-[#5F3E29] border-[#E8DDD3]'
                }`}>
                  {currentScore.gradeLabel}
                </span>
                <span className="text-xs font-bold text-[#8B5E3C]">
                  {activeData.displayRange}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-black text-[#2C211B] mt-1">
                {puppy.name}'s Paw-gress Score
              </h1>
            </div>
          </div>

          {/* Large Glanceable Score Display */}
          <div className="sm:text-right bg-white/70 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#E8DDD3]">
            <div className="flex items-baseline gap-1.5 sm:justify-end">
              <span className={`text-3xl sm:text-4xl font-black ${
                isOffTrack ? 'text-[#A45238]' : isNeedsWork ? 'text-[#A86438]' : 'text-[#8B5E3C]'
              }`}>
                {currentScore.score}
              </span>
              <span className="text-sm font-bold text-[#766A63]">/ 10</span>
            </div>
            <span className="text-[11px] font-bold text-[#766A63] block">
              {currentBadge.title}
            </span>
          </div>
        </div>

        {/* Coach Takeaway Bubble */}
        <div className={`mt-4 p-3.5 rounded-2xl border text-xs font-medium ${
          isOffTrack 
            ? 'bg-white/80 border-[#EACEC3] text-[#5F3E29]' 
            : isNeedsWork 
            ? 'bg-white/80 border-[#EAD7C4] text-[#5F3E29]' 
            : 'bg-white/80 border-[#E8DDD3] text-[#5F3E29]'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0 mt-0.5">{currentBadge.emoji}</span>
            <div className="flex-1">
              <strong className={`font-black block mb-0.5 ${
                isOffTrack ? 'text-[#A45238]' : 'text-[#8B5E3C]'
              }`}>
                {isOffTrack ? 'Coach Feedback & Next Step' : 'Parent Coach Insight'}
              </strong>
              <p className="leading-relaxed text-[#5F3E29]">
                {currentInsight}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button if Routine Needs Help */}
        {currentScore.score < 6.0 && (
          <div className="mt-4 pt-3 border-t border-[#E8DDD3]/60 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#766A63] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#A45238]" />
              Check off tasks today to lift your score
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('tasks')}
                className="text-xs font-bold"
              >
                Open Daily Habits
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('potty')}
                className="text-xs font-bold"
              >
                Log Potty
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Core Vitals (Glanceable 4-Card Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Vital 1: Habit Rhythm */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#766A63] mb-1">
            <span className="text-[10px] uppercase tracking-wider">Habits</span>
            {completedHabits === 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-[#A45238]" />
            ) : habitRate < 50 ? (
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${completedHabits === 0 ? 'text-[#A45238]' : 'text-[#2C211B]'}`}>
              {completedHabits}
            </span>
            <span className="text-[11px] text-[#766A63]">/ {totalHabits}</span>
          </div>
          <span className={`text-[10px] font-bold block mt-1 ${
            completedHabits === 0 ? 'text-[#A45238]' : 'text-[#766A63]'
          }`}>
            {completedHabits === 0 ? '0% • Inactive' : `${habitRate}% completed`}
          </span>
        </div>

        {/* Vital 2: Potty Reliability */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#766A63] mb-1">
            <span className="text-[10px] uppercase tracking-wider">Potty</span>
            <Droplet className={`w-3.5 h-3.5 ${totalPotty === 0 ? 'text-stone-400' : 'text-sky-600'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${totalPotty === 0 ? 'text-stone-500' : 'text-[#2C211B]'}`}>
              {totalPotty === 0 ? '0%' : `${pottyRate}%`}
            </span>
          </div>
          <span className={`text-[10px] font-bold block mt-1 ${
            totalPotty === 0 ? 'text-[#A45238]' : 'text-[#766A63]'
          }`}>
            {totalPotty === 0 ? '0 breaks logged' : `${outdoorPotty} outdoor logs`}
          </span>
        </div>

        {/* Vital 3: Active Exercise */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#766A63] mb-1">
            <span className="text-[10px] uppercase tracking-wider">Walks</span>
            <Footprints className={`w-3.5 h-3.5 ${walkMinutes === 0 ? 'text-stone-400' : 'text-amber-600'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#2C211B]">
              {walkMinutes}
            </span>
            <span className="text-[11px] text-[#766A63]">min</span>
          </div>
          <span className="text-[10px] font-bold text-[#766A63] block mt-1">
            {walkCount === 0 ? '0 walks logged' : `${walkCount} walks`}
          </span>
        </div>

        {/* Vital 4: Sleep & Rest */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#766A63] mb-1">
            <span className="text-[10px] uppercase tracking-wider">Sleep</span>
            <Moon className={`w-3.5 h-3.5 ${sleepHours === 0 ? 'text-stone-400' : 'text-indigo-600'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#2C211B]">
              {sleepHours}
            </span>
            <span className="text-[11px] text-[#766A63]">hrs/d</span>
          </div>
          <span className="text-[10px] font-bold text-[#766A63] block mt-1">
            {sleepHours === 0 ? 'Untracked' : 'Daily average'}
          </span>
        </div>
      </div>

      {/* 7-Day Habit Activity Rhythm (Weekly only) */}
      {isWeekly && (
        <div className="bg-white rounded-3xl border border-[#E8DDD3] p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-black text-[#2C211B] flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#8B5E3C]" />
              7-Day Habit Activity
            </h3>
            <span className="text-[11px] font-bold text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.5 rounded-lg border border-[#E8DDD3]">
              Best Streak: {weeklyData.tasks.bestStreakDays} Days 🔥
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {weeklyData.tasks.dailyRhythm.map((day) => {
              const hasActivity = day.completedTasks > 0;
              return (
                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                  <div className={`w-full h-10 sm:h-12 rounded-xl flex items-center justify-center font-black text-[11px] transition-all border ${
                    day.isToday
                      ? 'border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20'
                      : 'border-transparent'
                  } ${
                    day.completionRate >= 80
                      ? 'bg-[#8B5E3C] text-white'
                      : day.completionRate > 0
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-[#FAF6F0] text-stone-400'
                  }`}>
                    {hasActivity ? `${day.completionRate}%` : '—'}
                  </div>
                  <span className={`text-[10px] font-bold ${
                    day.isToday ? 'text-[#8B5E3C]' : 'text-[#766A63]'
                  }`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2 Focused Area Cards: Potty & Training */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Potty Progress */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-[#2C211B] flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-600" />
                Housebreaking
              </h4>
              <span className="text-[10px] font-bold bg-[#FAF6F0] text-[#766A63] px-2 py-0.5 rounded-md">
                {outdoorPotty} outdoor / {totalPotty} total
              </span>
            </div>
            <p className="text-xs text-[#766A63] leading-relaxed">
              {totalPotty === 0 
                ? `No breaks recorded for ${puppy.name} this period. Consistent outdoor trips prevent indoor accidents.`
                : `${pottyRate}% outdoor accuracy recorded across ${totalPotty} total bathroom breaks.`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('potty')}
            className="mt-3 text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 transition-colors cursor-pointer self-start"
          >
            Open Potty Tracker <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Academy Skills */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-[#2C211B] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#8B5E3C]" />
                Puppy Academy
              </h4>
              <span className="text-[10px] font-bold bg-[#FAF6F0] text-[#766A63] px-2 py-0.5 rounded-md">
                {isWeekly ? `${weeklyData.training.lessonsMastered} Mastered` : `${monthlyData.training.lessonsCompleted} Completed`}
              </span>
            </div>
            <p className="text-xs text-[#766A63] leading-relaxed">
              {isWeekly && weeklyData.training.lessonsPracticed === 0
                ? 'No drills practiced yet this week. A quick 3-minute Sit or Recall session builds impulse control.'
                : 'Interactive training drills stimulate young puppy minds and reinforce bonding.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('academy')}
            className="mt-3 text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 transition-colors cursor-pointer self-start"
          >
            Go to Academy <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Photo Highlights (Only if photos exist) */}
      {activeData.photos.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-black text-[#2C211B] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Photo Highlights
            </h4>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 cursor-pointer"
            >
              Journal <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {activeData.photos.slice(0, 4).map((photoUrl, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#E8DDD3] bg-stone-100">
                <img
                  src={photoUrl}
                  alt={`${puppy.name} memory ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean Share Bar (Fixed High-Contrast Readable Button) */}
      <div className="bg-gradient-to-r from-[#8B5E3C] to-[#5F3E29] rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black flex items-center gap-2">
            <span>🐾 Share {puppy.name}'s Pupdate</span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              Score: {currentScore.score}/10
            </span>
          </h3>
          <p className="text-xs text-[#F3E7DA] mt-0.5">
            Share this {isWeekly ? 'weekly' : 'monthly'} Paw-gress recap with family, dog sitters, or social media!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#5F3E29] hover:bg-[#FAF6F0] active:scale-98 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#8B5E3C]" />
            <span>Share Pupdate</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Copy Text Summary"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};