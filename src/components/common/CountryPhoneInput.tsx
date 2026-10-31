import React, { useMemo } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { detectCountryCode, preventLetterInput, sanitizePhoneInput } from '../../lib/validation';

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "+1 (555) 123-4567 or local country number",
  required = false,
  error,
  className = '',
  inputClassName = '',
}) => {
  const detectedCountry = useMemo(() => detectCountryCode(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneInput(e.target.value);
    onChange(sanitized);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative flex items-center">
        {/* Left Side: Auto-Detected Country Logo / Flag inside the Typebox */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none z-10">
          {detectedCountry ? (
            <div className="flex items-center gap-1 bg-[#FAF6F0] px-1.5 py-0.5 rounded-md border border-[#E8DDD3] shadow-2xs">
              <img
                src={`https://flagcdn.com/28x21/${detectedCountry.toLowerCase()}.png`}
                alt={detectedCountry}
                className="w-4 h-3 object-cover rounded-xs shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[10px] font-black font-mono text-[#5F3E29]">
                {detectedCountry}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#FAF6F0] px-1.5 py-0.5 rounded-md border border-[#E8DDD3]">
              <Globe className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="text-[9px] font-bold text-[#766A63] font-mono">
                INTL
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="w-[1px] h-4 bg-[#E8DDD3] mx-0.5" />
        </div>

        {/* The Text Input Typebox */}
        <input
          type="tel"
          required={required}
          value={value}
          onKeyDown={preventLetterInput}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-[78px] pr-3 py-2 rounded-xl border ${
            error ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8DDD3] bg-white'
          } text-xs font-semibold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] transition-colors shadow-2xs ${inputClassName}`}
        />
      </div>

      {/* Small Alert for Invalid Number */}
      {error && (
        <div className="text-[10px] text-amber-800 font-bold mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
