import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Check, 
  ArrowRight, 
  Sparkles,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';

export interface HeadsUpAlertData {
  id: string;
  title: string;
  message: string;
  category: string;
  actionUrl?: string;
  viewName?: string;
  timestamp: number;
  taskId?: string;
  puppyName?: string;
}

interface HeadsUpNotificationProps {
  puppy: PuppyProfile | null;
  onNavigate: (view: any) => void;
  onShowToast: (msg: string) => void;
}

export const HeadsUpNotification: React.FC<HeadsUpNotificationProps> = ({
  puppy,
  onNavigate,
  onShowToast,
}) => {
  const [alert, setAlert] = useState<HeadsUpAlertData | null>(null);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [successActionMsg, setSuccessActionMsg] = useState<string | null>(null);

  const durationMs = (storage.getSettings().headsUpDurationSec || 12) * 1000;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressStepMs = 100;

  useEffect(() => {
    const handleAlertEvent = (e: Event) => {
      const customEvent = e as CustomEvent<HeadsUpAlertData>;
      if (customEvent.detail) {
        setAlert(customEvent.detail);
        setProgress(100);
        setSuccessActionMsg(null);
      }
    };

    window.addEventListener('puplume-headsup-alert', handleAlertEvent);
    return () => {
      window.removeEventListener('puplume-headsup-alert', handleAlertEvent);
    };
  }, []);

  // Countdown timer for auto-dismiss
  useEffect(() => {
    if (!alert || successActionMsg) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          const next = prev - (progressStepMs / durationMs) * 100;
          if (next <= 0) {
            setAlert(null);
            return 0;
          }
          return next;
        });
      }
    }, progressStepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [alert, isHovered, successActionMsg]);

  if (!alert) return null;

  const puppyName = alert.puppyName || puppy?.name || 'your puppy';
  const pupId = puppy?.id || '';

  const handleQuickPottyLog = (type: 'pee' | 'poop' | 'both') => {
    if (!pupId) return;

    storage.addPottyLog({
      puppyId: pupId,
      timestamp: new Date().toISOString(),
      type,
      location: 'outdoor',
      notes: 'Logged via Quick Alert'
    });

    const label = type === 'pee' ? 'Pee break' : type === 'poop' ? 'Poop break' : 'Potty break';
    setSuccessActionMsg(`✓ ${label} recorded for ${puppyName}!`);
    onShowToast(`Recorded ${label} for ${puppyName}`);

    setTimeout(() => {
      setAlert(null);
      setSuccessActionMsg(null);
    }, 1800);
  };

  const handleQuickTaskComplete = (taskId?: string) => {
    if (!taskId) return;
    storage.toggleTask(taskId);
    setSuccessActionMsg(`✓ Task marked completed!`);
    onShowToast(`Task marked complete!`);

    setTimeout(() => {
      setAlert(null);
      setSuccessActionMsg(null);
    }, 1800);
  };

  const handleSnooze = () => {
    const snoozeMins = storage.getSettings().snoozeDurationMin || 15;
    onShowToast(`Alert snoozed for ${snoozeMins} minutes`);
    setAlert(null);
  };

  const handleNavigate = () => {
    if (alert.viewName) {
      onNavigate(alert.viewName);
    } else if (alert.category === 'potty') {
      onNavigate('potty');
    } else if (alert.category === 'tasks') {
      onNavigate('tasks');
    } else if (alert.category === 'health') {
      onNavigate('health');
    }
    setAlert(null);
  };

  return (
    <div 
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-[9999] sm:max-w-md w-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border-2 border-[#8B5E3C]/30 shadow-2xl p-4 sm:p-5 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Auto-dismiss progress bar */}
        {!successActionMsg && (
          <div 
            className="absolute top-0 left-0 h-1 bg-[#8B5E3C] transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Success Feedback View */}
        {successActionMsg ? (
          <div className="flex items-center gap-3 py-2 text-emerald-800 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#2C211B]">{successActionMsg}</h4>
              <p className="text-xs text-[#766A63]">PupLume schedule and analytics updated.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top Bar: Category Pill & Close */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B5E3C] bg-[#F3E7DA] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {alert.category === 'potty' && '🐾 Potty Break Alert'}
                  {alert.category === 'tasks' && '📋 Routine Planner'}
                  {alert.category === 'health' && '💊 Health Reminder'}
                  {alert.category !== 'potty' && alert.category !== 'tasks' && alert.category !== 'health' && '🔔 PupLume Notification'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleSnooze}
                  title={`Snooze ${storage.getSettings().snoozeDurationMin || 15} minutes`}
                  className="text-[11px] font-semibold text-[#766A63] hover:text-[#2C211B] px-2 py-0.5 rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  Snooze ({storage.getSettings().snoozeDurationMin || 15}m)
                </button>
                <button
                  onClick={() => setAlert(null)}
                  className="p-1 text-[#766A63] hover:text-[#2C211B] rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alert Content Row */}
            <div className="flex items-start gap-3">
              {/* Puppy Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] border border-[#E8DDD3] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {puppy?.photoUrl ? (
                  <img src={puppy.photoUrl} alt={puppyName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🐶</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-[#2C211B] leading-tight">
                  {alert.title}
                </h4>
                <p className="text-xs text-[#766A63] mt-1 line-clamp-2">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 border-t border-[#F3E7DA] flex flex-wrap items-center gap-2">
              {alert.category === 'potty' && (
                <>
                  <button
                    onClick={() => handleQuickPottyLog('pee')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                  >
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Quick Pee</span>
                  </button>

                  <button
                    onClick={() => handleQuickPottyLog('poop')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                  >
                    <span>💩 Quick Poop</span>
                  </button>

                  <button
                    onClick={handleNavigate}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#6D492F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102 active:scale-98"
                  >
                    <span>Tracker</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}

              {alert.category === 'tasks' && (
                <>
                  {alert.taskId && (
                    <button
                      onClick={() => handleQuickTaskComplete(alert.taskId)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}
                  <button
                    onClick={handleNavigate}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Open Planner</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}

              {alert.category !== 'potty' && alert.category !== 'tasks' && (
                <button
                  onClick={handleNavigate}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#6D492F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span>Open Alert Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
