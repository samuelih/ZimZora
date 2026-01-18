import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blend, Sparkles, Image } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { BlendPreview } from './BlendPreview';
import { StyleBlendVisualizer } from './StyleBlendVisualizer';
import { cn } from '../../../utils/helpers';

export function SynthesisZone() {
  const { ideas, faders, synthesisMode, blendResult } = useStudioStore();

  const activeIdeas = ideas.filter((i) => !faders[i.id]?.muted);
  const hasContent = activeIdeas.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Blend className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Synthesis Zone</h3>
            <p className="text-xs text-slate-500">
              {hasContent
                ? `Blending ${activeIdeas.length} idea${activeIdeas.length !== 1 ? 's' : ''}`
                : 'Add ideas to start mixing'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasContent ? (
            <EmptyState key="empty" />
          ) : synthesisMode === 'complete' && blendResult ? (
            <BlendPreview key="result" result={blendResult} />
          ) : synthesisMode === 'generating' ? (
            <GeneratingState key="generating" />
          ) : (
            <PreviewState key="preview" ideas={activeIdeas} faders={faders} />
          )}
        </AnimatePresence>
      </div>

      {/* Style DNA Visualizer */}
      {hasContent && synthesisMode !== 'complete' && (
        <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
          <StyleBlendVisualizer ideas={activeIdeas} faders={faders} />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center max-w-sm"
    >
      {/* Animated illustration */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbital rings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {/* Outer ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#emptyGradient1)"
            strokeWidth="1"
            strokeDasharray="8 8"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />
          {/* Middle ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="url(#emptyGradient2)"
            strokeWidth="1"
            strokeDasharray="6 6"
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />
          {/* Inner ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="35"
            fill="none"
            stroke="url(#emptyGradient3)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="emptyGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="emptyGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="emptyGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating placeholder shapes */}
        {[
          { x: 25, y: 40, delay: 0, color: '#6366f1' },
          { x: 140, y: 55, delay: 0.5, color: '#8b5cf6' },
          { x: 70, y: 130, delay: 1, color: '#06b6d4' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center"
            style={{
              left: item.x,
              top: item.y,
              borderColor: `${item.color}50`,
              backgroundColor: `${item.color}10`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [0.9, 1, 0.9],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image className="w-4 h-4" style={{ color: `${item.color}80` }} />
          </motion.div>
        ))}

        {/* Center blend icon */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(99, 102, 241, 0.1)',
              '0 0 40px rgba(139, 92, 246, 0.2)',
              '0 0 20px rgba(99, 102, 241, 0.1)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Blend className="w-7 h-7 text-indigo-400" />
          </motion.div>
        </motion.div>

        {/* Sparkle particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-indigo-400"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-white mb-2">
          Ready to blend your vision
        </h4>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Drop your inspiration images in the Mixing Desk and watch them synthesize into something new
        </p>

        {/* Quick tips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: '🎨', text: 'Styles merge' },
            { icon: '✨', text: 'AI enhances' },
            { icon: '🛍️', text: 'Shop results' },
          ].map((tip, i) => (
            <motion.div
              key={tip.text}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function GeneratingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <motion.div
        className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          borderColor: ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(99, 102, 241, 0.3)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </motion.div>
      </motion.div>
      <h4 className="text-lg font-medium text-white mb-2">Synthesizing your vision...</h4>
      <p className="text-sm text-slate-400">The agents are working together to blend your ideas</p>
    </motion.div>
  );
}

interface PreviewStateProps {
  ideas: Array<{ id: string; thumbnail: string; name: string }>;
  faders: Record<string, { influence: number }>;
}

function PreviewState({ ideas, faders }: PreviewStateProps) {
  // Calculate positions in a circle
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ width: 300, height: 300 }}
    >
      {/* Center blend indicator */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/50 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Blend className="w-8 h-8 text-indigo-400" />
      </motion.div>

      {/* Idea thumbnails around the center */}
      {ideas.map((idea, index) => {
        const angle = (index / ideas.length) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius - 28;
        const y = centerY + Math.sin(angle) * radius - 28;
        const influence = faders[idea.id]?.influence || 50;

        return (
          <motion.div
            key={idea.id}
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Connection line to center */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: 28,
                top: 28,
                width: centerX - x,
                height: centerY - y,
                overflow: 'visible',
              }}
            >
              <motion.line
                x1="0"
                y1="0"
                x2={centerX - x - 28}
                y2={centerY - y - 28}
                stroke="url(#gradient)"
                strokeWidth={2}
                strokeOpacity={influence / 100}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Thumbnail */}
            <motion.div
              className="w-14 h-14 rounded-xl overflow-hidden border-2 shadow-lg"
              style={{
                borderColor: `rgba(99, 102, 241, ${influence / 100})`,
                opacity: 0.5 + (influence / 200),
              }}
              whileHover={{ scale: 1.1 }}
            >
              <img
                src={idea.thumbnail}
                alt={idea.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Influence indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
              {influence}%
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
