import React from 'react';

export type BadgeVariant = 
  | 'potty' 
  | 'feeding' 
  | 'training' 
  | 'sleep' 
  | 'walk' 
  | 'health' 
  | 'grooming' 
  | 'social' 
  | 'neutral' 
  | 'success' 
  | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  icon
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5'
  }[size];

  const variantStyles = {
    potty: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70',
    feeding: 'bg-amber-50 text-amber-800 border border-amber-200/70',
    training: 'bg-[#8B5E3C]/10 text-[#5F3E29] border border-[#8B5E3C]/20',
    sleep: 'bg-indigo-50 text-indigo-800 border border-indigo-200/70',
    walk: 'bg-teal-50 text-teal-800 border border-teal-200/70',
    health: 'bg-[#F8EBE3] text-[#8C3F24] border border-[#EACEC3]',
    grooming: 'bg-purple-50 text-purple-800 border border-purple-200/70',
    social: 'bg-sky-50 text-sky-800 border border-sky-200/70',
    neutral: 'bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3]',
    success: 'bg-green-50 text-green-800 border border-green-200/70',
    warning: 'bg-amber-50 text-amber-900 border border-amber-300'
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full whitespace-nowrap select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
