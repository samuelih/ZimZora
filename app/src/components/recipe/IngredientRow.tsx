import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReferenceConfig, NodeType } from '../../types';
import { useAppStore } from '../../store';
import { cn, getCulinaryTerm, culinaryTerms } from '../../utils/helpers';
import { NodeTypeBadge, NodeTypeSelector, Slider, ImageThumbnail } from '../shared';
import { GripVertical, X, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles } from 'lucide-react';

interface IngredientRowProps {
  ingredient: ReferenceConfig;
  index: number;
}

export function IngredientRow({ ingredient, index }: IngredientRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amountMode, setAmountMode] = useState<'percentage' | 'culinary'>('culinary');
  const { updateReference, removeReference, toggleReferenceActive } = useAppStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleStrengthChange = (value: number) => {
    updateReference(ingredient.id, { strength: value });
  };

  const handleTypeChange = (type: NodeType) => {
    updateReference(ingredient.id, { type });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-xl border transition-all relative overflow-hidden group',
        isDragging
          ? 'shadow-xl border-orange-400 z-50'
          : 'border-gray-200 hover:border-orange-200 hover:shadow-md',
        !ingredient.isActive && 'opacity-50'
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: isDragging ? 0 : -1 }}
      layout
    >
      {/* Strength indicator bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-500 origin-top"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: ingredient.strength / 100 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />

      {/* Active shimmer effect */}
      {ingredient.isActive && ingredient.strength > 50 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/30 to-transparent pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      )}

      {/* Compact Row */}
      <div className="flex items-center gap-3 p-3 relative">
        {/* Drag Handle */}
        <motion.button
          className="touch-none text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </motion.button>

        {/* Thumbnail with hover effect */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <ImageThumbnail
            src={ingredient.imageThumbnail}
            alt={ingredient.name}
            size="sm"
            rounded="lg"
          />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {ingredient.name}
            </span>
            <NodeTypeBadge type={ingredient.type} size="sm" showLabel={false} />
            {ingredient.strength >= 80 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-orange-500"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </div>
          <motion.div
            key={ingredient.strength}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-500 italic"
          >
            {getCulinaryTerm(ingredient.strength)}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => toggleReferenceActive(ingredient.id)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              ingredient.isActive
                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={ingredient.isActive ? 'Hide ingredient' : 'Show ingredient'}
          >
            {ingredient.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => removeReference(ingredient.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
              {/* Type Selector */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Influence Type
                </label>
                <NodeTypeSelector
                  value={ingredient.type}
                  onChange={handleTypeChange}
                  showDescriptions
                />
              </motion.div>

              {/* Amount Control */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <motion.button
                    onClick={() => setAmountMode(amountMode === 'percentage' ? 'culinary' : 'percentage')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {amountMode === 'percentage' ? 'Use terms' : 'Use %'}
                  </motion.button>
                </div>

                {amountMode === 'percentage' ? (
                  <Slider
                    value={ingredient.strength}
                    onChange={handleStrengthChange}
                    showValue
                    color="#f97316"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {culinaryTerms.map((term, idx) => {
                      const isActive = ingredient.strength >= term.min && ingredient.strength <= term.max;
                      return (
                        <motion.button
                          key={term.term}
                          onClick={() => handleStrengthChange(term.midpoint)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors relative overflow-hidden',
                            isActive
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400"
                              layoutId="activeTermBg"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{term.term}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={ingredient.notes || ''}
                  onChange={(e) => updateReference(ingredient.id, { notes: e.target.value })}
                  placeholder="Add notes about this ingredient..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
