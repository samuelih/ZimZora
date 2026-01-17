import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { AgentSuggestion } from '../../types/agents';
import { agentDefinitions } from '../../store/agentStore';
import { cn } from '../../utils/helpers';

interface AgentSuggestionCardProps {
  suggestion: AgentSuggestion;
  onApply?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const impactColors = {
  low: 'text-slate-400 bg-slate-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-emerald-400 bg-emerald-500/10',
};

export function AgentSuggestionCard({
  suggestion,
  onApply,
  onDismiss,
  className,
}: AgentSuggestionCardProps) {
  const agent = agentDefinitions[suggestion.agentId];

  return (
    <motion.div
      className={cn(
        'p-4 bg-slate-800 rounded-xl border border-slate-700',
        'hover:border-slate-600 transition-colors',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
          <span className="text-xs text-slate-400">{agent.name}</span>
          <span className={cn('px-1.5 py-0.5 text-xs rounded', impactColors[suggestion.impact])}>
            {suggestion.impact} impact
          </span>
        </div>
        <span className="text-xs text-slate-500">{suggestion.confidence}% confident</span>
      </div>

      {/* Content */}
      <h4 className="font-medium text-white mb-1">{suggestion.title}</h4>
      <p className="text-sm text-slate-400 mb-4">{suggestion.description}</p>

      {/* Preview if available */}
      {suggestion.preview && (
        <div className="mb-4 rounded-lg overflow-hidden bg-slate-900">
          <img
            src={suggestion.preview}
            alt="Preview"
            className="w-full h-24 object-cover opacity-80"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={onApply}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check className="w-4 h-4" />
          Apply
        </motion.button>
        <motion.button
          onClick={onDismiss}
          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Carousel for multiple suggestions
interface SuggestionCarouselProps {
  suggestions: AgentSuggestion[];
  onApply: (suggestion: AgentSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  className?: string;
}

export function SuggestionCarousel({
  suggestions,
  onApply,
  onDismiss,
  className,
}: SuggestionCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const activeSuggestions = suggestions.filter((s) => !s.dismissed && !s.applied);

  if (activeSuggestions.length === 0) return null;

  const currentSuggestion = activeSuggestions[currentIndex];

  return (
    <div className={cn('relative', className)}>
      <AgentSuggestionCard
        suggestion={currentSuggestion}
        onApply={() => onApply(currentSuggestion)}
        onDismiss={() => onDismiss(currentSuggestion.id)}
      />

      {activeSuggestions.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {activeSuggestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-white' : 'bg-slate-600'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
