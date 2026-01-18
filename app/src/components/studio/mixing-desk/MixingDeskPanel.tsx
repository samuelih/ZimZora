import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Music2, Trash2 } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { IdeaDropZone } from './IdeaDropZone';
import { IdeaFader } from './IdeaFader';

export function MixingDeskPanel() {
  const { ideas, faders, clearAllIdeas } = useStudioStore();

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Mixing Desk</h3>
              <p className="text-xs text-slate-500">{ideas.length} idea{ideas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {ideas.length > 0 && (
            <motion.button
              onClick={clearAllIdeas}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear all ideas"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div className="flex-shrink-0 p-4">
        <IdeaDropZone />
      </div>

      {/* Faders List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="popLayout">
          {ideas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-sm text-slate-500">
                Drop images, pins, or sketches above to start mixing
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <IdeaFader
                  key={idea.id}
                  idea={idea}
                  fader={faders[idea.id]}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mix Summary */}
      {ideas.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/50">
          <div className="text-xs text-slate-500 mb-2">Active Mix</div>
          <div className="flex flex-wrap gap-1">
            {ideas
              .filter((i) => !faders[i.id]?.muted)
              .map((idea) => (
                <span
                  key={idea.id}
                  className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300"
                  style={{ opacity: (faders[idea.id]?.influence || 50) / 100 }}
                >
                  {idea.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
