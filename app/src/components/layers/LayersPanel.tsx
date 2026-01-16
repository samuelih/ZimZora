import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '../../store';
import { ReferenceConfig, MainImage } from '../../types';
import { cn } from '../../utils/helpers';
import { LayerRow } from './LayerRow';
import { BaseLayerRow } from './BaseLayerRow';
import { EmptyState } from '../shared';
import {
  Plus,
  Layers,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  FolderPlus,
  MoreHorizontal
} from 'lucide-react';

interface LayersPanelProps {
  layers: ReferenceConfig[];
  baseImage: MainImage | null;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddLayer: () => void;
}

export function LayersPanel({
  layers,
  baseImage,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
}: LayersPanelProps) {
  const { reorderReferences, removeReference } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex(l => l.id === active.id);
      const newIndex = layers.findIndex(l => l.id === over.id);
      reorderReferences(oldIndex, newIndex);
    }
  };

  const handleMoveUp = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index < layers.length - 1) {
      reorderReferences(index, index + 1);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index > 0) {
      reorderReferences(index, index - 1);
    }
  };

  const handleDuplicate = (layer: ReferenceConfig) => {
    const { addReference } = useAppStore.getState();
    addReference({
      ...layer,
      name: `${layer.name} copy`,
    });
  };

  // Reverse layers for display (top = highest in stack)
  const displayLayers = [...layers].reverse();

  const selectedLayer = selectedLayerId && selectedLayerId !== 'base'
    ? layers.find(l => l.id === selectedLayerId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          <Layers className="w-4 h-4 text-primary-400" />
          <span>Layers</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">
            {layers.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            onClick={onAddLayer}
            className="p-1.5 rounded-lg bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 hover:text-primary-300 transition-colors"
            title="Add layer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Layer Actions Bar */}
      <AnimatePresence>
        {selectedLayer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-800/50">
              <button
                onClick={() => handleMoveUp(selectedLayer.id)}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                title="Move up"
                disabled={displayLayers[0]?.id === selectedLayer.id}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMoveDown(selectedLayer.id)}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                title="Move down"
                disabled={displayLayers[displayLayers.length - 1]?.id === selectedLayer.id}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <button
                onClick={() => handleDuplicate(selectedLayer)}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                title="Duplicate layer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  removeReference(selectedLayer.id);
                  onSelectLayer(null);
                }}
                className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete layer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto dark-scrollbar">
        {layers.length === 0 ? (
          <div className="p-4">
            <EmptyState
              type="layers"
              isDark={true}
              onAction={onAddLayer}
            />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayLayers.map(l => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="py-2">
                <AnimatePresence>
                  {displayLayers.map((layer, index) => (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <LayerRow
                        layer={layer}
                        isSelected={selectedLayerId === layer.id}
                        onSelect={() => onSelectLayer(layer.id)}
                        isFirst={index === 0}
                        isLast={index === displayLayers.length - 1}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Base Layer (always at bottom, not sortable) */}
        <div className="border-t border-gray-700 mt-2 pt-2 mx-2">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            Background
          </div>
          <BaseLayerRow
            image={baseImage}
            isSelected={selectedLayerId === 'base'}
            onSelect={() => onSelectLayer('base')}
          />
        </div>
      </div>

      {/* Footer with blend mode preview */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {layers.length} layer{layers.length !== 1 ? 's' : ''} + base
          </span>
          {selectedLayer && (
            <span className="text-gray-400">
              {selectedLayer.blendMode || 'Normal'} · {selectedLayer.strength}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
