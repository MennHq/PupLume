import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Clock, 
  Award, 
  ChevronRight, 
  Pause, 
  RotateCcw, 
  Check, 
  AlertCircle,
  BookOpen,
  Share2
} from 'lucide-react';
import { PuppyProfile, TrainingLesson } from '../types';
import { storage } from '../lib/storage';
import { nativeBridge } from '../lib/nativeBridge';
import { playNotificationChime } from '../lib/sound';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

interface TrainingAcademyViewProps {
  puppy: PuppyProfile;
  activeLessonId?: string | null;
  onCloseLessonModal?: () => void;
}

export const TrainingAcademyView: React.FC<TrainingAcademyViewProps> = ({ 
  puppy,
  activeLessonId,
  onCloseLessonModal 
}) => {
  const [lessons, setLessons] = useState<TrainingLesson[]>(storage.getTrainingLessons());
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [activeLesson, setActiveLesson] = useState<TrainingLesson | null>(() => {
    if (activeLessonId) {
      return storage.getTrainingLessons().find(l => l.id === activeLessonId) || null;
    }
    return null;
  });

  // Practice Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setLessons(storage.getTrainingLessons());
    });
  }, []);

  // Sync if prop changes
  React.useEffect(() => {
    if (activeLessonId) {
      const found = storage.getTrainingLessons().find(l => l.id === activeLessonId);
      if (found) {
        setActiveLesson(found);
        setTimerSeconds(found.durationMin * 60);
      }
    }
  }, [activeLessonId]);

  // Screen Wake Lock & Timer tick
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      nativeBridge.wakeLock.request('academy-timer');
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      if (isTimerRunning) {
        nativeBridge.haptics.success();
        playNotificationChime();
      }
      setIsTimerRunning(false);
      nativeBridge.wakeLock.release('academy-timer');
    } else {
      nativeBridge.wakeLock.release('academy-timer');
    }
    return () => {
      if (interval) clearInterval(interval);
      nativeBridge.wakeLock.release('academy-timer');
    };
  }, [isTimerRunning, timerSeconds]);

  const modules = [
    { id: 'all', title: 'All Modules' },
    { id: 'Foundation', title: '1. Foundation' },
    { id: 'House Training', title: '2. House Training' },
    { id: 'Puppy Behavior', title: '3. Behavior & Teething' },
    { id: 'Crate', title: '4. Crate & Independence' },
    { id: 'Walking', title: '5. Loose Leash & Recall' },
    { id: 'Socialization', title: '6. Socialization' }
  ];

  const masteredCount = lessons.filter(l => l.mastered).length;
  const completedCount = lessons.filter(l => l.completed).length;

  const filteredLessons = lessons.filter(l => {
    if (selectedModule === 'all') return true;
    return l.moduleTitle.toLowerCase().includes(selectedModule.toLowerCase());
  });

  const handleOpenLesson = (lesson: TrainingLesson) => {
    setActiveLesson(lesson);
    setTimerSeconds(lesson.durationMin * 60);
    setIsTimerRunning(false);
  };

  const handleCloseModal = () => {
    setActiveLesson(null);
    setIsTimerRunning(false);
    if (onCloseLessonModal) onCloseLessonModal();
  };

  const handleToggleMastered = (lessonId: string) => {
    if (!activeLesson) return;
    const isNowMastered = !activeLesson.mastered;
    if (isNowMastered) {
      nativeBridge.haptics.success();
      playNotificationChime();
    } else {
      nativeBridge.haptics.light();
    }
    const updated = storage.updateLessonStatus(lessonId, true, isNowMastered);
    localStorage.setItem('puplume_did_academy', 'true');
    window.dispatchEvent(new CustomEvent('puplume-action-completed', { detail: { action: 'academy' } }));
    setLessons([...updated]);
    setActiveLesson({ ...activeLesson, completed: true, mastered: isNowMastered });
  };

  const handleMarkPracticed = (lessonId: string) => {
    if (!activeLesson) return;
    nativeBridge.haptics.success();
    const updated = storage.updateLessonStatus(lessonId, true, activeLesson.mastered);
    localStorage.setItem('puplume_did_academy', 'true');
    window.dispatchEvent(new CustomEvent('puplume-action-completed', { detail: { action: 'academy' } }));
    setLessons([...updated]);
    setActiveLesson({ ...activeLesson, completed: true });
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Academy Header Card */}
      <div className="bg-gradient-to-r from-[#FFF9F2] via-[#F3E7DA]/60 to-[#FFF9F2] rounded-2xl sm:rounded-3xl border border-[#E8DDD3] p-3.5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-2xl font-extrabold text-[#2C211B]">
              Training Academy
            </h1>
            <span className="text-[10px] sm:text-xs font-bold bg-[#8B5E3C] text-white px-2 py-0.5 sm:px-2.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {masteredCount} Mastered
            </span>
          </div>
          <p className="hidden sm:block text-xs text-[#766A63] mt-1 max-w-lg">
            Science-backed positive reinforcement curriculum for {puppy.name}. 5-minute micro-drills keep sessions fun, engaged, and frustration-free.
          </p>
        </div>

        {/* Progress meter */}
        <div className="w-full sm:w-auto bg-white px-3 py-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#E8DDD3] shadow-2xs flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:min-w-[130px]">
          <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
              Mastery
            </span>
            <span className="text-xs sm:text-xl font-black text-[#2C211B] sm:mt-0.5">
              {Math.round((masteredCount / lessons.length) * 100)}%
            </span>
          </div>
          <div className="w-24 sm:w-full bg-[#E8DDD3] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#8B5E3C] h-full rounded-full transition-all duration-500"
              style={{ width: `${(masteredCount / lessons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedModule(m.id)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl border whitespace-nowrap cursor-pointer transition-all ${
              selectedModule === m.id
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                : 'bg-white text-[#766A63] border-[#E8DDD3] hover:bg-[#FFF9F2]'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            id={`lesson-card-${lesson.id}`}
            onClick={() => handleOpenLesson(lesson)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
              lesson.mastered
                ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                : lesson.completed
                ? 'bg-[#FFF9F2] border-[#8B5E3C]/30 hover:border-[#8B5E3C]'
                : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/50 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C]">
                  {lesson.moduleTitle}
                </span>
                <span className="text-[11px] text-[#766A63] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.durationMin} min
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#2C211B] group-hover:text-[#8B5E3C] transition-colors leading-snug">
                {lesson.title}
              </h3>
              <p className="text-xs text-[#766A63] mt-1 line-clamp-2 leading-relaxed">
                {lesson.goal}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8DDD3]/60 flex items-center justify-between">
              {lesson.mastered ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-100" /> Mastered
                </span>
              ) : lesson.completed ? (
                <span className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> In Progress
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#766A63]">
                  Not Started
                </span>
              )}

              <button className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Start Drill <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Lesson Modal */}
      <Modal
        isOpen={!!activeLesson}
        onClose={handleCloseModal}
        maxWidth="lg"
        title={activeLesson?.title || 'Interactive Lesson'}
        subtitle={activeLesson ? `${activeLesson.moduleTitle} • ${activeLesson.durationMin} min session` : ''}
      >
        {activeLesson && (
          <div className="space-y-5">
            {/* Goal & Why It Matters */}
            <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C]">
                  Lesson Objective
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#2C211B] mt-0.5">
                  {activeLesson.goal}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                  Why this matters
                </span>
                <p className="text-xs text-[#5F3E29] mt-0.5 leading-relaxed">
                  {activeLesson.whyItMatters}
                </p>
              </div>
            </div>

            {/* Practice Timer */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-[#2C211B] block">Micro-Session Timer</span>
                <span className="text-[11px] text-[#766A63]">Keep sessions brief and always end on a success!</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#8B5E3C] bg-[#FFF9F2] px-4 py-1.5 rounded-xl border border-[#E8DDD3]">
                  {formatTimer(timerSeconds)}
                </div>

                <button
                  type="button"
                  id="lesson-timer-toggle-btn"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#5F3E29] text-white transition-colors cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(activeLesson.durationMin * 60);
                  }}
                  className="p-2.5 rounded-xl border border-[#E8DDD3] hover:bg-[#F3E7DA] text-[#766A63] transition-colors cursor-pointer"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C211B] mb-3">
                Step-by-Step Drill
              </h4>
              <div className="space-y-2.5">
                {activeLesson.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3]/80 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[#2C211B] leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Pro Trainer Tip
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {activeLesson.proTip || activeLesson.tips?.[0] || 'Keep sessions positive, cheerful, and under 5 minutes.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Avoid This Mistake
                </span>
                <p className="text-amber-800 leading-relaxed">
                  {activeLesson.commonMistake || activeLesson.commonMistakes?.[0] || 'Repeating commands when puppy is distracted. Reset attention first.'}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-[#E8DDD3]">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  variant={activeLesson.completed ? 'outline' : 'secondary'}
                  onClick={() => handleMarkPracticed(activeLesson.id)}
                  className="w-full sm:w-1/2"
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  {activeLesson.completed ? 'Practiced Today ✓' : 'Mark as Practiced'}
                </Button>

                <Button
                  variant={activeLesson.mastered ? 'outline' : 'primary'}
                  onClick={() => handleToggleMastered(activeLesson.id)}
                  className="w-full sm:w-1/2"
                  leftIcon={<Award className="w-4 h-4" />}
                >
                  {activeLesson.mastered ? 'Mastered! (Click to Unmark)' : 'Mark Mastered 🎉'}
                </Button>
              </div>

              {(activeLesson.mastered || activeLesson.completed) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    nativeBridge.haptics.medium();
                    nativeBridge.share.achievement(activeLesson.title, puppy.name);
                  }}
                  className="w-full text-[#8B5E3C] border-[#8B5E3C]/30 hover:bg-[#FFF9F2]"
                  leftIcon={<Share2 className="w-4 h-4 text-[#8B5E3C]" />}
                  title="Share trick badge via WhatsApp, Messages, AirDrop"
                >
                  Share {puppy.name}&apos;s Achievement 🏆
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
