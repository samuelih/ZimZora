import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, ChevronDown, ChevronUp } from 'lucide-react';
import { StyleDNA } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

interface StyleDNABadgeProps {
  styleDNA: StyleDNA;
  compact?: boolean;
}

export function StyleDNABadge({ styleDNA, compact = false }: StyleDNABadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {/* Color swatches */}
        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-slate-700/50">
          {styleDNA.colors.slice(0, 3).map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border border-slate-600"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Top aesthetic */}
        {styleDNA.aesthetics[0] && (
          <span className="px-2 py-1 rounded-full bg-slate-700/50 text-xs text-slate-400">
            {styleDNA.aesthetics[0]}
          </span>
        )}

        {/* Confidence */}
        <span className="px-2 py-1 rounded-full bg-slate-700/50 text-xs text-slate-500">
          {Math.round(styleDNA.confidence * 100)}% match
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-300">Style DNA</span>
          <span className="text-xs text-slate-500">
            {Math.round(styleDNA.confidence * 100)}% confidence
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-3 space-y-3">
              {/* Colors */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Colors</p>
                <div className="flex gap-1.5">
                  {styleDNA.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border border-slate-600 shadow-inner"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Mood</p>
                <div className="flex flex-wrap gap-1">
                  {styleDNA.mood.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-violet-500/20 text-xs text-violet-400"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Aesthetics */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Aesthetics</p>
                <div className="flex flex-wrap gap-1">
                  {styleDNA.aesthetics.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-xs text-emerald-400"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Patterns */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Patterns</p>
                <div className="flex flex-wrap gap-1">
                  {styleDNA.patterns.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-amber-500/20 text-xs text-amber-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
