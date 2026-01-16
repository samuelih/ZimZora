import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'rounded-full': variant === 'circular',
      'rounded': variant === 'rounded',
      'rounded-sm': variant === 'text',
      'rounded-none': variant === 'rectangular',
    },
    className
  );

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  };

  if (animation === 'wave') {
    return (
      <div className={cn(baseClasses, 'relative overflow-hidden')} style={style}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (animation === 'pulse') {
    return (
      <motion.div
        className={baseClasses}
        style={style}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  return <div className={baseClasses} style={style} />;
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height="0.875rem"
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return (
    <Skeleton
      variant="rounded"
      className={cn('w-full aspect-video', className)}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" width="60%" height="0.75rem" />
          <Skeleton variant="text" width="40%" height="0.625rem" />
        </div>
      </div>
      <Skeleton variant="rounded" className="w-full h-32" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonLayerRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-2 rounded-lg', className)}>
      <Skeleton variant="circular" width={16} height={16} />
      <Skeleton variant="rounded" width={40} height={40} />
      <div className="flex-1 space-y-1">
        <Skeleton variant="text" width="70%" height="0.75rem" />
        <Skeleton variant="text" width="40%" height="0.625rem" />
      </div>
      <Skeleton variant="text" width={40} height="0.75rem" />
    </div>
  );
}

export function SkeletonNodeCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 p-3 space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Skeleton variant="rounded" width={40} height={40} />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" width="80%" height="0.875rem" />
          <Skeleton variant="text" width="50%" height="0.625rem" />
        </div>
      </div>
    </div>
  );
}
