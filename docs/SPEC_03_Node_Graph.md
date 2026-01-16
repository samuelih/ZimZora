# Blender-Style Node Graph Technical Specification

## Overview

The Node Graph paradigm provides a full node-graph editor similar to Blender, ComfyUI, or Unreal Blueprints. Users explicitly wire connections between nodes, with each node representing either a source image or a processing operation. This exposes the underlying AI pipeline for maximum control.

---

## Component Architecture

### Component Hierarchy

```
NodeGraphUI
├── NodeCanvas
│   ├── CanvasBackground
│   │   └── GridPattern
│   ├── ConnectionsLayer
│   │   └── Wire[]
│   ├── NodesLayer
│   │   ├── InputNode[]
│   │   ├── ProcessNode[]
│   │   └── OutputNode
│   ├── SelectionBox
│   └── WirePreview (during connection)
├── NodeLibrary
│   ├── LibraryHeader
│   ├── CategoryList
│   │   ├── InputsCategory
│   │   ├── ProcessorsCategory
│   │   └── OutputCategory
│   └── NodeTemplate[]
├── PropertiesPanel
│   ├── NodeHeader
│   ├── InputsList
│   ├── ParameterControls
│   └── OutputsList
├── Toolbar
│   ├── CanvasControls
│   ├── EditActions
│   └── GenerateButton
└── ContextMenu
    ├── AddNodeSubmenu
    ├── EditActions
    └── ViewActions
```

### Component Specifications

#### NodeGraphUI (Root)
```typescript
interface NodeGraphUIProps {
  initialState?: GraphState;
  onStateChange?: (state: GraphState) => void;
}
```

#### NodeCanvas
```typescript
interface NodeCanvasProps {
  transform: CanvasTransform;
  nodes: GraphNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  onTransformChange: (transform: CanvasTransform) => void;
  onNodeSelect: (ids: string[], additive: boolean) => void;
  onNodeMove: (id: string, position: Position) => void;
  onConnectionCreate: (from: SocketRef, to: SocketRef) => void;
  onConnectionDelete: (id: string) => void;
  onContextMenu: (position: Position, target?: GraphNode) => void;
}
```

#### GraphNode (Base)
```typescript
interface GraphNodeProps {
  node: GraphNode;
  isSelected: boolean;
  onSelect: (additive: boolean) => void;
  onDragStart: () => void;
  onDrag: (position: Position) => void;
  onDragEnd: () => void;
  onSocketDragStart: (socket: Socket, isOutput: boolean) => void;
  onCollapse: () => void;
}
```

#### InputNode
```typescript
interface InputNodeProps extends GraphNodeProps {
  node: ImageInputNode;
  onImageChange: (image: LibraryImage) => void;
}
```
- Displays image thumbnail
- Single output socket (Image)
- Image selector/upload

#### ProcessNode
```typescript
interface ProcessNodeProps extends GraphNodeProps {
  node: ProcessorNode;
  onParameterChange: (key: string, value: any) => void;
}
```
- Multiple input sockets
- Multiple output sockets
- Parameter controls on face

#### OutputNode
```typescript
interface OutputNodeProps extends GraphNodeProps {
  node: OutputNode;
  previewImage?: string;
  isGenerating: boolean;
}
```
- Single input socket (Final Image)
- Shows preview of result
- Generate trigger

#### Wire
```typescript
interface WireProps {
  connection: Connection;
  fromPosition: Position;
  toPosition: Position;
  dataType: DataType;
  isSelected: boolean;
  isValid: boolean;
  onSelect: () => void;
}
```
- Bezier curve between sockets
- Color based on data type
- Animated flow indicator

#### Socket
```typescript
interface SocketProps {
  socket: Socket;
  position: 'input' | 'output';
  isConnected: boolean;
  isCompatible: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}
```
- Connection points on nodes
- Type indicator shape/color
- Highlight on compatible drag

#### NodeLibrary
```typescript
interface NodeLibraryProps {
  categories: NodeCategory[];
  onAddNode: (template: NodeTemplate, position?: Position) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}
```

#### ContextMenu
```typescript
interface ContextMenuProps {
  position: Position;
  target?: GraphNode | Connection;
  onAddNode: (template: NodeTemplate) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onClose: () => void;
}
```

---

## State Management

### State Shape

