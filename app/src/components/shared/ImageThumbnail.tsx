import React from 'react';
import { cn } from '../../utils/helpers';

interface ImageThumbnailProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  border?: boolean;
  overlay?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const sizeStyles = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const roundedStyles = {
  true: 'rounded-lg',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function ImageThumbnail({
  src,
  alt,
  size = 'md',
  rounded = true,
  border = true,
  overlay,
  onClick,
  className
}: ImageThumbnailProps) {
  const roundedClass = typeof rounded === 'boolean'
    ? (rounded ? roundedStyles.true : '')
    : roundedStyles[rounded];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 flex-shrink-0',
        sizeStyles[size],
        roundedClass,
        border && 'border-2 border-white shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
}
