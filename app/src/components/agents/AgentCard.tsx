import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, ChevronRight } from 'lucide-react';
import { AgentInstance } from '../../types/agents';
import { agentDefinitions } from '../../store/agentStore';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '../../utils/helpers';

interface AgentCardProps {
  instance: AgentInstance;
  variant?: 'compact' | 'expanded' | 'floating';
  onExpand?: () => void;
  onDismiss?: () => void;
  onMinimize?: () => void;
  className?: string;
}

const statusLabels: Record<string, string> = {
  idle: 'Ready to help',
  observing: 'Observing...',
  analyzing: 'Analyzing...',
  thinking: 'Thinking...',
  suggesting: 'Has suggestions',
  working: 'Working...',
  waiting: 'Waiting for input',
  error: 'Something went wrong',
};

export function AgentCard({
  instance,
  variant = 'compact',
  onExpand,
  onDismiss,
  onMinimize,
  className,
}: AgentCardProps) {
  const agent = agentDefinitions[instance.agent.id];
  const activeInsights = instance.insights.filter((i) => !i.dismissed);
  const activeSuggestions = instance.suggestions.filter((s) => !s.dismissed && !s.applied);
  const latestInsight = activeInsights[activeInsights.length - 1];

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700',
          'hover:border-slate-600 transition-colors cursor-pointer',
          className
        )}
        onClick={onExpand}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <AgentAvatar
          agentId={instance.agent.id}
          status={instance.status}
          color={agent.color}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">{agent.name}</span>
            {(activeInsights.length > 0 || activeSuggestions.length > 0) && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                {activeInsights.length + activeSuggestions.length} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">
            {instance.currentTask?.description || statusLabels[instance.status]}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden',
        variant === 'floating' && 'shadow-2xl',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-slate-700"
        style={{
          background: `linear-gradient(135deg, ${agent.color}15, transparent)`,
        }}
      >
        <div className="flex items-center gap-3">
          <AgentAvatar
            agentId={instance.agent.id}
            status={instance.status}
            color={agent.color}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-400">{agent.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              instance.status === 'idle' && 'bg-slate-500',
              instance.status === 'working' && 'bg-green-500 animate-pulse',
              instance.status === 'analyzing' && 'bg-indigo-500 animate-pulse',
              instance.status === 'suggesting' && 'bg-amber-500',
              instance.status === 'error' && 'bg-red-500'
            )}
          />
          <span className="text-sm text-slate-300">
            {instance.currentTask?.description || statusLabels[instance.status]}
          </span>
        </div>

        {/* Progress bar for tasks */}
        {instance.currentTask && instance.currentTask.status === 'running' && (
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: agent.color }}
              initial={{ width: 0 }}
              animate={{ width: `${instance.currentTask.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Latest insight preview */}
      {latestInsight && (
        <div className="p-4">
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm font-medium text-white mb-1">{latestInsight.title}</p>
            <p className="text-xs text-slate-400 line-clamp-2">{latestInsight.summary}</p>
          </div>
        </div>
      )}

      {/* Capabilities */}
      <div className="px-4 pb-4">
        <p className="text-xs text-slate-500 mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-0.5 text-slate-500 text-xs">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
