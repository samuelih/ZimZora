import React from 'react';
import { ReferenceConfig, PolarPosition } from '../../types';
import { nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { Button, Slider, NodeTypeSelector, ImageThumbnail } from '../shared';
import { X, Trash2, Eye, EyeOff, Move } from 'lucide-react';

interface NodeDetailPanelProps {
  node: ReferenceConfig;
  position: PolarPosition;
  onUpdate: (updates: Partial<ReferenceConfig>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function NodeDetailPanel({
  node,
  position,
  onUpdate,
  onClose,
  onDelete,
}: NodeDetailPanelProps) {
  const typeMeta = nodeTypes[node.type];
  const strengthFromDistance = Math.round((1 - position.distance) * 100);

  return (
    <div className="w-80 bg-slate-900/95 backdrop-blur-sm border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold text-white">Node Details</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Preview */}
        <div className="flex items-start gap-3">
          <div
            className="w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: typeMeta.color }}
          >
            <img
              src={node.imageThumbnail}
              alt={node.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={node.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full font-medium text-white bg-transparent border-0 border-b border-transparent hover:border-white/30 focus:border-primary-500 focus:outline-none px-0 py-1"
            />
            <p className="text-sm text-white/50">{typeMeta.label}</p>
          </div>
        </div>

        {/* Position Info */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Move className="w-4 h-4" />
            <span>Position</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase">Distance</label>
              <p className="text-white font-mono">{Math.round(position.distance * 100)}%</p>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Angle</label>
              <p className="text-white font-mono">{Math.round(position.angle)}°</p>
            </div>
          </div>
          <p className="text-xs text-white/40">
            Computed strength from distance: <span className="text-primary-400">{strengthFromDistance}%</span>
          </p>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">Visible</span>
          <button
            onClick={() => onUpdate({ isActive: !node.isActive })}
            className={cn(
              'p-2 rounded-lg transition-colors',
              node.isActive
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-white/5 text-white/40'
            )}
          >
            {node.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Influence Type
          </label>
          <NodeTypeSelector
            value={node.type}
            onChange={(type) => onUpdate({ type })}
            showDescriptions
            variant="dark"
          />
        </div>

        {/* Manual Strength Override */}
        <div>
          <Slider
            value={node.strength}
            onChange={(strength) => onUpdate({ strength })}
            label="Strength Override"
            color={typeMeta.color}
            variant="dark"
          />
          <p className="text-xs text-white/40 mt-1">
            Manual override. Move node to change position-based strength.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Notes
          </label>
          <textarea
            value={node.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes about this reference..."
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg resize-none text-white placeholder-white/30 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="danger"
          size="sm"
          fullWidth
          onClick={onDelete}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Remove from Orbit
        </Button>
      </div>
    </div>
  );
}
