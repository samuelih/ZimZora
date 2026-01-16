import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../store';
import { cn } from '../../utils/helpers';
import { Button, GenerationOverlay } from '../shared';
import { Sidebar } from './Sidebar';
import { CanvasWorkspace } from './CanvasWorkspace';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasTransform, Position, LibraryImage, NodeType } from '../../types';
import { Download, RotateCcw, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react';

export function CanvasSidebarUI() {
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const [nodePositions, setNodePositions] = useState<Record<string, Position>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  const {
    mainImage,
    references,
    library,
    generation,
    setMainImage,
    addToLibrary,
    addReference,
    updateReference,
    removeReference,
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
    a.download = 'canvas-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNodeDrop = useCallback((image: LibraryImage, position: Position) => {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    addReference({
      imageId: image.id,
      imageSrc: image.src,
      imageThumbnail: image.thumbnail,
      name: image.name,
      type: image.suggestedType || NodeType.STYLE,
      strength: 75,
      isActive: true,
    });

    // Store node position
    setNodePositions(prev => ({
      ...prev,
      [references.length]: position, // Use index since we don't have the ID yet
    }));
  }, [addReference, references.length]);

  const handleNodeMove = useCallback((id: string, position: Position) => {
    setNodePositions(prev => ({
      ...prev,
      [id]: position,
    }));
  }, []);

  const handleNodeSelect = useCallback((id: string | null) => {
    setSelectedNodeId(id);
    setShowProperties(id !== null);
  }, []);

  const selectedNode = selectedNodeId
    ? references.find(r => r.id === selectedNodeId)
    : null;

  const activeReferences = references.filter(r => r.isActive);
  const canGenerate = mainImage && activeReferences.length > 0;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Canvas Mode</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
          <Button
            onClick={startGeneration}
            disabled={!canGenerate}
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          images={library}
          onUpload={(image) => {
            addToLibrary(image);
          }}
          onImageDragStart={() => {}}
          onSetMainImage={(image) => {
            setMainImage({
              id: image.id,
              src: image.src,
              thumbnail: image.thumbnail,
              name: image.name,
            });
          }}
          mainImage={mainImage}
        />

        {/* Canvas */}
        <CanvasWorkspace
          transform={transform}
          onTransformChange={setTransform}
          mainImage={mainImage}
          references={references}
          nodePositions={nodePositions}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          onNodeMove={handleNodeMove}
          onNodeDrop={handleNodeDrop}
          onNodeDelete={removeReference}
          className="flex-1"
        />

        {/* Properties Panel */}
        {showProperties && selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onUpdate={(updates) => {
              if (selectedNodeId) {
                updateReference(selectedNodeId, updates);
              }
            }}
            onClose={() => {
              setShowProperties(false);
              setSelectedNodeId(null);
            }}
            onDelete={() => {
              if (selectedNodeId) {
                removeReference(selectedNodeId);
                setShowProperties(false);
                setSelectedNodeId(null);
              }
            }}
          />
        )}
      </div>

      {/* Generation Overlay */}
      <GenerationOverlay
        state={generation}
        onCancel={cancelGeneration}
        onClose={resetGeneration}
      />
    </div>
  );
}
