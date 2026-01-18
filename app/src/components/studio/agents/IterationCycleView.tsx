import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../../store/studioStore';
import { studioAgentDefinitions, StudioAgentId } from '../../../types/studio';
import { cn } from '../../../utils/helpers';
import { Paintbrush, Eye, CheckCircle, Sparkles, Trophy } from 'lucide-react';

const phases: { id: StudioAgentId; phase: string }[] = [
  { id: 'creator', phase: 'create' },
  { id: 'critic', phase: 'critique' },
  { id: 'reality', phase: 'reality-check' },
  { id: 'refiner', phase: 'refine' },
];

const iconMap: Record<StudioAgentId, React.ElementType> = {
  creator: Paintbrush,
  critic: Eye,
  reality: CheckCircle,
  refiner: Sparkles,
};

export function IterationCycleView() {
  const { iteration, synthesisMode } = useStudioStore();

  const isActive = synthesisMode === 'generating';
  const isComplete = synthesisMode === 'complete';

  const getCurrentPhaseIndex = () => {
    return phases.findIndex((p) => p.phase === iteration.phase);
  };

  const currentIdx = getCurrentPhaseIndex();

  return (
    <div className="relative">
      {/* Iteration counter with animated background */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Feedback Cycle</span>
          {isActive && (
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-indigo-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </div>
        <motion.span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            isComplete
              ? 'bg-emerald-500/20 text-emerald-400'
              : isActive
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-slate-400'
          )}
          animate={isActive ? { opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isComplete ? '✓ Complete' : isActive ? `Loop ${iteration.current}/${iteration.max}` : 'Ready'}
        </motion.span>
      </div>

      {/* Circular progress with connecting lines */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 mx-6" />

        {/* Animated progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 -translate-y-1/2 mx-6 origin-left"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: isComplete ? 1 : (currentIdx + 1) / phases.length,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Phase indicators */}
        <div className="relative flex items-center justify-between">
          {phases.map((phase, index) => {
            const agent = studioAgentDefinitions[phase.id];
            const Icon = iconMap[phase.id];
            const isPast = currentIdx > index || isComplete;
            const isCurrent = currentIdx === index && isActive;
            const isFuture = currentIdx < index && !isComplete;

            return (
              <div key={phase.id} className="relative flex flex-col items-center">
                {/* Outer glow for current */}
                <AnimatePresence>
                  {isCurrent && (
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${agent.gradient}`}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{
                        scale: [1, 1.6, 1.6],
                        opacity: [0.5, 0.2, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: 48, height: 48, margin: -4 }}
                    />
                  )}
                </AnimatePresence>

                {/* Phase indicator */}
                <motion.div
                  className={cn(
                    'relative w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all',
                    isPast && 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border-2 border-emerald-500/50',
                    isCurrent && `bg-gradient-to-br ${agent.gradient} shadow-lg`,
                    isFuture && 'bg-slate-800/80 border-2 border-slate-700'
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isCurrent ? [1, 1.08, 1] : 1,
                    opacity: 1,
                  }}
                  transition={isCurrent ? { duration: 1.2, repeat: Infinity } : { delay: index * 0.1 }}
                  style={isCurrent ? { boxShadow: `0 0 20px ${agent.color}40` } : undefined}
                >
                  {isPast ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <Icon className={cn(
                      'w-4 h-4',
                      isCurrent ? 'text-white' : 'text-slate-500'
                    )} />
                  )}
                </motion.div>

                {/* Agent name label */}
                <motion.span
                  className={cn(
                    'text-[10px] mt-2 font-medium transition-colors',
                    isCurrent ? 'text-white' : isPast ? 'text-emerald-400/70' : 'text-slate-600'
                  )}
                  animate={isCurrent ? { opacity: [0.8, 1, 0.8] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {agent.name}
                </motion.span>

                {/* Data flow particles when current */}
                <AnimatePresence>
                  {isCurrent && index < phases.length - 1 && (
                    <motion.div
                      className="absolute top-1/2 left-full -translate-y-1/2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: agent.color }}
                          initial={{ x: 0, opacity: 0 }}
                          animate={{
                            x: [0, 30],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.3,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-emerald-400"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 60,
                  y: Math.sin((i / 8) * Math.PI * 2) * 30,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
