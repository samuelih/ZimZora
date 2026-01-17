import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, Keyboard, Wand2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { useAgentStore, agentDefinitions } from '../../store/agentStore';
import { AgentDock } from './AgentDock';
import { AgentPanel } from './AgentPanel';
import { AgentWorkspace } from './AgentWorkspace';
import { AgentCard } from './AgentCard';
import { SuggestionCarousel } from './AgentSuggestionCard';
import { NotificationStack } from './AgentNotification';
import { GenerationOverlay } from '../shared';
import { cn } from '../../utils/helpers';

export function AgentsUI() {
  const {
    mainImage,
    references,
    generation,
    startGeneration,
    cancelGeneration,
    resetGeneration,
  } = useAppStore();

  const {
    agents,
    focusedAgentId,
    setFocusedAgent,
    globalMode,
    dismissInsight,
    dismissSuggestion,
    applySuggestion,
  } = useAgentStore();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);

  const focusedInstance = focusedAgentId ? agents[focusedAgentId] : null;

  // Get all active insights and suggestions across agents
  const allInsights = Object.values(agents)
    .flatMap((a) => a.insights)
    .filter((i) => !i.dismissed)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const allSuggestions = Object.values(agents)
    .flatMap((a) => a.suggestions)
    .filter((s) => !s.dismissed && !s.applied)
    .sort((a, b) => b.confidence - a.confidence);

  const canGenerate = mainImage && references.filter((r) => r.isActive).length > 0;

  // Show agent cards for agents with notifications when no agent is focused
  const agentsWithNotifications = Object.values(agents).filter(
    (a) =>
      a.isEnabled &&
      (a.insights.filter((i) => !i.dismissed).length > 0 ||
        a.suggestions.filter((s) => !s.dismissed && !s.applied).length > 0)
  );

  // Keyboard shortcut hint toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <AgentWorkspace />

          {/* Floating suggestions */}
          <AnimatePresence>
            {!focusedAgentId && allSuggestions.length > 0 && (
              <motion.div
                className="absolute bottom-24 left-6 w-80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <SuggestionCarousel
                  suggestions={allSuggestions}
                  onApply={(suggestion) => {
                    useAgentStore.getState().applySuggestion(suggestion.agentId, suggestion.id);
                  }}
                  onDismiss={(id) => {
                    const suggestion = allSuggestions.find((s) => s.id === id);
                    if (suggestion) {
                      useAgentStore.getState().dismissSuggestion(suggestion.agentId, id);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent panel (right side) */}
        <AnimatePresence>
          {focusedInstance && (
            <motion.div
              className="w-96 border-l border-slate-700 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <AgentPanel
                instance={focusedInstance}
                onClose={() => setFocusedAgent(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Agent dock */}
          <AgentDock />

          {/* Center: Agent notification cards (compact) */}
          <div className="flex-1 flex justify-center px-4">
            <AnimatePresence>
              {!focusedAgentId && agentsWithNotifications.length > 0 && (
                <motion.div
                  className="flex gap-2 max-w-xl overflow-x-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {agentsWithNotifications.slice(0, 3).map((instance) => (
                    <AgentCard
                      key={instance.agent.id}
                      instance={instance}
                      variant="compact"
                      onExpand={() => setFocusedAgent(instance.agent.id)}
                      className="w-56 flex-shrink-0"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate button - enhanced */}
          <motion.button
            onClick={startGeneration}
            disabled={!canGenerate}
            onMouseEnter={() => setIsGenerateHovered(true)}
            onMouseLeave={() => setIsGenerateHovered(false)}
            className={cn(
              'relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all overflow-hidden',
              canGenerate
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            )}
            whileHover={canGenerate ? { scale: 1.05 } : {}}
            whileTap={canGenerate ? { scale: 0.95 } : {}}
          >
            {/* Animated shine effect */}
            {canGenerate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={isGenerateHovered ? { x: '100%' } : { x: '-100%' }}
                transition={{ duration: 0.6 }}
              />
            )}
            <motion.div
              animate={canGenerate ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Wand2 className="w-5 h-5" />
            </motion.div>
            <span>Generate</span>
            {canGenerate && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mode indicator */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            globalMode === 'proactive' && 'bg-emerald-500',
            globalMode === 'passive' && 'bg-slate-500',
            globalMode === 'disabled' && 'bg-red-500'
          )}
        />
        <span className="text-xs text-slate-400 capitalize">{globalMode} Mode</span>
      </motion.div>

      {/* Floating notifications (top right) */}
      <AnimatePresence>
        {!focusedAgentId && (allInsights.length > 0 || allSuggestions.length > 0) && (
          <motion.div
            className="absolute top-16 right-4 w-80 z-20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <NotificationStack
              insights={allInsights.slice(0, 2)}
              suggestions={allSuggestions.slice(0, 1)}
              onDismissInsight={(id) => {
                const insight = allInsights.find((i) => i.id === id);
                if (insight) dismissInsight(insight.agentId, id);
              }}
              onDismissSuggestion={(id) => {
                const suggestion = allSuggestions.find((s) => s.id === id);
                if (suggestion) dismissSuggestion(suggestion.agentId, id);
              }}
              onViewInsight={(insight) => setFocusedAgent(insight.agentId)}
              onApplySuggestion={(suggestion) => {
                applySuggestion(suggestion.agentId, suggestion.id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help hint */}
      <motion.div
        className="absolute bottom-28 right-6 text-xs text-slate-500 flex items-center gap-2 cursor-pointer hover:text-slate-400 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setShowShortcuts(true)}
      >
        <Keyboard className="w-3 h-3" />
        Press ? for shortcuts
      </motion.div>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-400" />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-slate-400 font-medium">Agents</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(agentDefinitions).map(([id, agent]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50"
                    >
                      <span className="text-sm text-slate-300">{agent.name}</span>
                      <kbd
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{ backgroundColor: `${agent.color}30`, color: agent.color }}
                      >
                        {id === 'critic' ? 'R' : id[0].toUpperCase()}
                      </kbd>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="text-sm text-slate-400 font-medium mb-2">General</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50">
                      <span className="text-sm text-slate-300">Toggle shortcuts</span>
                      <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-slate-600 text-slate-300">?</kbd>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50">
                      <span className="text-sm text-slate-300">Close panel</span>
                      <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-slate-600 text-slate-300">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-6 w-full py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Overlay */}
      <GenerationOverlay
        state={generation}
        onCancel={cancelGeneration}
        onClose={resetGeneration}
      />
    </div>
  );
}
