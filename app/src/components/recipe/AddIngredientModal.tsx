import React, { useState } from 'react';
import { LibraryImage, NodeType } from '../../types';
import { useAppStore, nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { ImageUploadZone, NodeTypeSelector, ImageThumbnail, Button } from '../shared';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (image: LibraryImage, type: NodeType) => void;
}

export function AddIngredientModal({ isOpen, onClose, onAdd }: AddIngredientModalProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload');
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);
  const [selectedType, setSelectedType] = useState<NodeType>(NodeType.STYLE);
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 'upload' ? 'Add Ingredient' : 'Configure Ingredient'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
              />

              {/* Library */}
              {library.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Or choose from library
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {library.map(image => (
                      <button
                        key={image.id}
                        onClick={() => handleImageSelect(image)}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all"
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
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
                    <h3 className="font-medium text-gray-900">{selectedImage.name}</h3>
                    <button
                      onClick={() => setStep('upload')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What does this image contribute?
                </label>
                <NodeTypeSelector
                  value={selectedType}
                  onChange={setSelectedType}
                  showDescriptions
                />
              </div>

              {/* Type Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900">{nodeTypes[selectedType].label}:</strong>{' '}
                  {nodeTypes[selectedType].description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <Button variant="ghost" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button onClick={handleConfirm}>
              Add to Recipe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
