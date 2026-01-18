import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, Eye, CheckCircle, Sparkles, Loader2, Zap, MessageCircle } from 'lucide-react';
import { StudioAgent, AgentStatus, StudioAgentId } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

const iconMap = {
  Paintbrush,
  Eye,
  CheckCircle,
  Sparkles,
};

// Personality traits and moods for each agent type
const agentPersonality: Record<StudioAgentId, {
  idleAnimation: 'breathe' | 'pulse' | 'shimmer' | 'glow';
  moodEmoji: string;
  workingMessage: string;
}> = {
  creator: {
    idleAnimation: 'shimmer',
    moodEmoji: '✨',
    workingMessage: 'Crafting...',
  },
  critic: {
    idleAnimation: 'pulse',
    moodEmoji: '🔍',
    workingMessage: 'Analyzing...',
  },
  reality: {
    idleAnimation: 'glow',
    moodEmoji: '🎯',
    workingMessage: 'Matching...',
  },
  refiner: {
    idleAnimation: 'breathe',
    moodEmoji: '💎',
    workingMessage: 'Polishing...',
  },
};

interface StudioAgentAvatarProps {
  agent: StudioAgent;
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showMood?: boolean;
  showWorkingMessage?: boolean;
}

export function StudioAgentAvatar({
  agent,
  status,
  size = 'md',
  showMood = false,
  showWorkingMessage = false,
}: StudioAgentAvatarProps) {
  const Icon = iconMap[agent.icon as keyof typeof iconMap] || Sparkles;
  const personality = agentPersonality[agent.id];

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

  const glowSizes = {
    sm: 'inset-[-4px]',
    md: 'inset-[-6px]',
    lg: 'inset-[-8px]',
  };

  const isWorking = status === 'working';
  const isIdle = status === 'idle';
  const isComplete = status === 'complete';

  // Different idle animations based on agent personality
  const getIdleAnimation = () => {
    if (!isIdle) return {};

    switch (personality.idleAnimation) {
      case 'breathe':
        return {
          scale: [1, 1.03, 1],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'pulse':
        return {
          opacity: [1, 0.85, 1],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'shimmer':
        return {
          rotate: [0, 2, -2, 0],
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'glow':
        return {
          boxShadow: [
            '0 0 0 0 rgba(255,255,255,0)',
            '0 0 15px 2px rgba(255,255,255,0.2)',
            '0 0 0 0 rgba(255,255,255,0)',
          ],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative">
      {/* Outer glow effect for idle state */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            className={cn(
              'absolute rounded-xl -z-10',
              glowSizes[size]
            )}
            style={{
              background: `linear-gradient(135deg, ${agent.color}40, ${agent.color}20)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Progress ring for working state */}
      <AnimatePresence>
        {isWorking && (
          <motion.svg
            className={cn(
              'absolute -inset-1 z-10',
              size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
            )}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' } }}
          >
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke={agent.color}
              strokeWidth="2"
              strokeDasharray="20 80"
              strokeLinecap="round"
              className="opacity-60"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Main avatar container */}
      <motion.div
        className={cn(
          'relative rounded-xl flex items-center justify-center overflow-hidden',
          sizeClasses[size],
          `bg-gradient-to-br ${agent.gradient}`
        )}
        animate={isWorking ? { scale: [1, 1.05, 1] } : getIdleAnimation()}
        transition={isWorking ? { duration: 0.8, repeat: Infinity } : undefined}
        whileHover={{ scale: 1.1 }}
      >
        {/* Shimmer effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={isIdle ? { x: ['100%', '-100%'] } : { x: '-100%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Icon */}
        <AnimatePresence mode="wait">
          {isWorking ? (
            <motion.div
              key="working"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className={cn(iconSizes[size], 'text-white')} />
              </motion.div>
            </motion.div>
          ) : isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Zap className={cn(iconSizes[size], 'text-white')} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Icon className={cn(iconSizes[size], 'text-white drop-shadow-sm')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inner glow when working */}
        {isWorking && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                'inset 0 0 10px rgba(255,255,255,0.2)',
                'inset 0 0 20px rgba(255,255,255,0.4)',
                'inset 0 0 10px rgba(255,255,255,0.2)',
              ],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Status indicator badge */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn(
              'absolute -bottom-1 -right-1 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center',
              size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
            )}
          >
            <CheckCircle className={cn(size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5', 'text-white')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood emoji indicator */}
      <AnimatePresence>
        {showMood && isIdle && (
          <motion.div
            initial={{ scale: 0, y: 5, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: 5, opacity: 0 }}
            className={cn(
              'absolute -top-1 -right-1 text-xs',
              size === 'lg' && 'text-sm'
            )}
          >
            {personality.moodEmoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Working message bubble */}
      <AnimatePresence>
        {showWorkingMessage && isWorking && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            className="absolute left-full ml-2 flex items-center gap-1 whitespace-nowrap"
          >
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700/80 backdrop-blur-sm"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MessageCircle className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-300">{personality.workingMessage}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle effects when complete */}
      <AnimatePresence>
        {isComplete && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-emerald-400"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 10)],
                  y: [0, (i < 2 ? -1 : 1) * (15 + Math.random() * 10)],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
