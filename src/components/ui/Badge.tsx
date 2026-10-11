import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'green' | 'red' | 'gray' | 'blue' | 'orange';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  icon,
  className = '',
}) => {
  const variants = {
    amber: 'bg-[var(--accent-subtle)] text-[var(--accent-color)] border-[var(--accent-color)]/30',
    green: 'bg-[#5DBE76]/15 text-[#5DBE76] border-[#5DBE76]/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    gray: 'bg-[var(--surface-color)] text-[var(--subtext-color)] border-[var(--border-color)]',
    blue: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-mono rounded-lg border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
