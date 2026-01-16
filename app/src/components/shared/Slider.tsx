import React, { useId } from 'react';
import { cn } from '../../utils/helpers';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
  /** Accessible name for screen readers when no visible label */
  ariaLabel?: string;
  /** Description for screen readers */
  ariaDescription?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormat = (v) => `${v}%`,
  color = '#6366f1',
  size = 'md',
  disabled = false,
  className,
  variant = 'light',
  ariaLabel,
  ariaDescription,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const isDark = variant === 'dark';
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  // Handle keyboard increment/decrement with more precision
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let newValue = value;
    const largeStep = (max - min) / 10;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newValue = Math.max(min, value - step);
        break;
      case 'PageUp':
        newValue = Math.min(max, value + largeStep);
        break;
      case 'PageDown':
        newValue = Math.max(min, value - largeStep);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    onChange(newValue);
  };

  return (
    <div className={cn('w-full', className)} role="group" aria-labelledby={label ? labelId : undefined}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label
              id={labelId}
              htmlFor={id}
              className={cn('text-sm font-medium', isDark ? 'text-white/80' : 'text-gray-700')}
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}
              aria-live="polite"
              aria-atomic="true"
            >
              {valueFormat(value)}
            </span>
          )}
        </div>
      )}

      {/* Hidden description for screen readers */}
      {ariaDescription && (
        <span id={descriptionId} className="sr-only">
          {ariaDescription}
        </span>
      )}

      <div className="relative w-full">
        <div
          className={cn(
            'w-full rounded-full',
            isDark ? 'bg-white/10' : 'bg-gray-200',
            sizeStyles[size]
          )}
          aria-hidden="true"
        >
          <div
            className={cn('rounded-full transition-all', sizeStyles[size])}
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full opacity-0 cursor-pointer',
            'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500',
            disabled && 'cursor-not-allowed'
          )}
          style={{ height: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px', marginTop: '-8px' }}
          aria-label={ariaLabel || label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueFormat(value)}
          aria-describedby={ariaDescription ? descriptionId : undefined}
        />
      </div>
    </div>
  );
}
