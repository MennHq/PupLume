import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'sage' 
  | 'peach';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E3C] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[50px] gap-2.5 font-semibold',
    icon: 'p-2.5 min-h-[44px] min-w-[44px]'
  }[size];

  const variantStyles = {
    primary: 'bg-[#8B5E3C] text-white hover:bg-[#5F3E29] shadow-xs active:bg-[#4A2F1E]',
    secondary: 'bg-[#F3E7DA] text-[#2C211B] hover:bg-[#E8DDD3] active:bg-[#DBC9BB]',
    outline: 'border border-[#E8DDD3] text-[#2C211B] bg-white hover:bg-[#FFF9F2] active:bg-[#F3E7DA]',
    ghost: 'text-[#766A63] hover:text-[#2C211B] hover:bg-[#F3E7DA]/50 active:bg-[#F3E7DA]',
    danger: 'bg-[#A45238] text-white hover:bg-[#8C3F24] active:bg-[#73331C]',
    sage: 'bg-[#A8B59A] text-white hover:bg-[#8F9F80] active:bg-[#788869]',
    peach: 'bg-[#E9B89C] text-[#2C211B] hover:bg-[#DF9E7B] active:bg-[#D58C67]'
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
