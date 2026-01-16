import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReferenceConfig, BlendMode } from '../../types';
import { useAppStore, nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { Eye, EyeOff, Lock, Unlock, MoreVertical, GripVertical, Trash2 } from 'lucide-react';

interface LayerRowProps {
  layer: ReferenceConfig;
  isSelected: boolean;
  onSelect: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const blendModes: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
];

export function LayerRow({ layer, isSelected, onSelect, isFirst, isLast }: LayerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [isLocked, setIsLocked] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const { updateReference, toggleReferenceActive, removeReference } = useAppStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeMeta = nodeTypes[layer.type];

  const handleNameSubmit = () => {
    if (editName.trim()) {
      updateReference(layer.id, { name: editName.trim() });
    } else {
      setEditName(layer.name);
    }
    setIsEditing(false);
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateReference(layer.id, { strength: Number(e.target.value) });
  };

  const handleBlendModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReference(layer.id, { blendMode: e.target.value as BlendMode });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative mx-2 rounded-lg transition-all',
        isDragging && 'z-50 shadow-xl',
        isSelected
          ? 'bg-primary-900/30 ring-1 ring-primary-500/50'
          : 'hover:bg-gray-700/30',
        !layer.isActive && 'opacity-40'
      )}
      onClick={onSelect}
      layout
    >
      {/* Color indicator bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all"
        style={{ backgroundColor: typeMeta.color }}
      />

      <div className="flex items-center gap-2 pl-3 pr-2 py-2">
        {/* Drag Handle */}
        <button
          className={cn(
            'touch-none text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors',
            'opacity-0 group-hover:opacity-100',
            isSelected && 'opacity-100'
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Visibility Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleReferenceActive(layer.id);
          }}
          className={cn(
            'p-1 rounded transition-colors',
            layer.isActive
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-400 hover:bg-gray-700'
          )}
          title={layer.isActive ? 'Hide layer' : 'Show layer'}
        >
          {layer.isActive ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLocked(!isLocked);
          }}
          className={cn(
            'p-1 rounded transition-colors opacity-0 group-hover:opacity-100',
            isLocked
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-gray-600 hover:text-gray-400 hover:bg-gray-700'
          )}
          title={isLocked ? 'Unlock layer' : 'Lock layer'}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Thumbnail */}
        <div
          className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative"
          style={{
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: typeMeta.color + '80',
          }}
        >
          <img
            src={layer.imageThumbnail}
            alt={layer.name}
            className="w-full h-full object-cover"
          />
          {/* Blend mode indicator */}
          {layer.blendMode && layer.blendMode !== 'normal' && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-white/70 py-0.5">
              {layer.blendMode}
            </div>
          )}
        </div>

        {/* Layer Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setEditName(layer.name);
                  setIsEditing(false);
                }
              }}
              className="w-full px-1 py-0.5 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="text-sm text-gray-200 truncate cursor-text hover:text-white transition-colors"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {layer.name}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span style={{ color: typeMeta.color }}>{typeMeta.shortLabel}</span>
            <span>·</span>
            <span>{layer.blendMode || 'Normal'}</span>
          </div>
        </div>

        {/* Inline Opacity Control */}
        <div
          className="relative w-16"
          onMouseEnter={() => setShowOpacitySlider(true)}
          onMouseLeave={() => setShowOpacitySlider(false)}
        >
          <div className="text-xs text-gray-400 text-right cursor-pointer hover:text-white transition-colors">
            {layer.strength}%
          </div>

          {/* Opacity Popup Slider */}
          <AnimatePresence>
            {showOpacitySlider && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="absolute right-0 top-full mt-1 z-20 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 w-12">Opacity</span>
                  <span className="text-xs text-gray-200 w-8 text-right">{layer.strength}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.strength}
                  onChange={handleOpacityChange}
                  className="w-32 h-1.5 bg-gray-600 rounded appearance-none cursor-pointer accent-primary-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded Controls (when selected) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Opacity Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-14">Opacity</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.strength}
                    onChange={handleOpacityChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1.5 bg-gray-600 rounded appearance-none cursor-pointer accent-primary-500"
                  />
                  {/* Track fill */}
                  <div
                    className="absolute top-0 left-0 h-1.5 bg-primary-500 rounded pointer-events-none"
                    style={{ width: `${layer.strength}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300 w-10 text-right">{layer.strength}%</span>
              </div>

              {/* Blend Mode */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-14">Blend</span>
                <select
                  value={layer.blendMode || 'normal'}
                  onChange={handleBlendModeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-xs bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  {blendModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Blend Mode Presets */}
              <div className="flex flex-wrap gap-1">
                {['normal', 'multiply', 'screen', 'overlay'].map((mode) => (
                  <button
                    key={mode}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateReference(layer.id, { blendMode: mode as BlendMode });
                    }}
                    className={cn(
                      'px-2 py-0.5 text-[10px] rounded transition-colors capitalize',
                      layer.blendMode === mode
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-14 mt-1.5">Notes</span>
                <input
                  type="text"
                  value={layer.notes || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateReference(layer.id, { notes: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add notes..."
                  className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