```typescript
interface GraphState {
  // Canvas transform
  transform: CanvasTransform;

  // Graph data
  nodes: GraphNode[];
  connections: Connection[];

  // Selection
  selectedNodeIds: string[];
  selectedConnectionIds: string[];

  // Interaction state
  interaction: {
    mode: 'select' | 'pan' | 'connecting' | 'box-select';
    connectingFrom?: SocketRef;
    boxSelectStart?: Position;
  };

  // Library
  library: LibraryImage[];
  nodeTemplates: NodeTemplate[];

  // UI state
  ui: {
    showLibrary: boolean;
    showProperties: boolean;
    showMinimap: boolean;
    librarySearch: string;
    contextMenu?: {
      position: Position;
      target?: string;
    };
  };

  // History
  history: HistoryState;
}

// Node types
type GraphNode = ImageInputNode | ProcessorNode | OutputNode;

interface BaseNode {
  id: string;
  type: string;
  position: Position;
  size: Size;
  isCollapsed: boolean;
  label: string;
}

interface ImageInputNode extends BaseNode {
  type: 'image-input';
  imageId?: string;
  imageSrc?: string;
  outputs: Socket[];
}

interface ProcessorNode extends BaseNode {
  type: 'processor';
  processorType: ProcessorType;
  inputs: Socket[];
  outputs: Socket[];
  parameters: Record<string, any>;
}

interface OutputNode extends BaseNode {
  type: 'output';
  inputs: Socket[];
  previewSrc?: string;
}

// Socket definition
interface Socket {
  id: string;
  nodeId: string;
  name: string;
  dataType: DataType;
  isRequired: boolean;
  defaultValue?: any;
}

type DataType = 'image' | 'mask' | 'style' | 'number' | 'color';

// Connection definition
interface Connection {
  id: string;
  from: SocketRef;
  to: SocketRef;
  isValid: boolean;
}

interface SocketRef {
  nodeId: string;
  socketId: string;
}

// Processor types
type ProcessorType =
  | 'style-transfer'
  | 'color-blend'
  | 'mask-region'
  | 'combine'
  | 'object-inject'
  | 'lighting-match'
  | 'pose-match'
  | 'texture-apply'
  | 'depth-match'
  | 'face-swap';

// Node template for library
interface NodeTemplate {
  type: string;
  category: 'input' | 'processor' | 'output' | 'utility';
  label: string;
  description: string;
  icon: string;
  defaultSize: Size;
  inputs?: SocketTemplate[];
  outputs?: SocketTemplate[];
  parameters?: ParameterTemplate[];
}

interface SocketTemplate {
  name: string;
  dataType: DataType;
  isRequired: boolean;
  defaultValue?: any;
}

interface ParameterTemplate {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'color';
  defaultValue: any;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}
```

### State Update Patterns

```typescript
type GraphAction =
  // Node actions
  | { type: 'ADD_NODE'; payload: GraphNode }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<GraphNode> } }
  | { type: 'REMOVE_NODES'; payload: string[] }
  | { type: 'MOVE_NODES'; payload: Array<{ id: string; position: Position }> }
  | { type: 'DUPLICATE_NODES'; payload: string[] }

  // Connection actions
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'REMOVE_CONNECTIONS'; payload: string[] }
  | { type: 'VALIDATE_CONNECTIONS' }

  // Selection actions
  | { type: 'SELECT_NODES'; payload: { ids: string[]; additive: boolean } }
  | { type: 'SELECT_CONNECTIONS'; payload: { ids: string[]; additive: boolean } }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'BOX_SELECT'; payload: { bounds: Bounds; additive: boolean } }

  // Canvas actions
  | { type: 'SET_TRANSFORM'; payload: CanvasTransform }
  | { type: 'FIT_TO_VIEW' }

  // Interaction mode
  | { type: 'START_CONNECTING'; payload: SocketRef }
  | { type: 'END_CONNECTING' }
  | { type: 'START_BOX_SELECT'; payload: Position }
  | { type: 'END_BOX_SELECT' }

  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// Connection validation
function validateConnection(
  from: SocketRef,
  to: SocketRef,
  nodes: GraphNode[],
  connections: Connection[]
): { valid: boolean; reason?: string } {
  const fromSocket = findSocket(from, nodes);
  const toSocket = findSocket(to, nodes);

  // Check socket types match
  if (fromSocket.dataType !== toSocket.dataType) {
    return { valid: false, reason: 'Incompatible types' };
  }

  // Check not connecting to same node
  if (from.nodeId === to.nodeId) {
    return { valid: false, reason: 'Cannot connect to same node' };
  }

  // Check for cycles
  if (wouldCreateCycle(from.nodeId, to.nodeId, connections)) {
    return { valid: false, reason: 'Would create cycle' };
  }

  // Check input not already connected (single connection per input)
  const existingConnection = connections.find(
    c => c.to.nodeId === to.nodeId && c.to.socketId === to.socketId
  );
  if (existingConnection) {
    return { valid: false, reason: 'Input already connected' };
  }

  return { valid: true };
}
```

