import React, { useState } from 'react';
import { 
  Droplet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { PuppyProfile, PottyLog } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Modal } from '../components/ui/Modal';

interface PottyTrackerViewProps {
  puppy: PuppyProfile;
}

export const PottyTrackerView: React.FC<PottyTrackerViewProps> = ({ puppy }) => {
  const [logs, setLogs] = useState<PottyLog[]>(() => storage.getPottyLogs(puppy.id));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  React.useEffect(() => {
    setLogs(storage.getPottyLogs(puppy.id));
  }, [puppy.id]);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setLogs([...storage.getPottyLogs(puppy.id)]);
    });
  }, [puppy.id]);


  // Form states
  const [pottyType, setPottyType] = useState<'pee' | 'poop' | 'both' | 'accident'>('pee');
  const [location, setLocation] = useState<'outdoor' | 'pad' | 'indoor_accident'>('outdoor');
  const [notes, setNotes] = useState('');

  // Quick 1-tap buttons
  const handleQuickLog = (type: 'pee' | 'poop' | 'both' | 'accident', loc: 'outdoor' | 'pad' | 'indoor_accident') => {
    storage.addPottyLog({
      puppyId: puppy.id,
      type,
      location: loc,
      timestamp: new Date().toISOString(),
      notes: `${type.toUpperCase()} recorded via 1-tap tracker`
    });
    setLogs(storage.getPottyLogs(puppy.id));
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addPottyLog({
      puppyId: puppy.id,
      type: pottyType,
      location,
      timestamp: new Date().toISOString(),
      notes
    });
    setLogs(storage.getPottyLogs(puppy.id));
    setIsLogModalOpen(false);
    setNotes('');
  };

  const handleDeleteLog = (id: string) => {
    storage.deletePottyLog(id);
    setLogs(storage.getPottyLogs(puppy.id));
  };

  const outdoorCount = logs.filter(l => l.location === 'outdoor' || l.location === 'pad').length;
  const totalCount = logs.length;
  const successPercentage = totalCount > 0 ? Math.round((outdoorCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Potty Tracker & Predictor
            </h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {successPercentage}% Outdoor Success
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Smart countdowns based on {puppy.name}’s age ({puppy.weightLbs} lbs) and recent meal timestamps.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsLogModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Custom Log
        </Button>
      </div>

      {/* Quick 1-Tap Logging Bar */}
      <div className="bg-[#FFF9F2] rounded-2xl border border-[#E8DDD3] p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] block mb-3">
          1-Tap Quick Action
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleQuickLog('pee', 'outdoor')}
            className="p-3 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            Outdoor Pee
          </button>
          <button
            onClick={() => handleQuickLog('poop', 'outdoor')}
            className="p-3 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Outdoor Poop
          </button>
          <button
            onClick={() => handleQuickLog('both', 'outdoor')}
            className="p-3 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <Droplet className="w-4 h-4 text-emerald-600" />
            Both (Pee + Poop)
          </button>
          <button
            onClick={() => handleQuickLog('accident', 'indoor_accident')}
            className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Indoor Accident
          </button>
        </div>
      </div>

      {/* Intelligence & Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Potty Countdown */}
        {(() => {
          const birthDate = new Date(puppy.birthDate);
          const ageWeeks = Math.max(1, Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
          const maxIntervalMin = Math.min(240, Math.max(45, Math.round((ageWeeks / 4) * 60)));
          const lastLog = logs[0];
          let remainingMin = maxIntervalMin;
          let hasRecent = false;

          if (lastLog) {
            const lastTime = new Date(lastLog.timestamp).getTime();
            if (!isNaN(lastTime)) {
              const elapsedMin = Math.floor((Date.now() - lastTime) / 60000);
              remainingMin = Math.max(0, maxIntervalMin - elapsedMin);
              hasRecent = true;
            }
          }

          return (
            <div className="p-5 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasRecent ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                    Next Predicted Window
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#2C211B] mt-1 font-mono">
                  {hasRecent ? (remainingMin === 0 ? 'Due Now' : `~${remainingMin} min`) : 'Ready to Start'}
                </div>
                <p className="text-xs text-[#766A63] mt-1">
                  {hasRecent
                    ? `Based on ${ageWeeks}-week bladder capacity (~${maxIntervalMin} min interval).`
                    : `Log ${puppy.name}'s first break to calibrate personalized countdowns.`}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          );
        })()}

        {/* Success Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
              Reliability Score
            </span>
            <div className="text-3xl font-black text-[#2C211B] mt-1">
              {totalCount > 0 ? `${successPercentage}%` : '—'}
            </div>
            <p className="text-xs text-[#766A63] mt-1">
              {totalCount > 0 
                ? `${outdoorCount} outdoor vs ${totalCount - outdoorCount} indoor slips`
                : 'No logs recorded yet'}
            </p>
          </div>
          <ProgressRing completed={outdoorCount} total={totalCount > 0 ? totalCount : 1} size={70} strokeWidth={7} />
        </div>
      </div>

      {/* Potty History Timeline */}
      <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#2C211B] mb-4">
          Potty History & Events
        </h3>

        <div className="space-y-2.5">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#766A63]">
              <Droplet className="w-8 h-8 text-[#8B5E3C]/40 mx-auto mb-2" />
              <p className="font-semibold text-[#2C211B]">No potty events logged yet</p>
              <p className="mt-0.5">Use the 1-Tap Quick Action buttons above to start tracking {puppy.name}&apos;s rhythm.</p>
            </div>
          ) : (
            logs.map((log) => {
            const isAccident = log.location === 'indoor_accident' || log.type === 'accident';
            const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isAccident
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-[#FFF9F2] border-[#E8DDD3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isAccident ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isAccident ? <AlertCircle className="w-4 h-4" /> : <Droplet className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#2C211B] uppercase">
                        {log.type}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white border border-[#E8DDD3] text-[#766A63]">
                        {log.location === 'indoor_accident' ? 'Indoor Slip' : 'Outdoor'}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-[#766A63] mt-0.5">{log.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#766A63]">{dateStr}</span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 text-[#766A63] hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Custom Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Potty Event"
      >
        <form onSubmit={handleCreateLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['pee', 'poop', 'both', 'accident'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setPottyType(t as any);
                    if (t === 'accident') setLocation('indoor_accident');
                  }}
                  className={`py-2 text-xs font-bold capitalize rounded-xl border cursor-pointer ${
                    pottyType === t ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]' : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Location
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'outdoor', label: 'Outdoor' },
                { id: 'pad', label: 'Puppy Pad' },
                { id: 'indoor_accident', label: 'Indoor Slip' }
              ].map(l => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLocation(l.id as any)}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    location === l.id ? 'bg-[#5F3E29] text-white border-[#5F3E29]' : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Right by back garden gate, praised with liver"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
