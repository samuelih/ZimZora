import React, { useState } from 'react';
import { LibraryImage, NodeType, BlendMode } from '../../types';
import { useAppStore, nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { ImageUploadZone, NodeTypeSelector, ImageThumbnail, Button } from '../shared';
import { X } from 'lucide-react';

interface AddLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (image: LibraryImage, type: NodeType) => void;
}

const blendModes: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
];

export function AddLayerModal({ isOpen, onClose, onAdd }: AddLayerModalProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload');
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);
  const [selectedType, setSelectedType] = useState<NodeType>(NodeType.STYLE);
  const [selectedBlendMode, setSelectedBlendMode] = useState<BlendMode>('normal');
  const { library } = useAppStore();

  if (!isOpen) return null;

  const handleImageSelect = (image: LibraryImage) => {
    setSelectedImage(image);
    setSelectedType(image.suggestedType || NodeType.STYLE);
    setStep('configure');
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onAdd(selectedImage, selectedType);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedImage(null);
    setSelectedType(NodeType.STYLE);
    setSelectedBlendMode('normal');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">
            {step === 'upload' ? 'Add Layer' : 'Configure Layer'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 'upload' ? (
            <div className="space-y-6">
              {/* Upload Zone */}
              <ImageUploadZone
                onUpload={handleImageSelect}
                variant="default"
                className="bg-gray-700/50 border-gray-600 hover:border-gray-500"
              />

              {/* Library */}
              {library.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Or choose from library
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {library.map(image => (
                      <button
                        key={image.id}
                        onClick={() => handleImageSelect(image)}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-700 hover:ring-2 hover:ring-primary-500 transition-all"
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Image Preview */}
              {selectedImage && (
                <div className="flex items-start gap-4">
                  <ImageThumbnail
                    src={selectedImage.thumbnail}
                    alt={selectedImage.name}
                    size="lg"
                    rounded="lg"
                  />
                  <div>
                    <h3 className="font-medium text-gray-100">{selectedImage.name}</h3>
                    <button
                      onClick={() => setStep('upload')}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Layer Type
                </label>
                <NodeTypeSelector
                  value={selectedType}
                  onChange={setSelectedType}
                  showDescriptions
                />
              </div>

              {/* Blend Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Blend Mode
                </label>
                <select
                  value={selectedBlendMode}
                  onChange={(e) => setSelectedBlendMode(e.target.value as BlendMode)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {blendModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Info */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="text-sm text-gray-300">
                  <strong className="text-gray-100">{nodeTypes[selectedType].label}:</strong>{' '}
                  {nodeTypes[selectedType].description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-800/50">
            <Button
              variant="ghost"
              onClick={() => setStep('upload')}
              className="text-gray-300 hover:text-gray-100"
            >
              Back
            </Button>
            <Button onClick={handleConfirm}>
              Add Layer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