---

## Data Structures

### Node Templates (Built-in)

```typescript
const nodeTemplates: NodeTemplate[] = [
  // Input nodes
  {
    type: 'image-input',
    category: 'input',
    label: 'Image Input',
    description: 'Source image for the pipeline',
    icon: 'image',
    defaultSize: { width: 180, height: 140 },
    outputs: [
      { name: 'Image', dataType: 'image', isRequired: false }
    ]
  },

  // Processor nodes
  {
    type: 'style-transfer',
    category: 'processor',
    label: 'Style Transfer',
    description: 'Apply style from reference image',
    icon: 'palette',
    defaultSize: { width: 200, height: 160 },
    inputs: [
      { name: 'Image', dataType: 'image', isRequired: true },
      { name: 'Style', dataType: 'image', isRequired: true }
    ],
    outputs: [
      { name: 'Result', dataType: 'image', isRequired: false }
    ],
    parameters: [
      {
        key: 'strength',
        label: 'Strength',
        type: 'number',
        defaultValue: 75,
        min: 0,
        max: 100,
        step: 1
      },
      {
        key: 'preserveColor',
        label: 'Preserve Colors',
        type: 'boolean',
        defaultValue: false
      }
    ]
  },

  {
    type: 'color-blend',
    category: 'processor',
    label: 'Color Blend',
    description: 'Blend color palette from reference',
    icon: 'droplet',
    defaultSize: { width: 200, height: 140 },
    inputs: [
      { name: 'Image', dataType: 'image', isRequired: true },
      { name: 'Colors', dataType: 'image', isRequired: true }
    ],
    outputs: [
      { name: 'Result', dataType: 'image', isRequired: false }
    ],
    parameters: [
      {
        key: 'strength',
        label: 'Strength',
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 100
      },
      {
        key: 'mode',
        label: 'Blend Mode',
        type: 'select',
        defaultValue: 'normal',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'multiply', label: 'Multiply' },
          { value: 'overlay', label: 'Overlay' },
          { value: 'soft-light', label: 'Soft Light' }
        ]
      }
    ]
  },

  {
    type: 'mask-region',
    category: 'processor',
    label: 'Mask Region',
    description: 'Apply influence to specific region',
    icon: 'crop',
    defaultSize: { width: 200, height: 180 },
    inputs: [
      { name: 'Image', dataType: 'image', isRequired: true },
      { name: 'Mask', dataType: 'mask', isRequired: false }
    ],
    outputs: [
      { name: 'Masked', dataType: 'image', isRequired: false },
      { name: 'Mask', dataType: 'mask', isRequired: false }
    ],
    parameters: [
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        defaultValue: 'all',
        options: [
          { value: 'all', label: 'Entire Image' },
          { value: 'foreground', label: 'Foreground' },
          { value: 'background', label: 'Background' },
          { value: 'custom', label: 'Custom Mask' }
        ]
      },
      {
        key: 'feather',
        label: 'Feather',
        type: 'number',
        defaultValue: 10,
        min: 0,
        max: 100
      }
    ]
  },

  {
    type: 'combine',
    category: 'processor',
    label: 'Combine',
    description: 'Combine multiple image influences',
    icon: 'layers',
    defaultSize: { width: 200, height: 200 },
    inputs: [
      { name: 'Base', dataType: 'image', isRequired: true },
      { name: 'Input 1', dataType: 'image', isRequired: false },
      { name: 'Input 2', dataType: 'image', isRequired: false },
      { name: 'Input 3', dataType: 'image', isRequired: false }
    ],
    outputs: [
      { name: 'Result', dataType: 'image', isRequired: false }
    ],
    parameters: [
      {
        key: 'mode',
        label: 'Combine Mode',
        type: 'select',
        defaultValue: 'blend',
        options: [
          { value: 'blend', label: 'Blend' },
          { value: 'stack', label: 'Stack' },
          { value: 'mix', label: 'Mix' }
        ]
      }
    ]
  },

  // Output node
  {
    type: 'output',
    category: 'output',
    label: 'Final Output',
    description: 'Final generated image',
    icon: 'export',
    defaultSize: { width: 200, height: 180 },
    inputs: [
      { name: 'Image', dataType: 'image', isRequired: true }
    ]
  }
];
```

