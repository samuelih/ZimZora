import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../store';
import { PolarPosition, LibraryImage, NodeType } from '../../types';
import { cn } from '../../utils/helpers';
import { Button, GenerationOverlay } from '../shared';
import { OrbitalCanvas } from './OrbitalCanvas';
import { NodeDetailPanel } from './NodeDetailPanel';
import { UploadArea } from './UploadArea';
import { Download, RotateCcw, Sparkles, Plus } from 'lucide-react';

export function RadialOrbitalUI() {
  const [nodePositions, setNodePositions] = useState<Record<string, PolarPosition>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
    a.download = 'orbital-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNodeMove = useCallback((id: string, position: PolarPosition) => {
    setNodePositions(prev => ({
      ...prev,
      [id]: position,
    }));
    // Update strength based on distance (closer = stronger)
    const strength = Math.round((1 - position.distance) * 100);
    updateReference(id, { strength });
  }, [updateReference]);

  const handleNodeSelect = useCallback((id: string | null) => {
    setSelectedNodeId(id);
    setShowDetailPanel(id !== null);
  }, []);

  const handleAddNode = useCallback((image: LibraryImage) => {
    addToLibrary(image);

    // Find available position
    const existingAngles = Object.values(nodePositions).map(p => p.angle);
    let angle = 0;
    if (existingAngles.length > 0) {
      // Find the largest gap
      const sortedAngles = [...existingAngles].sort((a, b) => a - b);
      let maxGap = 0;
      let gapStart = 0;
      for (let i = 0; i < sortedAngles.length; i++) {
        const next = sortedAngles[(i + 1) % sortedAngles.length];
        const current = sortedAngles[i];
        let gap = next - current;
        if (gap < 0) gap += 360;
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = current;
        }
      }
      angle = (gapStart + maxGap / 2) % 360;
    }

    addReference({
      imageId: image.id,
      imageSrc: image.src,
      imageThumbnail: image.thumbnail,
      name: image.name,
      type: image.suggestedType || NodeType.STYLE,
      strength: 50,
      isActive: true,
    });

    // Set position for new node
    const newId = references.length.toString(); // Approximate
    setNodePositions(prev => ({
      ...prev,
      [newId]: { angle, distance: 0.5 },
    }));
  }, [addToLibrary, addReference, nodePositions, references.length]);

  const getNodePosition = (nodeId: string, index: number): PolarPosition => {
    if (nodePositions[nodeId]) {
      return nodePositions[nodeId];
    }
    // Default positions distributed around the center
    const angle = (index * 360) / Math.max(references.length, 1);
    return { angle, distance: 0.5 };
  };

  const selectedNode = selectedNodeId
    ? references.find(r => r.id === selectedNodeId)
    : null;

  const activeReferences = references.filter(r => r.isActive);
  const canGenerate = mainImage && activeReferences.length > 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Orbital Mode</h1>
          <span className="text-sm text-white/60">
            Distance from center = influence strength
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-white/70 hover:text-white hover:bg-white/10"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-white/70 hover:text-white hover:bg-white/10"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
          <Button
            onClick={startGeneration}
            disabled={!canGenerate}
            size="sm"
            className="bg-primary-500 hover:bg-primary-600"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Orbital Canvas */}
        <OrbitalCanvas
          mainImage={mainImage}
          references={references}
          nodePositions={Object.fromEntries(
            references.map((ref, index) => [ref.id, getNodePosition(ref.id, index)])
          )}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          onNodeMove={handleNodeMove}
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

        {/* Detail Panel */}
        {showDetailPanel && selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            position={getNodePosition(selectedNode.id, references.findIndex(r => r.id === selectedNode.id))}
            onUpdate={(updates) => {
              if (selectedNodeId) {
                updateReference(selectedNodeId, updates);
              }
            }}
            onClose={() => {
              setShowDetailPanel(false);
              setSelectedNodeId(null);
            }}
            onDelete={() => {
              if (selectedNodeId) {
                removeReference(selectedNodeId);
                setShowDetailPanel(false);
                setSelectedNodeId(null);
              }
            }}
          />
        )}
      </div>

      {/* Bottom Bar */}
      <div className="px-6 py-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowUploadModal(true)}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Reference
            </Button>
            <span className="text-sm text-white/60">
              {references.length} reference{references.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Zone Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="text-white/60">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <span className="text-white/60">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500/50" />
              <span className="text-white/60">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadArea
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onAdd={handleAddNode}
        library={library}
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
