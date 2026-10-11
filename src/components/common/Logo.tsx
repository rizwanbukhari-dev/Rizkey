import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link to="/" className="inline-flex items-center gap-3 group select-none">
      <div className={`relative ${iconSizes[size]} bg-[#272824] border border-[#3A3B34] rounded-lg flex items-center justify-center font-mono font-bold text-[#E6C76B] shadow-sm transition-all duration-200 group-hover:border-[#E6C76B] group-hover:scale-105`}>
        <span className="tracking-tighter">R_</span>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#5DBE76] animate-pulse" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-[#ECEBE4] ${textSizes[size]}`}>
            Riz<span className="text-[#E6C76B]">Key</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-[#989A92] font-mono tracking-wide mt-1">
            Find your rhythm. Master your keys.
          </span>
        )}
      </div>
    </Link>
  );
};
