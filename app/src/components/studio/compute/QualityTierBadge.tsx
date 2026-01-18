import React from 'react';
import { motion } from 'framer-motion';
import { FileImage, Film } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { cn } from '../../../utils/helpers';

export function QualityTierBadge() {
  const { qualityTier, computeMode } = useStudioStore();

  const isDraft = qualityTier === 'draft';

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border',
        isDraft
          ? 'bg-slate-800/50 border-slate-700 text-slate-400'
          : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300'
      )}
    >
      {isDraft ? (
        <>
          <FileImage className="w-4 h-4" />
          <span className="text-xs font-medium">Draft Quality</span>
        </>
      ) : (
        <>
          <Film className="w-4 h-4" />
          <span className="text-xs font-medium">Production Quality</span>
        </>
      )}

      {/* Quality indicator dots */}
      <div className="flex items-center gap-0.5 ml-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isDraft
                ? level === 1 ? 'bg-slate-400' : 'bg-slate-600'
                : level <= 3 ? 'bg-indigo-400' : 'bg-indigo-700'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
