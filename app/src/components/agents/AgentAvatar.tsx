import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BarChart2,
  Sliders,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { AgentId, AgentStatus } from '../../types/agents';
import { cn } from '../../utils/helpers';

interface AgentAvatarProps {
  agentId: AgentId;
  status: AgentStatus;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const iconMap: Record<AgentId, React.ElementType> = {
  scout: Search,
  analyst: BarChart2,
  composer: Sliders,
  generator: Zap,
  critic: MessageCircle,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

const statusColors: Record<AgentStatus, string> = {
  idle: 'bg-slate-400',
  observing: 'bg-blue-400',
  analyzing: 'bg-indigo-500',
  thinking: 'bg-purple-500',
  suggesting: 'bg-amber-500',
  working: 'bg-emerald-500',
  waiting: 'bg-yellow-500',
  error: 'bg-red-500',
};

const statusGlowColors: Record<AgentStatus, string> = {
  idle: 'rgba(148, 163, 184, 0.3)',
  observing: 'rgba(96, 165, 250, 0.4)',
  analyzing: 'rgba(99, 102, 241, 0.5)',
  thinking: 'rgba(168, 85, 247, 0.5)',
  suggesting: 'rgba(245, 158, 11, 0.5)',
  working: 'rgba(16, 185, 129, 0.5)',
  waiting: 'rgba(234, 179, 8, 0.4)',
  error: 'rgba(239, 68, 68, 0.5)',
};

export function AgentAvatar({
  agentId,
  status,
  color,
  size = 'md',
  showStatus = true,
  className,
}: AgentAvatarProps) {
  const Icon = iconMap[agentId];
  const isActive = status !== 'idle';
  const isWorking = ['analyzing', 'thinking', 'working'].includes(status);
  const isSuggesting = status === 'suggesting';
  const isObserving = status === 'observing';

  return (
    <div className={cn('relative', className)}>
      {/* Outer glow ring for active states */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              size === 'sm' ? '-m-1' : size === 'md' ? '-m-1.5' : '-m-2'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: isWorking ? 1 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: `radial-gradient(circle, ${statusGlowColors[status]} 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main avatar */}
      <motion.div
        className={cn(
          sizeClasses[size],
          'rounded-full flex items-center justify-center relative overflow-hidden',
          'shadow-lg',
          isActive && 'ring-2 ring-white/20'
        )}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        }}
        animate={
          isWorking
            ? {
                scale: [1, 1.08, 1],
              }
            : isSuggesting
            ? {
                rotate: [0, 5, -5, 0],
              }
            : {}
        }
        transition={{
          duration: isWorking ? 1 : 0.5,
          repeat: isActive ? Infinity : 0,
          repeatDelay: isSuggesting ? 2 : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

        {/* Rotating ring for observing state */}
        <AnimatePresence>
          {isObserving && (
            <motion.div
              className="absolute inset-1 rounded-full border-2 border-transparent border-t-white/40"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.3 },
              }}
            />
          )}
        </AnimatePresence>

        {/* Pulsing dots for thinking state */}
        <AnimatePresence>
          {status === 'thinking' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-white/60 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon with animation */}
        <motion.div
          animate={
            isWorking
              ? { scale: [1, 0.9, 1] }
              : status === 'thinking'
              ? { opacity: 0.3 }
              : {}
          }
          transition={{ duration: 1, repeat: isWorking ? Infinity : 0 }}
        >
          <Icon className={cn(iconSizes[size], 'text-white relative z-10')} />
        </motion.div>
      </motion.div>

      {/* Status indicator with pulse */}
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5">
          {/* Pulse ring */}
          {isActive && (
            <motion.div
              className={cn(
                'absolute rounded-full',
                size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
                statusColors[status]
              )}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
          {/* Main dot */}
          <motion.div
            className={cn(
              'relative rounded-full border-2 border-slate-900',
              size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
              statusColors[status]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      )}
    </div>
  );
}
