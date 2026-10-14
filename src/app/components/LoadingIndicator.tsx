'use client';

import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({
  message = 'Loading data...',
  subMessage,
  fullScreen = false,
  size = 'md',
  className = '',
}: LoadingIndicatorProps) {
  const containerClasses = fullScreen
    ? 'min-h-[60vh] w-full flex flex-col items-center justify-center p-6 sm:p-12'
    : 'py-16 w-full flex flex-col items-center justify-center p-6';

  const spinnerDimensions =
    size === 'sm'
      ? { outer: 'w-10 h-10', inner: 'w-7 h-7', icon: 14 }
      : size === 'lg'
      ? { outer: 'w-20 h-20', inner: 'w-14 h-14', icon: 26 }
      : { outer: 'w-14 h-14', inner: 'w-10 h-10', icon: 18 };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClasses} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle warm glow */}
        <div className="absolute -inset-3 bg-[#ffe000]/20 rounded-full blur-xl pointer-events-none animate-pulse" />

        {/* Outer orbital spinner */}
        <div
          className={`${spinnerDimensions.outer} rounded-full border-2 border-transparent border-t-[#ffe000] border-r-[#ffe000]/70 animate-spin`}
          style={{ animationDuration: '0.9s' }}
        />

        {/* Inner reverse spinner */}
        <div
          className={`absolute ${spinnerDimensions.inner} rounded-full border border-dashed border-gray-300 border-b-gray-900 animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.8s' }}
        />

        {/* Center Lubricon Droplet Core */}
        <div className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-black text-[#ffe000] shadow-sm animate-pulse">
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
      </div>

      {/* Brand & Loading Info */}
      <div className="mt-5 flex flex-col items-center text-center max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-900">
            Lubricon CMS
          </span>
          <span className="w-1 h-1 rounded-full bg-[#ffe000]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Admin Portal
          </span>
        </div>

        {message && (
          <p className="text-sm font-semibold text-gray-800 tracking-tight">
            {message}
          </p>
        )}

        {subMessage && (
          <p className="text-xs text-gray-400 mt-0.5">
            {subMessage}
          </p>
        )}

        {/* Shimmering progress track */}
        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden mt-3 relative">
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#ffe000] w-1/2 rounded-full"
            style={{
              animation: 'cmsShimmer 1.4s infinite ease-in-out',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes cmsShimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingIndicator;
