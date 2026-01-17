import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { AgentInsight, AgentSuggestion, InsightType } from '../../types/agents';
import { agentDefinitions } from '../../store/agentStore';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '../../utils/helpers';

interface AgentNotificationProps {
  insight?: AgentInsight;
  suggestion?: AgentSuggestion;
  onDismiss: () => void;
  onAction?: () => void;
  className?: string;
}

const insightIcons: Record<InsightType, React.ElementType> = {
  analysis: TrendingUp,
  suggestion: Lightbulb,
  warning: AlertTriangle,
  tip: Sparkles,
  comparison: TrendingUp,
  discovery: Sparkles,
};

export function AgentNotification({
  insight,
  suggestion,
  onDismiss,
  onAction,
  className,
}: AgentNotificationProps) {
  const item = insight || suggestion;
  if (!item) return null;

  const agent = agentDefinitions[item.agentId];
  const isInsight = !!insight;
  const Icon = isInsight ? insightIcons[insight!.type] : Lightbulb;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-2xl border',
        'bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl',
        'border-slate-700/50',
        className
      )}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`,
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: agent.color }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            >
              <AgentAvatar
                agentId={item.agentId}
                status="suggesting"
                color={agent.color}
                size="sm"
                showStatus={false}
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{agent.name}</span>
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{
                    backgroundColor: `${agent.color}20`,
                    color: agent.color,
                  }}
                >
                  {item.confidence}% confident
                </span>
              </div>
              <p className="text-xs text-slate-400">{isInsight ? 'New insight' : 'Suggestion'}</p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: agent.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2">
              {isInsight ? insight!.summary : suggestion!.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        {onAction && (
          <div className="mt-3 flex gap-2">
            <motion.button
              onClick={onAction}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{
                background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isInsight ? 'View Details' : 'Apply'}
            </motion.button>
            <motion.button
              onClick={onDismiss}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Later
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Toast-style notifications stack
interface NotificationStackProps {
  insights: AgentInsight[];
  suggestions: AgentSuggestion[];
  onDismissInsight: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  onViewInsight: (insight: AgentInsight) => void;
  onApplySuggestion: (suggestion: AgentSuggestion) => void;
  className?: string;
}

export function NotificationStack({
  insights,
  suggestions,
  onDismissInsight,
  onDismissSuggestion,
  onViewInsight,
  onApplySuggestion,
  className,
}: NotificationStackProps) {
  // Show max 3 notifications
  const recentInsights = insights.slice(-2);
  const recentSuggestions = suggestions.slice(-1);

  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence mode="popLayout">
        {recentInsights.map((insight) => (
          <AgentNotification
            key={`insight-${insight.id}`}
            insight={insight}
            onDismiss={() => onDismissInsight(insight.id)}
            onAction={() => onViewInsight(insight)}
          />
        ))}
        {recentSuggestions.map((suggestion) => (
          <AgentNotification
            key={`suggestion-${suggestion.id}`}
            suggestion={suggestion}
            onDismiss={() => onDismissSuggestion(suggestion.id)}
            onAction={() => onApplySuggestion(suggestion)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
