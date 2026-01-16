import React from 'react';
import { ReferenceConfig, NodeType, BlendMode } from '../../types';
import { nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { Button, Slider, NodeTypeSelector, ImageThumbnail } from '../shared';
import { X, Trash2, Eye, EyeOff } from 'lucide-react';

interface PropertiesPanelProps {
  node: ReferenceConfig;
  onUpdate: (updates: Partial<ReferenceConfig>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function PropertiesPanel({
  node,
  onUpdate,
  onClose,
  onDelete,
}: PropertiesPanelProps) {
  const typeMeta = nodeTypes[node.type];

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Properties</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Preview */}
        <div className="flex items-start gap-3">
          <ImageThumbnail
            src={node.imageThumbnail}
            alt={node.name}
            size="lg"
            rounded="lg"
            border
          />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={node.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full font-medium text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-0 py-1"
            />
            <p className="text-sm text-gray-500">{typeMeta.label}</p>
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Visible</span>
          <button
            onClick={() => onUpdate({ isActive: !node.isActive })}
            className={cn(
              'p-2 rounded-lg transition-colors',
              node.isActive
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            {node.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Influence Type
          </label>
          <NodeTypeSelector
            value={node.type}
            onChange={(type) => onUpdate({ type })}
            showDescriptions
          />
        </div>

        {/* Strength */}
        <div>
          <Slider
            value={node.strength}
            onChange={(strength) => onUpdate({ strength })}
            label="Influence Strength"
            color={typeMeta.color}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={node.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes about this reference..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="danger"
          size="sm"
          fullWidth
          onClick={onDelete}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Delete Reference
        </Button>
      </div>
    </div>
  );
}
