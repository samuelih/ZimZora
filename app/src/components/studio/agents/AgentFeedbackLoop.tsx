import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, RotateCw, Zap, Brain } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { StudioAgentAvatar } from './StudioAgentAvatar';
import { IterationCycleView } from './IterationCycleView';
import { QualityGateIndicator } from './QualityGateIndicator';
import { AgentFeedbackCard } from './AgentFeedbackCard';
import { studioAgentDefinitions, StudioAgentId } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

const agentOrder: StudioAgentId[] = ['creator', 'critic', 'reality', 'refiner'];

export function AgentFeedbackLoop() {
  const { agents, iteration, qualityGate, synthesisMode } = useStudioStore();

  const isGenerating = synthesisMode === 'generating';
  const isComplete = synthesisMode === 'complete';

  const currentAgentId = iteration.phase === 'create'
    ? 'creator'
    : iteration.phase === 'critique'
    ? 'critic'
    : iteration.phase === 'reality-check'
    ? 'reality'
    : iteration.phase === 'refine'
    ? 'refiner'
    : null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-900/80">
      {/* Header with animated icon */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
            animate={isGenerating ? { rotate: 360 } : {}}
            transition={isGenerating ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RotateCw className="w-5 h-5 text-white" />
            {isGenerating && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-orange-400/50"
                animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Agent Feedback Loop
              {isGenerating && (
                <motion.span
                  className="flex items-center gap-1 text-xs text-amber-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Brain className="w-3 h-3" />
                  <span>Active</span>
                </motion.span>
              )}
            </h3>
            <p className="text-xs text-slate-500">Self-correcting studio with AI agents</p>
          </div>
        </div>
      </div>

      {/* Iteration Cycle Visualization */}
      <div className="flex-shrink-0 p-4">
        <IterationCycleView />
      </div>

      {/* Agent List with flow connections */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-1">
          {agentOrder.map((agentId, index) => {
            const agentState = agents[agentId];
            const agent = studioAgentDefinitions[agentId];
            const isActive = currentAgentId === agentId;
            const isCompleted =
              (iteration.phase === 'complete') ||
              (agentOrder.indexOf(currentAgentId || 'creator') > index);
            const isPending = !isActive && !isCompleted;

            return (
              <motion.div
                key={agentId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={cn(
                    'relative rounded-xl border p-3 transition-all',
                    isActive && 'bg-slate-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/10',
                    isCompleted && !isActive && 'bg-slate-800/30 border-emerald-500/30',
                    isPending && 'bg-slate-800/20 border-slate-700/30 opacity-60'
                  )}
                  animate={isActive ? {
                    borderColor: [`${agent.color}50`, `${agent.color}80`, `${agent.color}50`],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: agent.color }}
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    <StudioAgentAvatar
                      agent={agent}
                      status={agentState.status}
                      size="md"
                      showMood={!isGenerating}
                      showWorkingMessage={isActive}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium transition-colors',
                          isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                        )}>
                          {agent.name}
                        </span>
                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.span
                              key="active"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-400"
                            >
                              <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                              Working
                            </motion.span>
                          )}
                          {isCompleted && !isActive && (
                            <motion.span
                              key="done"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400"
                            >
                              <Zap className="w-3 h-3" />
                              Done
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className={cn(
                        'text-xs truncate',
                        isActive ? 'text-slate-400' : 'text-slate-600'
                      )}>
                        {agent.role}
                      </p>
                    </div>
                  </div>

                  {/* Agent feedback */}
                  <AnimatePresence>
                    {agentState.currentFeedback && (isActive || isCompleted) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 ml-13"
                      >
                        <AgentFeedbackCard feedback={agentState.currentFeedback} compact />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Arrow connector to next agent */}
                {index < agentOrder.length - 1 && (
                  <div className="flex justify-center py-1.5 relative">
                    <motion.div
                      className={cn(
                        'relative',
                        isCompleted ? 'text-emerald-500/70' : 'text-slate-700'
                      )}
                    >
                      <ArrowDown className="w-4 h-4" />
                      {/* Animated data flow */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                            style={{ backgroundColor: agent.color }}
                            initial={{ y: -4, opacity: 0 }}
                            animate={{
                              y: [0, 20],
                              opacity: [0, 1, 0],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quality Gate - Always visible */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-900/50">
        <QualityGateIndicator />
      </div>
    </div>
  );
}