### Serialization Format

```typescript
interface GraphConfiguration {
  version: string;
  nodes: Array<{
    id: string;
    type: string;
    position: Position;
    label: string;
    isCollapsed: boolean;
    data: Record<string, any>; // Type-specific data
  }>;
  connections: Array<{
    id: string;
    from: SocketRef;
    to: SocketRef;
  }>;
  canvasTransform: CanvasTransform;
}
```

---

## Interaction Handlers

### Canvas Interactions

```typescript
const canvasHandlers = {
  // Pan canvas
  onMouseDown: (e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      startPan(e);
    } else if (e.button === 0 && !isOverNode(e)) {
      startBoxSelect(e);
    }
  },

  onMouseMove: (e: MouseEvent) => {
    if (isPanning) {
      updatePan(e);
    } else if (isBoxSelecting) {
      updateBoxSelect(e);
    } else if (isConnecting) {
      updateWirePreview(e);
    }
  },

  onMouseUp: (e: MouseEvent) => {
    if (isPanning) {
      endPan();
    } else if (isBoxSelecting) {
      endBoxSelect(e);
    }
  },

  // Zoom
  onWheel: (e: WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAtPoint(e.clientX, e.clientY, zoomFactor);
  },

  // Context menu
  onContextMenu: (e: MouseEvent) => {
    e.preventDefault();
    showContextMenu(screenToCanvas(e), getTargetUnderCursor(e));
  }
};
```

### Node Interactions

```typescript
const nodeHandlers = {
  // Select
  onClick: (nodeId: string, e: MouseEvent) => {
    e.stopPropagation();
    selectNodes([nodeId], e.shiftKey || e.metaKey);
  },

  // Drag
  onDragStart: (nodeId: string, e: MouseEvent) => {
    if (!selectedNodeIds.includes(nodeId)) {
      selectNodes([nodeId], false);
    }
    startNodeDrag(e);
  },

  onDrag: (e: MouseEvent) => {
    const delta = calculateDragDelta(e);
    moveSelectedNodes(delta);
  },

  onDragEnd: () => {
    commitNodePositions();
  },

  // Double-click to collapse/expand
  onDoubleClick: (nodeId: string) => {
    toggleNodeCollapse(nodeId);
  }
};
```

### Connection Interactions

```typescript
const connectionHandlers = {
  // Start from output socket
  onSocketDragStart: (socket: Socket, isOutput: boolean) => {
    if (!isOutput) return; // Can only drag from outputs

    startConnecting({
      nodeId: socket.nodeId,
      socketId: socket.id
    });
  },

  // Hover over input socket
  onSocketDragOver: (socket: Socket, isOutput: boolean) => {
    if (isOutput) return; // Can only drop on inputs

    const validation = validateConnection(
      connectingFrom,
      { nodeId: socket.nodeId, socketId: socket.id },
      nodes,
      connections
    );

    setConnectionPreviewValid(validation.valid);
    setHoverSocket(socket);
  },

  // Drop on input socket
  onSocketDrop: (socket: Socket) => {
    const validation = validateConnection(
      connectingFrom,
      { nodeId: socket.nodeId, socketId: socket.id },
      nodes,
      connections
    );

    if (validation.valid) {
      createConnection(connectingFrom, {
        nodeId: socket.nodeId,
        socketId: socket.id
      });
    }

    endConnecting();
  },

  // Cancel connection
  onCanvasMouseUp: () => {
    if (isConnecting) {
      endConnecting();
    }
  },

  // Delete connection
  onWireClick: (connectionId: string, e: MouseEvent) => {
    e.stopPropagation();
    selectConnections([connectionId], e.shiftKey);
  },

  onWireDoubleClick: (connectionId: string) => {
    deleteConnection(connectionId);
  }
};
```

### Keyboard Shortcuts

