import React, { useState } from 'react';
import { MainImage, ReferenceConfig, LibraryImage } from '../../types';
import { cn, readFileAsDataUrl, generateThumbnail, generateId } from '../../utils/helpers';
import { ZoomIn, ZoomOut, Maximize2, Grid, Upload } from 'lucide-react';

interface PreviewAreaProps {
  mainImage: MainImage | null;
  layers: ReferenceConfig[];
  onSetMainImage: (image: LibraryImage) => void;
  className?: string;
}

export function PreviewArea({
  mainImage,
  layers,
  onSetMainImage,
  className,
}: PreviewAreaProps) {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.25, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.25, 0.25));
  const handleFit = () => setZoom(1);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const src = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });
        onSetMainImage({
          id: generateId(),
          src,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date(),
        });
      }
    };
    input.click();
  };

  const visibleLayers = layers.filter(l => l.isActive);

  return (
    <div className={cn('flex flex-col bg-gray-900', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Fit to view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              'p-1.5 rounded transition-colors',
              showGrid
                ? 'bg-gray-700 text-gray-200'
                : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            )}
            title="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        className={cn(
          'flex-1 overflow-auto relative',
          showGrid && 'bg-[length:20px_20px] bg-[image:linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)]'
        )}
        style={{ backgroundColor: '#1f2937' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {mainImage ? (
            <div
              className="relative shadow-2xl"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Base Image */}
              <img
                src={mainImage.src}
                alt={mainImage.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />

              {/* Layer Overlays (visual representation) */}
              {visibleLayers.map((layer, index) => (
                <div
                  key={layer.id}
                  className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
                  style={{
                    opacity: layer.strength / 100,
                    mixBlendMode: layer.blendMode || 'normal',
                  }}
                >
                  <img
                    src={layer.imageSrc}
                    alt={layer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
              onClick={handleUpload}
            >
              <Upload className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-400 text-center">
                Upload a base image to get started
              </p>
              <p className="text-gray-500 text-sm text-center mt-2">
                Click or drag and drop
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
        <span>
          {mainImage
            ? `${mainImage.name} • ${visibleLayers.length} layer${visibleLayers.length !== 1 ? 's' : ''} visible`
            : 'No base image'}
        </span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
