import React, { useState, useCallback } from 'react';
import { LibraryImage, NodeType } from '../../types';
import { nodeTypes } from '../../store';
import { cn, readFileAsDataUrl, generateThumbnail, generateId } from '../../utils/helpers';
import { Button, NodeTypeSelector, ImageThumbnail } from '../shared';
import { X, Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface UploadAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (image: LibraryImage) => void;
  library: LibraryImage[];
}

export function UploadArea({
  isOpen,
  onClose,
  onAdd,
  library,
}: UploadAreaProps) {
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);
  const [suggestedType, setSuggestedType] = useState<NodeType>(NodeType.STYLE);

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      for (const file of files) {
        const src = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });
        const image: LibraryImage = {
          id: generateId(),
          src,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date(),
          suggestedType,
        };
        onAdd(image);
      }
      onClose();
    };
    input.click();
  };

  const handleLibrarySelect = (image: LibraryImage) => {
    const imageWithType: LibraryImage = {
      ...image,
      suggestedType,
    };
    onAdd(imageWithType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add Reference to Orbit</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Reference Type
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nodeTypes).map(([type, meta]) => (
                <button
                  key={type}
                  onClick={() => setSuggestedType(type as NodeType)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    suggestedType === type
                      ? 'text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                  style={{
                    backgroundColor: suggestedType === type ? meta.color : undefined,
                  }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onClick={handleFileUpload}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all mb-6"
          >
            <Upload className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <p className="text-white font-medium mb-1">Upload new image</p>
            <p className="text-sm text-white/50">Click to browse or drag and drop</p>
          </div>

          {/* Library */}
          {library.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Or select from library
              </label>
              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto">
                {library.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleLibrarySelect(image)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 transition-all group'
                    )}
                  >
                    <img
                      src={image.thumbnail}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end">
          <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
