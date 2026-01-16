import React from 'react';
import { MainImage } from '../../types';
import { cn } from '../../utils/helpers';
import { Lock, Image as ImageIcon } from 'lucide-react';

interface BaseLayerRowProps {
  image: MainImage | null;
  isSelected: boolean;
  onSelect: () => void;
}

export function BaseLayerRow({ image, isSelected, onSelect }: BaseLayerRowProps) {
  return (
    <div
      className={cn(
        'mx-2 rounded cursor-pointer transition-all',
        isSelected ? 'bg-primary-900/30' : 'hover:bg-gray-700/50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        {/* Lock Icon */}
        <div className="p-1 text-gray-500">
          <Lock className="w-4 h-4" />
        </div>

        {/* Thumbnail */}
        <div className="w-8 h-8 rounded bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-gray-600">
          {image ? (
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>

        {/* Layer Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-300 truncate">
            {image?.name || 'Background'}
          </div>
          <div className="text-xs text-gray-500">Base Layer</div>
        </div>

        {/* Opacity (always 100%) */}
        <div className="w-12 text-right">
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>

      {/* Info when selected */}
      {isSelected && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-500">
            The base layer is locked and cannot be reordered.
          </p>
          {!image && (
            <p className="text-xs text-gray-400 mt-1">
              Upload a main image to set the base layer.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
