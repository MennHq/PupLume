import React, { useState, useEffect } from 'react';
import { Gift, ChevronDown, DollarSign } from 'lucide-react';

export type RewardOption = 'offered' | 'none' | 'custom';

interface RewardSettingInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  className?: string;
}

export const RewardSettingInput: React.FC<RewardSettingInputProps> = ({
  value = '',
  onChange,
  onBlur,
  error,
  label = 'Reward Setting',
  className = '',
}) => {
  const getModeFromValue = (val?: string): RewardOption => {
    if (!val || val.trim() === '') return 'none';
    const lower = val.trim().toLowerCase();
    if (lower === 'no reward' || lower === 'none' || lower === 'no_reward') {
      return 'none';
    }
    if (
      lower === 'must be some reward' ||
      lower === 'reward offered' ||
      lower === 'substantial reward offered' ||
      lower === 'generous reward offered' ||
      lower === 'reward'
    ) {
      return 'offered';
    }
    return 'custom';
  };

  const [mode, setMode] = useState<RewardOption>(() => getModeFromValue(value));
  const [customAmount, setCustomAmount] = useState<string>(() => {
    const initialMode = getModeFromValue(value);
    return initialMode === 'custom' ? value : '';
  });

  // Sync mode if value changes externally
  useEffect(() => {
    const calculatedMode = getModeFromValue(value);
    setMode(calculatedMode);
    if (calculatedMode === 'custom') {
      setCustomAmount(value);
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMode = e.target.value as RewardOption;
    setMode(nextMode);

    if (nextMode === 'offered') {
      onChange('Reward Offered');
    } else if (nextMode === 'none') {
      onChange('');
    } else if (nextMode === 'custom') {
      const initialCustom = customAmount.trim() || '$250';
      setCustomAmount(initialCustom);
      onChange(initialCustom);
    }
    if (onBlur) onBlur();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomAmount(text);
    onChange(text);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-[#5F3E29]">
          {label} <span className="text-[#766A63] font-normal">(Optional)</span>
        </label>
        {mode === 'offered' && (
          <span className="text-[10px] text-amber-800 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
            ★ Reward Offered
          </span>
        )}
        {mode === 'none' && (
          <span className="text-[10px] text-[#766A63] font-medium italic">
            Hidden on public page
          </span>
        )}
      </div>

      <div className="relative">
        <select
          value={mode}
          onChange={handleSelectChange}
          className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-[#E8DDD3] bg-white text-xs font-semibold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] cursor-pointer transition-all shadow-2xs"
        >
          <option value="offered">1. Must be some reward</option>
          <option value="none">2. No reward</option>
          <option value="custom">3. Custom (enter amount)</option>
        </select>
        <ChevronDown className="w-4 h-4 text-[#766A63] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {mode === 'custom' && (
        <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative">
            <DollarSign className="w-3.5 h-3.5 text-[#766A63] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomChange}
              onBlur={onBlur}
              placeholder="e.g. $250 or 50,000 PKR"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8DDD3] bg-white text-xs text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] shadow-2xs"
            />
          </div>
          <span className="text-[10px] text-[#766A63] font-medium block mt-1 pl-1">
            Displayed on missing flyer & public safety tag if lost
          </span>
        </div>
      )}

      {error && (
        <span className="text-[10px] text-amber-800 font-bold block mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
