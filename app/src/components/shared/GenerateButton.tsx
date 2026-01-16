import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';
import { Sparkles, Loader2, Check, AlertCircle, Command } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  isGenerating?: boolean;
  progress?: number;
  isComplete?: boolean;
  isError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'recipe' | 'dark';
  className?: string;
  fullWidth?: boolean;
}

export function GenerateButton({
  onClick,
  disabled = false,
  disabledReason,
  isGenerating = false,
  progress = 0,
  isComplete = false,
  isError = false,
  size = 'md',
  variant = 'primary',
  className,
  fullWidth = false,
}: GenerateButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseEnabled, setPulseEnabled] = useState(true);

  // Keyboard shortcut: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !disabled && !isGenerating) {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, disabled, isGenerating]);

  // Disable pulse after first interaction
  useEffect(() => {
    if (isGenerating || isComplete) {
      setPulseEnabled(false);
    }
  }, [isGenerating, isComplete]);

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25',
    recipe: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25',
    dark: 'bg-primary-500 hover:bg-primary-600 text-white',
  };

  const getButtonContent = () => {
    if (isError) {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2" />
          Error - Try Again
        </>
      );
    }

    if (isComplete) {
      return (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Check className="w-4 h-4 mr-2" />
          </motion.div>
          Complete!
        </>
      );
    }

    if (isGenerating) {
      return (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-4 h-4 mr-2" />
          </motion.div>
          <span>Generating... {progress > 0 && `${progress}%`}</span>
        </>
      );
    }

    return (
      <>
        <motion.div
          animate={pulseEnabled && !disabled ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className={cn(
            'mr-2',
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          )} />
        </motion.div>
        <span>Generate</span>
        <span className={cn(
          'ml-2 flex items-center gap-0.5 opacity-60 text-xs',
          size === 'lg' && 'text-sm'
        )}>
          <Command className="w-3 h-3" />
          <span>Enter</span>
        </span>
      </>
    );
  };

  // Get status for screen readers
  const getAriaStatus = () => {
    if (isError) return 'Generation failed. Please try again.';
    if (isComplete) return 'Generation complete!';
    if (isGenerating) return `Generating image... ${progress > 0 ? `${progress}% complete` : ''}`;
    if (disabled && disabledReason) return disabledReason;
    return 'Ready to generate. Press Command+Enter or click to start.';
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAriaStatus()}
      </div>

      <motion.button
        onClick={onClick}
        disabled={disabled || isGenerating}
        onMouseEnter={() => disabled && disabledReason && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => disabled && disabledReason && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          !isError && variantStyles[variant],
          isError && 'bg-red-500 hover:bg-red-600 text-white',
          isComplete && 'bg-green-500 hover:bg-green-600',
          fullWidth && 'w-full',
          className
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        aria-label={`Generate image${disabled && disabledReason ? `. Currently disabled: ${disabledReason}` : ''}`}
        aria-busy={isGenerating}
        aria-disabled={disabled || isGenerating}
      >
        {/* Progress bar overlay during generation */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-lg origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <span className="relative z-10 flex items-center">
          {getButtonContent()}
        </span>
      </motion.button>

      {/* Disabled reason tooltip */}
      <AnimatePresence>
        {showTooltip && disabledReason && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                       bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
          >
            {disabledReason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready to generate pulse effect */}
      {!disabled && !isGenerating && pulseEnabled && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-lg',
            variant === 'recipe'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
              : 'bg-primary-500'
          )}
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
}