```typescript
const keyboardShortcuts = {
  // Selection
  'Ctrl+A': selectAll,
  'Escape': deselectAll,

  // Edit
  'Delete': deleteSelected,
  'Backspace': deleteSelected,
  'Ctrl+D': duplicateSelected,
  'Ctrl+C': copySelected,
  'Ctrl+V': paste,
  'Ctrl+X': cutSelected,
  'Ctrl+G': groupSelected,

  // Canvas
  'Ctrl+0': fitToView,
  '+': zoomIn,
  '-': zoomOut,
  'Space': (hold) => enablePanMode,
  'Home': goToOutputNode,

  // History
  'Ctrl+Z': undo,
  'Ctrl+Shift+Z': redo,
  'Ctrl+Y': redo,

  // Node actions
  'N': openNodeLibrary,
  'Tab': openQuickAdd,
  'C': collapseSelected
};
```

---

## Visual Design Specifications

### Color Palette

```css
/* Canvas */
--canvas-bg: #1a1a2e;
--canvas-grid: #252542;
--canvas-grid-major: #2f2f50;

/* Node colors */
--node-bg: #2d2d44;
--node-header: #3d3d5c;
--node-border: #4a4a6a;
--node-selected-border: #6366f1;
--node-text: #e2e8f0;

/* Socket colors by type */
--socket-image: #3b82f6;
--socket-mask: #10b981;
--socket-style: #8b5cf6;
--socket-number: #f59e0b;
--socket-color: #ec4899;

/* Wire colors (match sockets) */
--wire-image: #3b82f6;
--wire-mask: #10b981;
--wire-style: #8b5cf6;
--wire-invalid: #ef4444;

/* UI elements */
--panel-bg: #252542;
--panel-border: #3d3d5c;
--button-primary: #6366f1;
```

### Node Visual Design

```
┌─────────────────────────────────────┐
│ ● Style Transfer                    │ ← Header with icon
├─────────────────────────────────────┤
│                                     │
│  ○ Image                   Result ○ │ ← Input/Output sockets
│  ○ Style                            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Strength          [====75%] │    │ ← Inline parameters
│  └─────────────────────────────┘    │
│  ☐ Preserve Colors                  │
│                                     │
└─────────────────────────────────────┘

Socket types:
● Filled = Connected
○ Empty = Disconnected
```

### Wire/Connection Design

```
Output Socket ●──────────────────────● Input Socket

Wire properties:
- Bezier curve with horizontal bias
- Control points at 50% horizontal distance
- Width: 2px (normal), 3px (selected)
- Glow on hover/selected
- Animated dash pattern when data flowing
```

### Socket Shapes

```
Image:   ●○ (circle)
Mask:    ◆◇ (diamond)
Style:   ■□ (square)
Number:  ▲△ (triangle)
Color:   ★☆ (star)
```

### Animations

```css
/* Wire flow animation */
@keyframes wireFlow {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
  duration: 500ms;
  iteration: infinite;
}

/* Node selection */
.node-selected {
  box-shadow: 0 0 0 2px var(--node-selected-border);
  transition: box-shadow 100ms ease-out;
}

/* Socket hover */
.socket:hover {
  transform: scale(1.3);
  transition: transform 100ms ease-out;
}

/* Socket compatible (during connection) */
.socket-compatible {
  animation: socketPulse 500ms ease-in-out infinite;
}

@keyframes socketPulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
  100% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}
```

### Typography

```css
/* Node header */
--node-title: 600 12px/1.3 'Inter';

/* Socket label */
--socket-label: 400 11px/1 'Inter';

/* Parameter label */
--param-label: 400 11px/1.3 'Inter';

/* Parameter value */
--param-value: 500 11px/1 'Inter';
```

---

## Responsive Behavior

