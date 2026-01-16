import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '../../store';
import { cn, generateId, readFileAsDataUrl, generateThumbnail } from '../../utils/helpers';
import { Button, GenerationOverlay } from '../shared';
import { NodeLibrary, NodeTemplate, nodeTemplates } from './NodeLibrary';
import { GraphPropertiesPanel } from './GraphPropertiesPanel';
import ImageInputNode from './nodes/ImageInputNode';
import ProcessorNode from './nodes/ProcessorNode';
import OutputNode from './nodes/OutputNode';
import { Download, RotateCcw, Sparkles, PanelLeftClose, PanelRightClose } from 'lucide-react';

// Custom node types
const nodeTypes = {
  'image-input': ImageInputNode,
  'style-transfer': ProcessorNode,
  'color-blend': ProcessorNode,
  'mask-region': ProcessorNode,
  'combine': ProcessorNode,
  'lighting-match': ProcessorNode,
  'pose-match': ProcessorNode,
  'texture-apply': ProcessorNode,
  'face-swap': ProcessorNode,
  'depth-match': ProcessorNode,
  'output': OutputNode,
};

// Default processor configurations
const processorConfigs: Record<string, { inputs: any[]; outputs: any[]; parameters: any[] }> = {
  'style-transfer': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'style', label: 'Style', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'strength', label: 'Strength', type: 'number', value: 75, min: 0, max: 100 },
      { key: 'preserveColor', label: 'Preserve Colors', type: 'boolean', value: false },
    ],
  },
  'color-blend': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'colors', label: 'Colors', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'strength', label: 'Strength', type: 'number', value: 50, min: 0, max: 100 },
      {
        key: 'mode',
        label: 'Blend Mode',
        type: 'select',
        value: 'normal',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'multiply', label: 'Multiply' },
          { value: 'overlay', label: 'Overlay' },
        ],
      },
    ],
  },
  'mask-region': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'mask', label: 'Mask', type: 'mask' },
    ],
    outputs: [
      { id: 'masked', label: 'Masked', type: 'image' },
      { id: 'mask', label: 'Mask', type: 'mask' },
    ],
    parameters: [
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        value: 'all',
        options: [
          { value: 'all', label: 'Entire Image' },
          { value: 'foreground', label: 'Foreground' },
          { value: 'background', label: 'Background' },
        ],
      },
      { key: 'feather', label: 'Feather', type: 'number', value: 10, min: 0, max: 100 },
    ],
  },
  'combine': {
    inputs: [
      { id: 'base', label: 'Base', type: 'image' },
      { id: 'input1', label: 'Input 1', type: 'image' },
      { id: 'input2', label: 'Input 2', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      {
        key: 'mode',
        label: 'Combine Mode',
        type: 'select',
        value: 'blend',
        options: [
          { value: 'blend', label: 'Blend' },
          { value: 'stack', label: 'Stack' },
          { value: 'mix', label: 'Mix' },
        ],
      },
    ],
  },
  'lighting-match': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'lighting', label: 'Lighting', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'intensity', label: 'Intensity', type: 'number', value: 75, min: 0, max: 100 },
    ],
  },
  'pose-match': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'pose', label: 'Pose', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'fidelity', label: 'Fidelity', type: 'number', value: 80, min: 0, max: 100 },
    ],
  },
  'texture-apply': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'texture', label: 'Texture', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'scale', label: 'Scale', type: 'number', value: 50, min: 0, max: 100 },
    ],
  },
  'face-swap': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'face', label: 'Face', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'blend', label: 'Blend', type: 'number', value: 90, min: 0, max: 100 },
    ],
  },
  'depth-match': {
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'depth', label: 'Depth', type: 'image' },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'image' }],
    parameters: [
      { key: 'strength', label: 'Strength', type: 'number', value: 70, min: 0, max: 100 },
    ],
  },
};

// Initial nodes
const initialNodes: Node[] = [
  {
    id: 'output-1',
    type: 'output',
    position: { x: 600, y: 200 },
    data: { label: 'Final Output' },
  },
];

const initialEdges: Edge[] = [];

export function NodeGraphUI() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  const {
    generation,
    startGeneration,
    cancelGeneration,
    resetGeneration,
    reset: resetStore,
  } = useAppStore();

  // Handle file upload for image input nodes
  const handleImageSelect = useCallback(async (nodeId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const src = await readFileAsDataUrl(file);
      const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });

      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  imageSrc: src,
                  imageThumbnail: thumbnail,
                },
              }
            : node
        )
      );
    };
    input.click();
  }, [setNodes]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Add new node from library
  const handleAddNode = useCallback(
    (template: NodeTemplate) => {
      const id = generateId();
      const position = {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      };

      let newNode: Node;

      if (template.type === 'image-input') {
        newNode = {
          id,
          type: template.type,
          position,
          data: {
            label: template.label,
            onImageSelect: () => handleImageSelect(id),
          },
        };
      } else if (template.type === 'output') {
        newNode = {
          id,
          type: template.type,
          position,
          data: {
            label: template.label,
            onGenerate: startGeneration,
            isGenerating: generation.status === 'generating' || generation.status === 'preparing',
            progress: generation.progress,
          },
        };
      } else {
        const config = processorConfigs[template.type] || {
          inputs: [{ id: 'image', label: 'Image', type: 'image' }],
          outputs: [{ id: 'result', label: 'Result', type: 'image' }],
          parameters: [],
        };

        newNode = {
          id,
          type: template.type,
          position,
          data: {
            label: template.label,
            processorType: template.type,
            ...config,
            onParameterChange: (key: string, value: any) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          parameters: n.data.parameters.map((p: any) =>
                            p.key === key ? { ...p, value } : p
                          ),
                        },
                      }
                    : n
                )
              );
            },
          },
        };
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, handleImageSelect, startGeneration, generation]
  );

  // Update node data
  const handleUpdateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
      );
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedNodeId(null);
    },
    [setNodes, setEdges]
  );

  // Duplicate node
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const newId = generateId();
      const newNode: Node = {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: { ...node.data },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes]
  );

  // Export configuration
  const handleExport = useCallback(() => {
    const config = { nodes, edges };
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'node-graph-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Reset
  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    resetStore();
  }, [setNodes, setEdges, resetStore]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Check if we can generate (at least one input connected to output)
  const canGenerate = useMemo(() => {
    const hasConnectedOutput = edges.some(
      (e) => nodes.find((n) => n.id === e.target)?.type === 'output'
    );
    return hasConnectedOutput;
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Node Graph</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showLibrary ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              )}
              title={showLibrary ? 'Hide Library' : 'Show Library'}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowProperties(!showProperties)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showProperties ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              )}
              title={showProperties ? 'Hide Properties' : 'Show Properties'}
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
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
        {/* Node Library */}
        {showLibrary && <NodeLibrary onAddNode={handleAddNode} />}

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#334155"
            />
            <Controls className="!bg-slate-800 !border-slate-700 !shadow-lg" />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'output') return '#10b981';
                if (node.type === 'image-input') return '#3b82f6';
                return '#8b5cf6';
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
              className="!bg-slate-800 !border-slate-700"
            />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <GraphPropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onClose={() => setSelectedNodeId(null)}
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
