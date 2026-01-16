import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { cn } from '../../utils/helpers';
import { Button, ImageUploadZone, GenerationOverlay } from '../shared';
import { LayersPanel } from './LayersPanel';
import { PreviewArea } from './PreviewArea';
import { AddLayerModal } from './AddLayerModal';
import { Download, Upload, RotateCcw, Plus, Sparkles } from 'lucide-react';

export function LayersPanelUI() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const {
    mainImage,
    references,
    generation,
    setMainImage,
    addToLibrary,
    addReference,
    startGeneration,
    cancelGeneration,
    resetGeneration,
    exportConfiguration,
    reset
  } = useAppStore();

  const handleExport = () => {
    const json = exportConfiguration();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layers-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeReferences = references.filter(r => r.isActive);
  const canGenerate = mainImage && activeReferences.length > 0;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Layers Panel</h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={startGeneration}
          disabled={!canGenerate}
          size="sm"
          className="bg-primary-600 hover:bg-primary-700"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Generate
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <PreviewArea
          mainImage={mainImage}
          layers={references}
          onSetMainImage={(image) => {
            setMainImage({
              id: image.id,
              src: image.src,
              thumbnail: image.thumbnail,
              name: image.name,
            });
          }}
          className="flex-1"
        />

        {/* Layers Panel */}
        <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
          <LayersPanel
            layers={references}
            baseImage={mainImage}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onAddLayer={() => setShowAddModal(true)}
          />
        </div>
      </div>

      {/* Add Layer Modal */}
      <AddLayerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(image, type) => {
          addToLibrary(image);
          addReference({
            imageId: image.id,
            imageSrc: image.src,
            imageThumbnail: image.thumbnail,
            name: image.name,
            type,
            strength: 100,
            isActive: true,
            blendMode: 'normal',
          });
          setShowAddModal(false);
        }}
      />

      {/* Generation Overlay */}
      <GenerationOverlay
        state={generation}
        onCancel={cancelGeneration}
        onClose={resetGeneration}
      />
    </div>
  );
}