### Desktop (1920px, 1440px, 1280px)

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar                                      [Generate] │
├────────┬────────────────────────────────────┬───────────┤
│        │                                    │           │
│ Node   │       Canvas Workspace             │ Properties│
│ Library│                                    │ Panel     │
│ 240px  │                                    │ 280px     │
│        │                                    │           │
│        │                                    │           │
│        │                                    │           │
└────────┴────────────────────────────────────┴───────────┘
```

### Tablet (1024px, 768px)

```
┌───────────────────────────────────────────┐
│ Toolbar                         [Generate]│
├───────────────────────────────────────────┤
│                                           │
│           Canvas Workspace                │
│              (full width)                 │
│                                           │
├───────────────────────────────────────────┤
│ [Library] [Properties] ← Bottom tabs      │
└───────────────────────────────────────────┘
```

### Mobile (428px, 375px)

**Not recommended.** Show message suggesting desktop use.

If absolutely needed:
- Simplified single-node view
- List-based node browser
- Connection visualization only

---

## Accessibility Requirements

### Keyboard Navigation

```typescript
const keyboardNav = {
  // Graph navigation
  'Tab': 'Next node (topological order)',
  'Shift+Tab': 'Previous node',
  'Arrow keys': 'Navigate to connected node',

  // Within node
  'Enter': 'Enter node, focus first control',
  'Escape': 'Exit node, return to graph',

  // Socket navigation (within node)
  'Up/Down': 'Navigate sockets',
  'Space': 'Start/complete connection from socket'
};
```

### Screen Reader Support

```typescript
const ariaLabels = {
  canvas: 'Node graph canvas with {n} nodes and {m} connections',
  node: '{type} node: {label}. {inputCount} inputs, {outputCount} outputs.',
  socket: '{name} {type} socket. {connected ? "Connected to " + target : "Not connected"}',
  connection: 'Connection from {fromNode} {fromSocket} to {toNode} {toSocket}'
};

const liveRegions = {
  nodeAdded: '{label} node added',
  nodeDeleted: '{label} node deleted',
  connectionCreated: 'Connected {fromNode} to {toNode}',
  connectionDeleted: 'Disconnected {fromNode} from {toNode}',
  validationError: 'Cannot connect: {reason}'
};
```

### ARIA Attributes

```tsx
// Canvas
<div
  role="application"
  aria-label={`Node graph with ${nodes.length} nodes`}
  aria-describedby="graph-help"
>

// Node
<div
  role="group"
  aria-label={`${node.type} node: ${node.label}`}
  tabIndex={0}
>

// Socket
<button
  role="button"
  aria-label={`${socket.name} ${socket.dataType} socket`}
  aria-pressed={isConnected}
>

// Connection (announced but not focusable)
<path
  role="presentation"
  aria-hidden="true"
/>
```

---

## Performance Considerations

### Rendering Optimizations

```typescript
// Virtualize nodes outside viewport
const visibleNodes = useMemo(() => {
  return nodes.filter(node =>
    isInViewport(node.position, node.size, transform, viewportSize)
  );
}, [nodes, transform, viewportSize]);

// Memoize individual nodes
const Node = React.memo(NodeComponent, (prev, next) => {
  return (
    prev.node.position === next.node.position &&
    prev.isSelected === next.isSelected &&
    shallowEqual(prev.node.parameters, next.node.parameters)
  );
});

// Use canvas for wires if many connections
const useCanvasWires = connections.length > 50;

// Debounce parameter updates
const debouncedParameterChange = useDebouncedCallback(
  onParameterChange,
  150
);
```

### Large Graph Handling

```typescript
// Level-of-detail rendering
function getNodeLOD(scale: number): 'full' | 'simplified' | 'icon' {
  if (scale > 0.5) return 'full';
  if (scale > 0.2) return 'simplified';
  return 'icon';
}

// Batch connection rendering
function renderConnections(connections: Connection[], ctx: CanvasRenderingContext2D) {
  // Group by color for fewer state changes
  const grouped = groupBy(connections, c => getWireColor(c.dataType));

  for (const [color, wires] of grouped) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (const wire of wires) {
      drawBezier(ctx, wire.from, wire.to);
    }
    ctx.stroke();
  }
}
```

---

## Implementation Notes

### Recommended Libraries

- **Node graph**: React Flow (strongly recommended)
- **State**: Zustand or Redux
- **Drag handling**: Built into React Flow
- **Context menu**: @radix-ui/react-context-menu

### React Flow Integration

```typescript
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection as RFConnection
} from 'reactflow';

// Custom node types
const nodeTypes = {
  'image-input': ImageInputNode,
  'style-transfer': StyleTransferNode,
  'color-blend': ColorBlendNode,
  'mask-region': MaskRegionNode,
  'combine': CombineNode,
  'output': OutputNode
};

function NodeGraphUI() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: RFConnection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

### File Structure

```
/components/node-graph/
  NodeGraphUI.tsx
  nodes/
    BaseNode.tsx
    ImageInputNode.tsx
    ProcessorNodes.tsx
    OutputNode.tsx
  NodeLibrary.tsx
  PropertiesPanel.tsx
  ContextMenu.tsx
  hooks/
    useGraphState.ts
    useKeyboardShortcuts.ts
  utils/
    validation.ts
    serialization.ts
    layout.ts
```
