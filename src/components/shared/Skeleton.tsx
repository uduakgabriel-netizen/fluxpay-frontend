import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  style = {},
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '16px' : '64px'),
    ...style,
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-md my-1';
      case 'card':
        return 'rounded-2xl';
      case 'rectangular':
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div
      style={baseStyle}
      className={`relative overflow-hidden bg-gray-200 dark:bg-slate-800/80 ${getVariantClass()} ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {/* Light Purple Shimmer Sweep (1.5s loop left-to-right) */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-purple-500/15 dark:via-purple-400/20 to-transparent" />
    </div>
  );
}

export interface CardSkeletonProps {
  rows?: number;
  className?: string;
}

// Pre-composed compound skeleton helpers
export function CardSkeleton({ rows = 3, className = '' }: CardSkeletonProps) {
  return (
    <div className={`p-6 rounded-3xl bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="44px" height="44px" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="45%" height="16px" />
          <Skeleton variant="text" width="30%" height="12px" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="48px" className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export interface RowSkeletonProps {
  count?: number;
}

export function RowSkeleton({ count = 3 }: RowSkeletonProps) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width="36px" height="36px" />
            <div className="space-y-1">
              <Skeleton variant="text" width="90px" height="14px" />
              <Skeleton variant="text" width="60px" height="10px" />
            </div>
          </div>
          <div className="space-y-1 text-right">
            <Skeleton variant="text" width="70px" height="14px" />
            <Skeleton variant="text" width="45px" height="10px" />
          </div>
        </div>
      ))}
    </div>
  );
}
