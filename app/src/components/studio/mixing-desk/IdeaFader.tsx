import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Headphones, X, Palette } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { IdeaInput, FaderState } from '../../../types/studio';
import { StyleDNABadge } from './StyleDNABadge';
import { cn } from '../../../utils/helpers';

interface IdeaFaderProps {
  idea: IdeaInput;
  fader: FaderState;
}

export function IdeaFader({ idea, fader }: IdeaFaderProps) {
  const { updateFader, muteIdea, soloIdea, removeIdea } = useStudioStore();

  const handleInfluenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFader(idea.id, { influence: Number(e.target.value) });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'rounded-xl border transition-all',
        fader?.muted
          ? 'bg-slate-800/30 border-slate-700/30'
          : fader?.solo
          ? 'bg-indigo-900/30 border-indigo-500/50'
          : 'bg-slate-800/50 border-slate-700/50'
      )}
    >
      {/* Header with image and name */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={idea.thumbnail}
            alt={idea.name}
            className={cn(
              'w-full h-full object-cover transition-all',
              fader?.muted && 'opacity-40 grayscale'
            )}
          />
          {fader?.solo && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            fader?.muted ? 'text-slate-500' : 'text-white'
          )}>
            {idea.name}
          </p>
          <p className="text-xs text-slate-500 capitalize">{idea.type}</p>
        </div>

        <motion.button
          onClick={() => removeIdea(idea.id)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Fader Controls */}
      <div className="px-3 pb-3">
        {/* Influence Slider */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={fader?.influence || 50}
              onChange={handleInfluenceChange}
              disabled={fader?.muted}
              className={cn(
                'w-full h-2 rounded-full appearance-none cursor-pointer',
                fader?.muted ? 'bg-slate-700' : 'bg-slate-700',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4',
                '[&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:bg-indigo-500',
                '[&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:transition-transform',
                '[&::-webkit-slider-thumb]:hover:scale-110',
                fader?.muted && '[&::-webkit-slider-thumb]:bg-slate-600'
              )}
              style={{
                background: fader?.muted
                  ? undefined
                  : `linear-gradient(to right, #6366f1 0%, #6366f1 ${fader?.influence || 50}%, #334155 ${fader?.influence || 50}%, #334155 100%)`,
              }}
            />
          </div>
          <span className={cn(
            'text-xs font-mono w-8 text-right',
            fader?.muted ? 'text-slate-600' : 'text-slate-400'
          )}>
            {fader?.influence || 50}%
          </span>
        </div>

        {/* Mute/Solo Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => muteIdea(idea.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              fader?.muted
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {fader?.muted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{fader?.muted ? 'Muted' : 'Mute'}</span>
          </motion.button>

          <motion.button
            onClick={() => soloIdea(idea.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              fader?.solo
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{fader?.solo ? 'Solo' : 'Solo'}</span>
          </motion.button>
        </div>
      </div>

      {/* Style DNA */}
      <div className="px-3 pb-3">
        <StyleDNABadge styleDNA={idea.styleDNA} compact />
      </div>
    </motion.div>
  );
}
