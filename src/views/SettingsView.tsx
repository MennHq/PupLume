import React, { useState } from 'react';
import { 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Cloud, 
  CheckCircle2, 
  Sparkles, 
  Dog, 
  Clock, 
  Moon, 
  Volume2, 
  VolumeX, 
  Zap, 
  Info, 
  Copy, 
  User, 
  Key 
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { useUser } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { engine as notificationEngine } from '../lib/NotificationEngine';
import { localAlarms } from '../lib/localAlarms';

interface SettingsViewProps {
  puppy: PuppyProfile;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ puppy, onResetData }) => {
  const { user } = useUser();
  const initialSettings = storage.getSettings();
  const [pottyAlerts, setPottyAlerts] = useState(initialSettings.pottyAlerts);
  const [feedingAlerts, setFeedingAlerts] = useState(initialSettings.feedingAlerts);
  const [trainingAlerts, setTrainingAlerts] = useState(initialSettings.trainingAlerts);
  const [medAlerts, setMedAlerts] = useState(initialSettings.medAlerts);
  const [taskAlerts, setTaskAlerts] = useState(initialSettings.taskAlerts !== false);
  const [units, setUnits] = useState<'imperial' | 'metric'>(initialSettings.units);
  const [chimeSound, setChimeSound] = useState(initialSettings.chimeSound !== false);
  const [pottyIntervalMode, setPottyIntervalMode] = useState<'age_dynamic' | 'custom'>(
    initialSettings.pottyIntervalMode || 'age_dynamic'
  );
  const [pottyCustomIntervalHours, setPottyCustomIntervalHours] = useState(
    initialSettings.pottyCustomIntervalHours || 2.5
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    initialSettings.quietHoursEnabled !== false
  );
  const [quietHoursStart, setQuietHoursStart] = useState(initialSettings.quietHoursStart || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(initialSettings.quietHoursEnd || '07:00');
  const [taskAdvanceMinutes, setTaskAdvanceMinutes] = useState(
    initialSettings.taskAdvanceMinutes !== undefined ? initialSettings.taskAdvanceMinutes : 15
  );
  const [headsUpDurationSec, setHeadsUpDurationSec] = useState(
    initialSettings.headsUpDurationSec || 12
  );
  const [snoozeDurationMin, setSnoozeDurationMin] = useState(
    initialSettings.snoozeDurationMin || 15
  );
  const [isSaved, setIsSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => 
    notificationEngine.getPermissionStatus()
  );

  const handleRequestPush = async () => {
    const res = await notificationEngine.requestPermission();
    setPushPermission(res);
    if (res === 'granted') {
      showStatus('Browser push notifications enabled successfully!');
    } else {
      showStatus('Notifications were not granted.');
    }
  };

  const [userName, setUserName] = useState(user?.firstName || user?.fullName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  React.useEffect(() => {
    if (user && !userName) setUserName(user.firstName || user.fullName || '');
  }, [user]);

  const cloudData = useQuery(api.app.getUserAppData, user?.id ? { userId: user.id } : 'skip');
  const memories = cloudData?.memories || [];
  const deleteMemory = useMutation(api.ai.deleteMemory);
  const saveSettingsMutation = useMutation(api.settings.saveSettings);

  React.useEffect(() => {
    if (cloudData?.settings) {
      const s = cloudData.settings;
      if (s.pottyAlerts !== undefined) setPottyAlerts(s.pottyAlerts);
      if (s.feedingAlerts !== undefined) setFeedingAlerts(s.feedingAlerts);
      if (s.trainingAlerts !== undefined) setTrainingAlerts(s.trainingAlerts);
      if (s.medAlerts !== undefined) setMedAlerts(s.medAlerts);
      if (s.taskAlerts !== undefined) setTaskAlerts(s.taskAlerts);
      if (s.units && (s.units === 'imperial' || s.units === 'metric')) setUnits(s.units);
      if (s.chimeSound !== undefined) setChimeSound(s.chimeSound);
      if (s.pottyIntervalMode) setPottyIntervalMode(s.pottyIntervalMode as any);
      if (s.pottyCustomIntervalHours !== undefined) setPottyCustomIntervalHours(s.pottyCustomIntervalHours);
      if (s.quietHoursEnabled !== undefined) setQuietHoursEnabled(s.quietHoursEnabled);
      if (s.quietHoursStart) setQuietHoursStart(s.quietHoursStart);
      if (s.quietHoursEnd) setQuietHoursEnd(s.quietHoursEnd);
      if (s.taskAdvanceMinutes !== undefined) setTaskAdvanceMinutes(s.taskAdvanceMinutes);
      if (s.headsUpDurationSec !== undefined) setHeadsUpDurationSec(s.headsUpDurationSec);
      if (s.snoozeDurationMin !== undefined) setSnoozeDurationMin(s.snoozeDurationMin);
    }
  }, [cloudData?.settings]);

  React.useEffect(() => {
    return storage.subscribe(() => {
      const s = storage.getSettings();
      setPottyAlerts(s.pottyAlerts);
      setFeedingAlerts(s.feedingAlerts);
      setTrainingAlerts(s.trainingAlerts);
      setMedAlerts(s.medAlerts);
      setTaskAlerts(s.taskAlerts !== false);
      setUnits(s.units);
      setChimeSound(s.chimeSound !== false);
      setPottyIntervalMode(s.pottyIntervalMode || 'age_dynamic');
      setPottyCustomIntervalHours(s.pottyCustomIntervalHours || 2.5);
      setQuietHoursEnabled(s.quietHoursEnabled !== false);
      setQuietHoursStart(s.quietHoursStart || '22:00');
      setQuietHoursEnd(s.quietHoursEnd || '07:00');
      setTaskAdvanceMinutes(s.taskAdvanceMinutes !== undefined ? s.taskAdvanceMinutes : 15);
      setHeadsUpDurationSec(s.headsUpDurationSec || 12);
      setSnoozeDurationMin(s.snoozeDurationMin || 15);
    });
  }, []);

  const showStatus = (msg: string) => {
    setBackupStatus(msg);
    setTimeout(() => setBackupStatus(null), 3500);
  };

  const handleExportJSON = () => {
    const jsonStr = storage.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PupLume-Backup-${puppy.name}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Full backup exported successfully!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const ok = await storage.importDataJSON(data);
          if (ok) {
            showStatus('PupLume data restored & synced to cloud!');
          } else {
            showStatus('Error: Invalid JSON backup file.');
          }
        } catch (err) {
          showStatus('Error: Invalid JSON backup file.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleSaveSettings = () => {
    const updated = {
      pottyAlerts,
      feedingAlerts,
      trainingAlerts,
      medAlerts,
      taskAlerts,
      units,
      activePuppyId: puppy.id,
      chimeSound,
      pottyIntervalMode,
      pottyCustomIntervalHours,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      taskAdvanceMinutes,
      headsUpDurationSec,
      snoozeDurationMin,
    };
    storage.saveSettings(updated);
    if (user?.id) {
      saveSettingsMutation({
        userId: user.id,
        ...updated,
      }).catch((err) => console.debug('[SettingsView] saveSettings error:', err));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const generateInitialAvatar = async (name: string): Promise<Blob> => {
    const cleanName = name.trim();
    await document.fonts.ready; // Ensure Grandstander is loaded
    
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No 2d context');

        const displayText = cleanName.length <= 4 ? cleanName : cleanName.charAt(0).toUpperCase();

        ctx.fillStyle = '#FFFDFE';
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#5F3E29'; // Dark brown text
        
        // Dynamically measure and scale text to fit inside the circular safe zone
        let fontSize = cleanName.length <= 4 ? 160 : 320;
        ctx.font = `900 ${fontSize}px "Grandstander", system-ui, sans-serif`;
        while (ctx.measureText(displayText).width > 400 && fontSize > 30) {
          fontSize -= 5;
          ctx.font = `900 ${fontSize}px "Grandstander", system-ui, sans-serif`;
        }
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(95, 62, 41, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        
        const yOffset = cleanName.length <= 4 ? 270 : 285;
        ctx.fillText(displayText, 256, yOffset);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Failed to create blob');
        }, 'image/png', 1.0);
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleUpdateName = async () => {
    if (!user || !userName.trim()) return;
    setIsUpdatingName(true);
    try {
      if (userName.trim() !== user.firstName) {
        await user.update({ firstName: userName.trim() });
      }
      const avatarFile = await generateInitialAvatar(userName.trim());
      await user.setProfileImage({ file: avatarFile });
      showStatus("Your name and profile picture have been updated!");
    } catch (e) {
      console.error(e);
      showStatus("Failed to update name.");
    } finally {
      setIsUpdatingName(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
          Settings & Preferences
        </h1>
        <p className="text-xs text-[#766A63] mt-1">
          Configure smart notification cadences, measurement systems, and data backup.
        </p>
      </div>

      {/* User Profile & Account ID */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B5E3C]" />
            Your Profile & Account Identity
          </h3>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
            user?.id 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            <CheckCircle2 className="w-3 h-3" />
            {user?.id ? 'Clerk & Convex Synced' : 'Guest / Local Device'}
          </span>
        </div>

        {/* User ID Section */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2C211B] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#8B5E3C]" />
              Unique User ID
            </span>
            {user?.primaryEmailAddress && (
              <span className="text-[11px] text-[#766A63] font-medium">
                {user.primaryEmailAddress.emailAddress}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#E8DDD3] font-mono text-xs text-[#5F3E29] select-all overflow-x-auto">
              {user?.id || storage.getCurrentUserId() || 'local-device-user'}
            </div>
            <button
              type="button"
              onClick={() => {
                const idToCopy = user?.id || storage.getCurrentUserId() || 'local-device-user';
                navigator.clipboard.writeText(idToCopy);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }}
              className="px-3 py-2 rounded-xl border border-[#E8DDD3] bg-white hover:bg-[#F3E7DA] text-xs font-bold text-[#5F3E29] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Copy User ID to clipboard"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#766A63]">
            This is your unique account identifier across PupLume, Clerk Auth, and Convex cloud database.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
            Your Name (Owner)
          </label>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex-1 p-2.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
            />
            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdatingName || !userName.trim()}
            >
              {isUpdatingName ? 'Saving...' : 'Update & Generate Logo'}
            </Button>
          </div>
        </div>
      </div>

      {/* Smart Notifications Studio */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DDD3]/60 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#2C211B] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#8B5E3C]" />
              Smart Notification Studio
            </h3>
            <p className="text-xs text-[#766A63] mt-0.5">
              Customize potty calculation rules, routine task timing, quiet hours, and alert behavior.
            </p>
          </div>
          {pushPermission === 'granted' ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await notificationEngine.testNotification();
                showStatus('Test alert triggered in-app!');
              }}
              className="text-xs whitespace-nowrap self-start sm:self-center shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Preview Alert
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={handleRequestPush}
              className="text-xs whitespace-nowrap self-start sm:self-center shrink-0 cursor-pointer"
            >
              Enable Notifications
            </Button>
          )}
        </div>

        {/* Native PWA Mobile Capabilities Card */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF9F2] to-amber-50/40 border border-[#E8DDD3] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#2C211B] flex items-center gap-1.5">
                  Zero-Internet Offline Alarms & App Shortcuts
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                    Native PWA
                  </span>
                </h4>
                <p className="text-[11px] text-[#766A63] mt-0.5">
                  Home screen 3D Touch quick actions (Potty, Meals, SOS) and hardware-level alarms that buzz even in Airplane Mode or out on hikes without WiFi.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const ok = await localAlarms.schedule({
                  title: `🐾 ${puppy.name}'s Potty Rhythm (Offline Alarm)`,
                  body: "This alarm was scheduled on your device hardware — rings even without internet or WiFi!",
                  targetTimestamp: Date.now() + 5000,
                  category: 'potty',
                  actionUrl: '/?action=potty'
                });
                if (ok) {
                  showStatus('Offline alarm scheduled! Lock your phone or wait 5 seconds.');
                } else {
                  showStatus('Please allow notifications to test offline alarms.');
                }
              }}
              className="text-xs shrink-0 whitespace-nowrap border-[#8B5E3C]/30 text-[#8B5E3C] hover:bg-[#FFF9F2]"
            >
              Test Offline Alarm (5s)
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-white/80 border border-[#E8DDD3] flex items-center gap-1.5">
              <span className="text-sm">🚽</span>
              <span className="font-bold text-[#2C211B]">3D Touch Potty</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 border border-[#E8DDD3] flex items-center gap-1.5">
              <span className="text-sm">🍖</span>
              <span className="font-bold text-[#2C211B]">Quick Meal Log</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 border border-[#E8DDD3] flex items-center gap-1.5">
              <span className="text-sm">📸</span>
              <span className="font-bold text-[#2C211B]">Camera Roll Share</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 border border-[#E8DDD3] flex items-center gap-1.5">
              <span className="text-sm">✈️</span>
              <span className="font-bold text-[#2C211B]">Airplane Alarms</span>
            </div>
          </div>
        </div>

        {/* 1. Smart Potty Cadence Calculation */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#8B5E3C]/10 text-[#8B5E3C] flex items-center justify-center font-bold text-sm">
                🐾
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#2C211B]">
                  Potty Reminder Calculation Rule
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  Choose how PupLume calculates bathroom break intervals for {puppy.name}.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#8B5E3C] bg-white px-2 py-0.5 rounded-full border border-[#E8DDD3]">
              {pottyIntervalMode === 'age_dynamic' ? 'Dynamic' : `${pottyCustomIntervalHours}h Fixed`}
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPottyIntervalMode('age_dynamic');
                storage.saveSettings({ ...storage.getSettings(), pottyIntervalMode: 'age_dynamic' });
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                pottyIntervalMode === 'age_dynamic'
                  ? 'bg-white border-[#8B5E3C] shadow-xs ring-1 ring-[#8B5E3C]'
                  : 'bg-[#FAF6F0] border-[#E8DDD3] hover:bg-white text-[#766A63]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C211B]">🐾 Veterinary Age-Dynamic</span>
                {pottyIntervalMode === 'age_dynamic' && <Check className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              </div>
              <p className="text-[11px] text-[#766A63] mt-1 leading-tight">
                Standard vet rule: 1 hour bladder capacity per month of age.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPottyIntervalMode('custom');
                storage.saveSettings({ ...storage.getSettings(), pottyIntervalMode: 'custom' });
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                pottyIntervalMode === 'custom'
                  ? 'bg-white border-[#8B5E3C] shadow-xs ring-1 ring-[#8B5E3C]'
                  : 'bg-[#FAF6F0] border-[#E8DDD3] hover:bg-white text-[#766A63]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C211B]">⏱ Custom Fixed Interval</span>
                {pottyIntervalMode === 'custom' && <Check className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              </div>
              <p className="text-[11px] text-[#766A63] mt-1 leading-tight">
                Select a fixed hour cadence regardless of puppy age.
              </p>
            </button>
          </div>

          {/* If Custom: Hours Selector */}
          {pottyIntervalMode === 'custom' ? (
            <div className="pt-2 border-t border-[#E8DDD3]/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#2C211B]">Remind every:</span>
              {[1.5, 2, 2.5, 3, 4].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => {
                    setPottyCustomIntervalHours(hours);
                    storage.saveSettings({ ...storage.getSettings(), pottyCustomIntervalHours: hours });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pottyCustomIntervalHours === hours
                      ? 'bg-[#8B5E3C] text-white shadow-xs'
                      : 'bg-white border border-[#E8DDD3] text-[#2C211B] hover:bg-[#FAF6F0]'
                  }`}
                >
                  {hours} hrs
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD3]/80 flex items-center gap-2 text-[11px] text-[#766A63]">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Based on <strong>{puppy.name}</strong>&apos;s age, the estimated bladder window is ~<strong>2.5 hours</strong>. Alerts adapt automatically as your pup grows!
              </span>
            </div>
          )}
        </div>

        {/* 2. Task Advance Notice & Timing */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#8B5E3C]/10 text-[#8B5E3C] flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4 text-[#8B5E3C]" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#2C211B]">
                Routine Schedule Task Advance Notice
              </h4>
              <p className="text-[11px] text-[#766A63]">
                How far in advance to alert you before scheduled walks, meals, and tasks:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { val: 0, label: 'At start (0m)' },
              { val: 5, label: '5m before' },
              { val: 10, label: '10m before' },
              { val: 15, label: '15m before (Recommended)' },
              { val: 30, label: '30m before' },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setTaskAdvanceMinutes(val);
                  storage.saveSettings({ ...storage.getSettings(), taskAdvanceMinutes: val });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  taskAdvanceMinutes === val
                    ? 'bg-[#8B5E3C] text-white shadow-xs'
                    : 'bg-white border border-[#E8DDD3] text-[#2C211B] hover:bg-[#FAF6F0]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quiet Hours (Sleep Schedule) */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#2C211B]">
                  Quiet Hours (Sleep Schedule)
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  Mutes routine reminders during your puppy&apos;s nighttime sleep.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !quietHoursEnabled;
                setQuietHoursEnabled(next);
                storage.saveSettings({ ...storage.getSettings(), quietHoursEnabled: next });
              }}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                quietHoursEnabled ? 'bg-[#8B5E3C]' : 'bg-[#E8DDD3]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {quietHoursEnabled && (
            <div className="pt-2 border-t border-[#E8DDD3]/60 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#766A63]">Mute from:</span>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => {
                    setQuietHoursStart(e.target.value);
                    storage.saveSettings({ ...storage.getSettings(), quietHoursStart: e.target.value });
                  }}
                  className="px-2.5 py-1 bg-white border border-[#E8DDD3] rounded-lg text-xs font-bold text-[#2C211B] focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#766A63]">Until:</span>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => {
                    setQuietHoursEnd(e.target.value);
                    storage.saveSettings({ ...storage.getSettings(), quietHoursEnd: e.target.value });
                  }}
                  className="px-2.5 py-1 bg-white border border-[#E8DDD3] rounded-lg text-xs font-bold text-[#2C211B] focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. In-App Heads-Up Card Behavior & Chime Audio */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#2C211B]">
                  Audio Chime & In-App Card Duration
                </h4>
                <p className="text-[11px] text-[#766A63]">
                  Fine-tune in-app Heads-Up popup timing and gentle notification sounds.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !chimeSound;
                setChimeSound(next);
                storage.saveSettings({ ...storage.getSettings(), chimeSound: next });
              }}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                chimeSound ? 'bg-[#8B5E3C]' : 'bg-[#E8DDD3]'
              }`}
              title={chimeSound ? 'Sound enabled' : 'Muted'}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  chimeSound ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-[#E8DDD3]/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#766A63] block mb-1.5">
                Heads-Up Banner Auto-Dismiss:
              </span>
              <div className="flex gap-1.5">
                {[8, 12, 15, 20].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setHeadsUpDurationSec(sec);
                      storage.saveSettings({ ...storage.getSettings(), headsUpDurationSec: sec });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      headsUpDurationSec === sec
                        ? 'bg-[#8B5E3C] text-white shadow-xs'
                        : 'bg-white border border-[#E8DDD3] text-[#2C211B]'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#766A63] block mb-1.5">
                Snooze Duration:
              </span>
              <div className="flex gap-1.5">
                {[10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setSnoozeDurationMin(mins);
                      storage.saveSettings({ ...storage.getSettings(), snoozeDurationMin: mins });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      snoozeDurationMin === mins
                        ? 'bg-[#8B5E3C] text-white shadow-xs'
                        : 'bg-white border border-[#E8DDD3] text-[#2C211B]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Notification Category Toggles */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-bold text-[#766A63] uppercase tracking-wider">
            Active Alert Categories
          </h4>
          {[
            { 
              id: 'potty', 
              label: '🐾 Predictive Potty Breaks', 
              desc: 'Countdowns to estimated bladder thresholds so you catch bathroom breaks on time', 
              state: pottyAlerts, 
              toggle: () => {
                const next = !pottyAlerts;
                setPottyAlerts(next);
                storage.saveSettings({ ...storage.getSettings(), pottyAlerts: next });
              } 
            },
            { 
              id: 'tasks', 
              label: '📋 Daily Routine & Schedule Tasks', 
              desc: 'Reminders for scheduled crate times, walks, grooming, and play routines', 
              state: taskAlerts, 
              toggle: () => {
                const next = !taskAlerts;
                setTaskAlerts(next);
                storage.saveSettings({ ...storage.getSettings(), taskAlerts: next });
              } 
            },
            { 
              id: 'feeding', 
              label: '🍲 Scheduled Mealtime Reminders', 
              desc: 'Breakfast, lunch, and dinner alerts to maintain reliable metabolic rhythms', 
              state: feedingAlerts, 
              toggle: () => {
                const next = !feedingAlerts;
                setFeedingAlerts(next);
                storage.saveSettings({ ...storage.getSettings(), feedingAlerts: next });
              } 
            },
            { 
              id: 'training', 
              label: '🎓 Daily Training Drills', 
              desc: '5-minute micro-session nudges when puppy is refreshed after a nap', 
              state: trainingAlerts, 
              toggle: () => {
                const next = !trainingAlerts;
                setTrainingAlerts(next);
                storage.saveSettings({ ...storage.getSettings(), trainingAlerts: next });
              } 
            },
            { 
              id: 'meds', 
              label: '💊 Preventatives & Health Booster Notices', 
              desc: 'Monthly heartworm/flea chews and clinic appointment reminders', 
              state: medAlerts, 
              toggle: () => {
                const next = !medAlerts;
                setMedAlerts(next);
                storage.saveSettings({ ...storage.getSettings(), medAlerts: next });
              } 
            }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]">
              <div>
                <h4 className="text-xs font-bold text-[#2C211B]">{item.label}</h4>
                <p className="text-[11px] text-[#766A63]">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={item.toggle}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                  item.state ? 'bg-[#8B5E3C]' : 'bg-[#E8DDD3]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    item.state ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement Units */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#2C211B]">Measurement Units</h3>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setUnits('imperial')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              units === 'imperial'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
            }`}
          >
            Imperial (lbs, cups)
          </button>
          <button
            onClick={() => setUnits('metric')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              units === 'metric'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
            }`}
          >
            Metric (kg, grams)
          </button>
        </div>
      </div>

      {/* Cloudinary Media Cloud Connection */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#8B5E3C]" />
            Cloud Media Storage
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        </div>
        <p className="text-xs text-[#766A63]">
          Pet photos, journal memory snapshots, and medical documents are saved directly to your secure cloud storage. When you log in from any device, all your pet&apos;s photos and records load automatically.
        </p>

        <div>
          <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
            Update {puppy.name}&apos;s Primary Photo
          </label>
          <CloudinaryImageUploader
            currentImageUrl={puppy.photoUrl}
            onUploadSuccess={(url) => {
              const updated = { ...puppy, photoUrl: url };
              storage.savePuppy(updated);
              showStatus(`${puppy.name}'s photo updated securely!`);
            }}
            folder="puplume/puppies"
            label={`Upload New Photo for ${puppy.name}`}
            sublabel="JPG, PNG, or WebP (Max 10MB)"
            variant="card"
            targetType="puppy_profile"
            targetId={puppy.id}
            enableCrop={true}
          />
        </div>
      </div>

      {/* AI Long-Term Memory */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#8B5E3C]" />
            AI Long-Term Memory
          </h3>
          <span className="text-[11px] font-bold text-[#766A63] bg-[#FFF9F2] px-2.5 py-0.5 rounded-full border border-[#E8DDD3]">
            {memories.length} Saved Facts
          </span>
        </div>
        <p className="text-xs text-[#766A63]">
          These are the personalized facts the AI Co-Pilot has learned about you and {puppy.name}. They are automatically referenced during chats to tailor advice.
        </p>

        {memories.length > 0 ? (
          <div className="space-y-2 mt-3">
            {memories.map((mem: any) => (
              <div key={mem._id} className="flex items-center justify-between p-3 bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl">
                <span className="text-[11px] font-medium text-[#2C211B]">{mem.fact}</span>
                <button
                  onClick={() => deleteMemory({ memoryId: mem._id, userId: user?.id })}
                  className="p-1.5 text-[#766A63] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl text-xs text-[#766A63]">
            No personalized memories saved yet. Chat with the AI and ask it to remember important facts!
          </div>
        )}
      </div>

      {/* Data Backup & Cloud Sync */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
          Data Portability & Backup
        </h3>
        <p className="text-xs text-[#766A63]">
          Your puppy data is stored offline-first on your device. You can download a full backup copy or restore on another phone.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download JSON Backup
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('replay-welcome-tour'));
              showStatus('Welcome tour reopened!');
            }}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />}
          >
            Replay Welcome Tour
          </Button>

          {(localStorage.getItem(`puplume_checklist_finished_forever_${puppy.id}`) === 'true' || Boolean(cloudData?.settings?.hasCompletedChecklist)) ? (
            <span className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Onboarding 100% Complete
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('reopen-getting-started'));
                showStatus('Getting Started checklist reopened!');
              }}
              leftIcon={<Dog className="w-3.5 h-3.5 text-[#8B5E3C]" />}
            >
              Getting Started Checklist
            </Button>
          )}

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
            <div className="px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-xs font-bold text-[#5F3E29] flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Restore from Backup
            </div>
          </label>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700">Reset all records?</span>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                  showStatus('Reset to starter data complete.');
                }}
              >
                Yes, Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Starter Data
            </Button>
          )}
        </div>

        {backupStatus && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{backupStatus}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}
        >
          {isSaved ? 'Preferences Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
