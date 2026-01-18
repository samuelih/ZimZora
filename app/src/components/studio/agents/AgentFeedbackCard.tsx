import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, AlertTriangle, Check, X } from 'lucide-react';
import { AgentFeedback } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

interface AgentFeedbackCardProps {
  feedback: AgentFeedback;
  compact?: boolean;
}

export function AgentFeedbackCard({ feedback, compact = false }: AgentFeedbackCardProps) {
  const typeConfig = {
    suggestion: {
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    approval: {
      icon: Check,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    rejection: {
      icon: X,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
  };

  const config = typeConfig[feedback.type];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-lg border p-2', config.bg, config.border)}
      >
        <div className="flex items-start gap-2">
          <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.color)} />
          <p className="text-xs text-slate-300 line-clamp-2">{feedback.message}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border p-4', config.bg, config.border)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{feedback.title}</span>
            <span className="text-xs text-slate-500 capitalize">{feedback.type}</span>
          </div>
          <p className="text-sm text-slate-400">{feedback.message}</p>

          {feedback.details && (
            <p className="text-xs text-slate-500 mt-2">{feedback.details}</p>
          )}

          {feedback.affectedAreas && feedback.affectedAreas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {feedback.affectedAreas.map((area) => (
                <span
                  key={area}
                  className="px-2 py-0.5 rounded-full bg-slate-700/50 text-xs text-slate-400"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
