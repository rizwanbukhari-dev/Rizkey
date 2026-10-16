import React from 'react';
import { Link } from 'react-router-dom';

interface WatermarkProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Watermark: React.FC<WatermarkProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <Link
        to="/"
        className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color,#E6C76B)] rounded-lg p-0.5"
        aria-label="RizKey Homepage"
      >
        <div
          className={`relative ${iconSizes[size]} bg-[#272824] border border-[#353630] rounded-lg flex items-center justify-center font-mono font-bold text-[var(--accent-color,#E6C76B)] shadow-xs transition-all duration-200 group-hover:border-[var(--accent-color,#E6C76B)] group-hover:scale-105`}
        >
          <span>R_</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--correct-color,#5DBE76)] animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <span className={`font-mono font-bold tracking-tight text-[#ECEBE4] group-hover:text-white transition-colors ${titleSizes[size]}`}>
            Riz<span className="text-[var(--accent-color,#E6C76B)]">Key</span>
          </span>
          {showTagline && (
            <span className="text-[11px] sm:text-xs text-[#989A92] font-mono tracking-normal leading-tight">
              Find your rhythm. Master your keys.
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};
