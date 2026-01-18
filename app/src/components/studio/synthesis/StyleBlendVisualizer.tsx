import React from 'react';
import { motion } from 'framer-motion';
import { IdeaInput, FaderState } from '../../../types/studio';

interface StyleBlendVisualizerProps {
  ideas: IdeaInput[];
  faders: Record<string, FaderState>;
}

export function StyleBlendVisualizer({ ideas, faders }: StyleBlendVisualizerProps) {
  // Collect all colors weighted by influence
  const weightedColors: Array<{ color: string; weight: number }> = [];
  ideas.forEach((idea) => {
    const influence = faders[idea.id]?.influence || 50;
    idea.styleDNA.colors.forEach((color) => {
      weightedColors.push({ color, weight: influence });
    });
  });

  // Get unique moods and aesthetics
  const allMoods = [...new Set(ideas.flatMap((i) => i.styleDNA.mood))];
  const allAesthetics = [...new Set(ideas.flatMap((i) => i.styleDNA.aesthetics))];

  // Calculate blended confidence
  const avgConfidence =
    ideas.reduce((sum, i) => sum + i.styleDNA.confidence, 0) / ideas.length;

  return (
    <div className="space-y-3">
      {/* Color blend bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Blended Palette</span>
          <span className="text-xs text-slate-500">{Math.round(avgConfidence * 100)}% confidence</span>
        </div>
        <div className="h-6 rounded-lg overflow-hidden flex">
          {weightedColors.map((wc, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${wc.weight / weightedColors.length}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              style={{ backgroundColor: wc.color }}
              className="h-full"
            />
          ))}
        </div>
      </div>

      {/* Style attributes */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Mood:</span>
          {allMoods.slice(0, 3).map((mood) => (
            <motion.span
              key={mood}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-violet-500/20 text-xs text-violet-400"
            >
              {mood}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Style:</span>
          {allAesthetics.slice(0, 3).map((aesthetic) => (
            <motion.span
              key={aesthetic}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-xs text-emerald-400"
            >
              {aesthetic}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
