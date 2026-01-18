import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download, RefreshCw } from 'lucide-react';
import { BlendResult } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface BlendPreviewProps {
  result: BlendResult;
}

export function BlendPreview({ result }: BlendPreviewProps) {
  const { resetStudio } = useStudioStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center"
    >
      {/* Result Image */}
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-700/50"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <img
          src={result.imageUrl}
          alt="Synthesized result"
          className="max-w-md max-h-80 object-contain"
        />

        {/* Success badge */}
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-sm font-medium shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Check className="w-4 h-4" />
          <span>Complete</span>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex items-center gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={resetStudio}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New</span>
        </motion.button>

        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </motion.button>
      </motion.div>

      {/* Contribution breakdown */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-slate-500 mb-2">Input Contributions</p>
        <div className="flex items-center justify-center gap-1">
          {result.inputContributions.map((contrib, i) => (
            <div
              key={contrib.ideaId}
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${contrib.contributionPercent}px` }}
              title={`${contrib.contributionPercent}%`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
