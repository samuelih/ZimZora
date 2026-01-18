import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Cloud, Zap, Shield, Sparkles, Lock, Clock, ImageIcon, Info, ChevronDown } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { cn } from '../../../utils/helpers';

const modeDetails = {
  local: {
    title: 'Local NPU',
    subtitle: 'On-device processing',
    icon: Cpu,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    benefits: [
      { icon: Shield, text: 'Private - data stays on device' },
      { icon: Zap, text: 'Fast - no upload needed' },
      { icon: Lock, text: 'Free - unlimited drafts' },
    ],
    quality: 'Draft quality',
    speed: '~2 seconds',
  },
  cloud: {
    title: 'Cloud GPU',
    subtitle: 'High-performance servers',
    icon: Cloud,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    benefits: [
      { icon: Sparkles, text: '4K production quality' },
      { icon: ImageIcon, text: 'Advanced style transfer' },
      { icon: Clock, text: 'Better product matching' },
    ],
    quality: 'Production quality',
    speed: '~15 seconds',
  },
};

export function ComputeModeToggle() {
  const { computeMode, setComputeMode, subscriptionTier } = useStudioStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMode, setTooltipMode] = useState<'local' | 'cloud' | null>(null);

  const isLocal = computeMode === 'local';
  const currentDetails = modeDetails[computeMode];
  const ModeIcon = currentDetails.icon;

  return (
    <div className="relative flex items-center gap-3">
      {/* Toggle Button - Larger and more prominent */}
      <div className="relative">
        <motion.div
          className="relative flex items-center p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm"
          animate={{
            borderColor: isLocal ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)',
          }}
        >
          {/* Background slider with glow */}
          <motion.div
            className={cn(
              'absolute h-9 rounded-lg shadow-lg',
              `bg-gradient-to-r ${currentDetails.gradient}`
            )}
            initial={false}
            animate={{
              x: isLocal ? 4 : 104,
              width: isLocal ? 96 : 88,
              boxShadow: isLocal
                ? '0 4px 15px rgba(16, 185, 129, 0.3)'
                : '0 4px 15px rgba(99, 102, 241, 0.3)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Local Option */}
          <motion.button
            onClick={() => setComputeMode('local')}
            onMouseEnter={() => { setShowTooltip(true); setTooltipMode('local'); }}
            onMouseLeave={() => setShowTooltip(false)}
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isLocal ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isLocal ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Cpu className="w-4 h-4" />
            </motion.div>
            <span>Local</span>
            {isLocal && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/80"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Cloud Option */}
          <motion.button
            onClick={() => setComputeMode('cloud')}
            onMouseEnter={() => { setShowTooltip(true); setTooltipMode('cloud'); }}
            onMouseLeave={() => setShowTooltip(false)}
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              !isLocal ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={!isLocal ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Cloud className="w-4 h-4" />
            </motion.div>
            <span>Cloud</span>
            {!isLocal && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/80"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Detailed tooltip */}
        <AnimatePresence>
          {showTooltip && tooltipMode && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
            >
              <div className={cn(
                'p-4 rounded-xl border shadow-xl backdrop-blur-sm min-w-[240px]',
                tooltipMode === 'local'
                  ? 'bg-emerald-950/90 border-emerald-500/30'
                  : 'bg-indigo-950/90 border-indigo-500/30'
              )}>
                {/* Arrow */}
                <div className={cn(
                  'absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45',
                  tooltipMode === 'local'
                    ? 'bg-emerald-950 border-l border-t border-emerald-500/30'
                    : 'bg-indigo-950 border-l border-t border-indigo-500/30'
                )} />

                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    `bg-gradient-to-br ${modeDetails[tooltipMode].gradient}`
                  )}>
                    {React.createElement(modeDetails[tooltipMode].icon, { className: 'w-5 h-5 text-white' })}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {modeDetails[tooltipMode].title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {modeDetails[tooltipMode].subtitle}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-3">
                  {modeDetails[tooltipMode].benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <benefit.icon className={cn(
                        'w-3.5 h-3.5',
                        tooltipMode === 'local' ? 'text-emerald-400' : 'text-indigo-400'
                      )} />
                      <span className="text-xs text-slate-300">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <div className="text-xs">
                    <span className="text-slate-500">Quality: </span>
                    <span className={tooltipMode === 'local' ? 'text-emerald-400' : 'text-indigo-400'}>
                      {modeDetails[tooltipMode].quality}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Speed: </span>
                    <span className={tooltipMode === 'local' ? 'text-emerald-400' : 'text-indigo-400'}>
                      {modeDetails[tooltipMode].speed}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status badge - more descriptive */}
      <motion.div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border',
          isLocal
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        )}
        animate={{
          boxShadow: isLocal
            ? '0 0 15px rgba(16, 185, 129, 0.15)'
            : '0 0 15px rgba(99, 102, 241, 0.15)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ModeIcon className="w-3.5 h-3.5" />
        </motion.div>
        <span>{isLocal ? 'Draft Mode' : 'Production Mode'}</span>
        <Info className="w-3 h-3 opacity-50" />
      </motion.div>

      {/* Premium badge for cloud */}
      <AnimatePresence>
        {!isLocal && subscriptionTier === 'premium' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium"
          >
            <Sparkles className="w-3 h-3" />
            Premium Active
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
