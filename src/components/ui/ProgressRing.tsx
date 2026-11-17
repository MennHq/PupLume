import React from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  completed,
  total,
  size = 80,
  strokeWidth = 8,
  className = '',
  label
}) => {
  const percentage = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8DDD3"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-70"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8B5E3C"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Central content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-base font-extrabold text-[#2C211B] leading-none tabular-nums">
          {percentage}%
        </span>
        {label && (
          <span className="text-[10px] font-medium text-[#766A63] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
