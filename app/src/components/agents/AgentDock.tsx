import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore, agentDefinitions } from '../../store/agentStore';
import { AgentId } from '../../types/agents';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '../../utils/helpers';

interface AgentDockProps {
  className?: string;
}

const agentOrder: AgentId[] = ['scout', 'analyst', 'composer', 'generator', 'critic'];

const agentShortcuts: Record<AgentId, string> = {
  scout: 'S',
  analyst: 'A',
  composer: 'C',
  generator: 'G',
  critic: 'R',
};

export function AgentDock({ className }: AgentDockProps) {
  const { agents, setActiveAgent, focusedAgentId, setFocusedAgent } = useAgentStore();
  const [hoveredAgent, setHoveredAgent] = useState<AgentId | null>(null);

  const handleAgentClick = (agentId: AgentId) => {
    if (focusedAgentId === agentId) {
      setFocusedAgent(null);
    } else {
      setFocusedAgent(agentId);
      setActiveAgent(agentId);
    }
  };

  // Keyboard shortcuts for agents
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.metaKey || e.ctrlKey) return;

      const keyMap: Record<string, AgentId> = {
        's': 'scout',
        'a': 'analyst',
        'c': 'composer',
        'g': 'generator',
        'r': 'critic',
      };

      const agentId = keyMap[e.key.toLowerCase()];
      if (agentId) {
        e.preventDefault();
        handleAgentClick(agentId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedAgentId]);

  return (
    <motion.div
      className={cn(
        'flex items-center gap-1 p-2 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl',
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
    >
      {agentOrder.map((agentId, index) => {
        const instance = agents[agentId];
        const agent = agentDefinitions[agentId];
        const isFocused = focusedAgentId === agentId;
        const isHovered = hoveredAgent === agentId;
        const hasNotifications =
          instance.insights.filter((i) => !i.dismissed).length > 0 ||
          instance.suggestions.filter((s) => !s.dismissed && !s.applied).length > 0;
        const notificationCount =
          instance.insights.filter((i) => !i.dismissed).length +
          instance.suggestions.filter((s) => !s.dismissed && !s.applied).length;

        return (
          <div key={agentId} className="relative">
            <motion.button
              onClick={() => handleAgentClick(agentId)}
              onMouseEnter={() => setHoveredAgent(agentId)}
              onMouseLeave={() => setHoveredAgent(null)}
              className={cn(
                'relative p-2 rounded-xl transition-all duration-200',
                'hover:bg-slate-700/50',
                isFocused && 'bg-slate-700/70',
                !instance.isEnabled && 'opacity-40'
              )}
              style={{
                boxShadow: isFocused ? `0 0 20px ${agent.color}40, 0 0 40px ${agent.color}20` : undefined,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={`${agent.name} (${agentShortcuts[agentId]})`}
            >
              {/* Glow ring for focused agent */}
              {isFocused && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${agent.color}30 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              <AgentAvatar
                agentId={agentId}
                status={instance.status}
                color={agent.color}
                size="md"
                showStatus={instance.isEnabled}
              />

              {/* Notification badge */}
              <AnimatePresence>
                {hasNotifications && instance.isEnabled && (
                  <motion.div
                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Enhanced tooltip */}
            <AnimatePresence>
              {isHovered && !isFocused && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className="px-4 py-3 rounded-xl shadow-2xl border border-slate-600/50 min-w-[200px]"
                    style={{
                      background: `linear-gradient(135deg, ${agent.color}15, rgba(30, 41, 59, 0.95))`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${agent.color}30` }}
                      >
                        <AgentAvatar
                          agentId={agentId}
                          status="idle"
                          color={agent.color}
                          size="sm"
                          showStatus={false}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{agent.name}</div>
                        <div className="text-xs text-slate-400">{agent.role}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{agent.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                        Press {agentShortcuts[agentId]}
                      </span>
                      {instance.status !== 'idle' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 capitalize">
                          {instance.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 rotate-45 border-r border-b border-slate-600/50"
                    style={{
                      background: `linear-gradient(135deg, transparent 50%, rgba(30, 41, 59, 0.95) 50%)`,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Divider */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent mx-2" />

      {/* Mode indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30">
        <motion.div
          className="w-2 h-2 rounded-full bg-emerald-500"
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              '0 0 0 0 rgba(16, 185, 129, 0.4)',
              '0 0 0 6px rgba(16, 185, 129, 0)',
              '0 0 0 0 rgba(16, 185, 129, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-slate-400 font-medium">Active</span>
      </div>
    </motion.div>
  );
}
