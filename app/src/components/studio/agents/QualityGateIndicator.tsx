import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldX, ChevronDown, Target, Palette, Eye, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { cn } from '../../../utils/helpers';

// Icons for each criterion type
const criteriaIcons: Record<string, React.ElementType> = {
  'style-coherence': Palette,
  'product-alignment': Target,
  'aesthetic-quality': Eye,
  'commercial-viability': Sparkles,
};

export function QualityGateIndicator() {
  const { qualityGate, synthesisMode } = useStudioStore();
  const [expanded, setExpanded] = React.useState(true); // Always expanded by default now

  const isComplete = synthesisMode === 'complete';
  const isGenerating = synthesisMode === 'generating';
  const score = Math.round(qualityGate.overallScore);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="relative"
            animate={isGenerating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {isComplete ? (
              qualityGate.passed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <ShieldX className="w-5 h-5 text-amber-400" />
                </motion.div>
              )
            ) : (
              <Shield className={cn(
                'w-5 h-5 transition-colors',
                isGenerating ? 'text-indigo-400' : 'text-slate-500'
              )} />
            )}
            {/* Glow effect when generating */}
            {isGenerating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-400/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          <span className="text-sm font-medium text-white">Quality Gate</span>
          {isComplete && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                qualityGate.passed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}
            >
              {qualityGate.passed ? 'Passed' : 'Review'}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'text-lg font-bold',
                qualityGate.passed ? 'text-emerald-400' : 'text-amber-400'
              )}
            >
              {score}%
            </motion.span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Always visible criteria section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50 overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {/* Main progress bar */}
              <div className="space-y-1.5">
                <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50" />

                  {/* Progress fill */}
                  <motion.div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      isComplete
                        ? qualityGate.passed
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </motion.div>

                  {/* Threshold marker */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-lg"
                    style={{ left: `${qualityGate.requiredScore}%` }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Threshold label */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap">
                      Min: {qualityGate.requiredScore}%
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Individual criteria - always visible */}
              <div className="grid grid-cols-2 gap-2">
                {qualityGate.criteria.map((criterion, index) => {
                  const Icon = criteriaIcons[criterion.id] || Target;
                  const criterionScore = isComplete ? criterion.score : 0;

                  return (
                    <motion.div
                      key={criterion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'p-2 rounded-lg border transition-colors',
                        isComplete
                          ? criterion.passed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-slate-800/30 border-slate-700/30'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={cn(
                          'w-3.5 h-3.5',
                          isComplete
                            ? criterion.passed ? 'text-emerald-400' : 'text-amber-400'
                            : 'text-slate-500'
                        )} />
                        <span className="text-xs text-slate-300 truncate flex-1">
                          {criterion.name}
                        </span>
                        {isComplete && (
                          criterion.passed ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                          )
                        )}
                      </div>

                      {/* Mini progress bar */}
                      <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'h-full rounded-full',
                            isComplete
                              ? criterion.passed ? 'bg-emerald-500' : 'bg-amber-500'
                              : 'bg-slate-600'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${criterionScore}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        />
                      </div>

                      {/* Score */}
                      <div className="mt-1 text-right">
                        <span className={cn(
                          'text-xs font-mono',
                          isComplete
                            ? criterion.passed ? 'text-emerald-400' : 'text-amber-400'
                            : 'text-slate-600'
                        )}>
                          {isComplete ? `${Math.round(criterionScore)}%` : '—'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status message */}
              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-center gap-2 text-xs text-slate-400"
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span>Evaluating quality metrics...</span>
                  </motion.div>
                )}
                {isComplete && qualityGate.passed && (
                  <motion.div
                    key="passed"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-center gap-2 text-xs text-emerald-400"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>All quality standards met!</span>
                  </motion.div>
                )}
                {isComplete && !qualityGate.passed && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-center gap-2 text-xs text-amber-400"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Some criteria need improvement</span>
                  </motion.div>
                )}
                {!isGenerating && !isComplete && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-center gap-2 text-xs text-slate-500"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Generate to evaluate quality</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
