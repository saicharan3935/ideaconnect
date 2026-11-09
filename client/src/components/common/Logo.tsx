import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  clickable?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo Graphic */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {/* Crisp vector representation of infinity loop + lightbulb + 2 people */}
        <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="logoGradientLeft" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="logoGradientRight" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="bulbGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Spark rays */}
          <line x1="60" y1="6" x2="60" y2="18" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
          <line x1="42" y1="12" x2="49" y2="21" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="78" y1="12" x2="71" y2="21" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />

          {/* Person Left Head */}
          <circle cx="34" cy="36" r="9" fill="url(#logoGradientLeft)" />
          {/* Person Right Head */}
          <circle cx="86" cy="36" r="9" fill="url(#logoGradientRight)" />

          {/* Lightbulb in the center */}
          <circle cx="60" cy="36" r="16" fill="url(#bulbGlow)" />
          <path
            d="M52 35C52 30.5817 55.5817 27 60 27C64.4183 27 68 30.5817 68 35C68 37.8 66.5 40.2 64.5 41.8V45.5C64.5 46.3 63.8 47 63 47H57C56.2 47 55.5 46.3 55.5 45.5V41.8C53.5 40.2 52 37.8 52 35Z"
            fill="url(#bulbGradient)"
          />
          <rect x="56" y="47.5" width="8" height="2" rx="1" fill="#E2E8F0" />
          <rect x="57" y="50" width="6" height="1.5" rx="0.75" fill="#CBD5E1" />

          {/* Infinity loop intertwining the two people */}
          {/* Left loop */}
          <path
            d="M60 65C50 54 38 48 26 48C14.5 48 7 57 7 66C7 75 14.5 84 26 84C38 84 50 77 60 65Z"
            stroke="url(#logoGradientLeft)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right loop */}
          <path
            d="M60 65C70 77 82 84 94 84C105.5 84 113 75 113 66C113 57 105.5 48 94 48C82 48 70 54 60 65Z"
            stroke="url(#logoGradientRight)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]} flex items-center font-['Plus_Jakarta_Sans']`}>
          <span className="text-white">Idea</span>
          <span className="bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent ml-0.5">
            Connect
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-400 font-normal tracking-wide mt-1.5">
            Where a spark meets the people who’ll help it grow.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
