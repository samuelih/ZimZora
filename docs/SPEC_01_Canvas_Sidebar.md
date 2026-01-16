# Canvas + Sidebar Panel Technical Specification

## Overview

The Canvas + Sidebar paradigm presents the main image on an infinite, pannable canvas with a sidebar containing reference image thumbnails. Users drag references onto the canvas where they become connected nodes, with spatial relationships representing influence dynamics.

---

## Component Architecture

### Component Hierarchy

```
CanvasSidebarUI
├── Sidebar
│   ├── SidebarHeader
│   │   └── UploadZone
│   ├── ImageLibrary
│   │   └── LibraryThumbnail[] (draggable)
│   └── SidebarFooter
│       └── LibraryActions
├── CanvasWorkspace
│   ├── CanvasContainer
│   │   ├── CanvasBackground (grid pattern)
│   │   ├── ConnectionLinesLayer
│   │   │   └── ConnectionLine[]
│   │   ├── MainImageNode
│   │   └── ReferenceNode[]
│   ├── CanvasControls
│   │   ├── ZoomControls
│   │   └── FitToViewButton
│   └── Minimap
└── PropertiesPanel
    ├── NodeHeader
    ├── InfluenceTypeSelector
    ├── StrengthSlider
    ├── MaskingOptions
    └── NodeActions
```

### Component Specifications

#### CanvasSidebarUI (Root)
```typescript
interface CanvasSidebarUIProps {
  initialState?: CanvasState;
  onStateChange?: (state: CanvasState) => void;
}
```
- Main container component
- Manages layout between sidebar and canvas
- Coordinates drag-drop between sidebar and canvas

#### Sidebar
```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  images: LibraryImage[];
  onUpload: (files: File[]) => void;
  onImageDragStart: (image: LibraryImage) => void;
}
```
- Width: 280px (desktop), collapsible to 48px
- Position: Left side (configurable to right)
- Contains upload zone and image library

#### UploadZone
```typescript
interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  uploadProgress?: number;
}
```
- Drag-and-drop file upload area
- Click to open file picker
- Shows upload progress

#### LibraryThumbnail
```typescript
interface LibraryThumbnailProps {
  image: LibraryImage;
  isDragging: boolean;
  onDragStart: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}
```
- 64x64px thumbnail with 4px border radius
- Draggable to canvas
- Double-click to add at default position

#### CanvasWorkspace
```typescript
interface CanvasWorkspaceProps {
  transform: CanvasTransform;
  onTransformChange: (transform: CanvasTransform) => void;
  mainImage: MainImage | null;
  referenceNodes: ReferenceNode[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeMove: (id: string, position: Position) => void;
  onNodeDrop: (image: LibraryImage, position: Position) => void;
  onNodeDelete: (id: string) => void;
}
```
- Infinite canvas with pan/zoom
- Renders all nodes and connections
- Handles all canvas interactions

#### CanvasBackground
```typescript
interface CanvasBackgroundProps {
  transform: CanvasTransform;
  pattern: 'dots' | 'grid' | 'none';
  patternSize: number;
  patternColor: string;
}
```
- SVG pattern that transforms with canvas
- Default: dots at 20px spacing

#### ConnectionLine
```typescript
interface ConnectionLineProps {
  from: Position;
  to: Position;
  strength: number;
  nodeType: NodeType;
  isSelected: boolean;
  animated?: boolean;
}
```
- Bezier curve from reference to main image
- Line thickness: 2-6px based on strength
- Color: Based on node type
- Opacity: 0.4-1.0 based on strength

#### MainImageNode
```typescript
interface MainImageNodeProps {
  image: MainImage;
  position: Position;
  isDropTarget: boolean;
}
```
- Larger than reference nodes (200x200px default)
- Fixed at canvas center initially
- Visual glow when dragging reference near

#### ReferenceNode
```typescript
interface ReferenceNodeProps {
  node: ReferenceNode;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDrag: (position: Position) => void;
  onDragEnd: () => void;
  onDelete: () => void;
}
```
- 80x80px thumbnail with controls
- Shows type indicator badge
- Strength indicator ring

#### PropertiesPanel
```typescript
interface PropertiesPanelProps {
  node: ReferenceNode | null;
  position: 'floating' | 'sidebar';
  onUpdateNode: (updates: Partial<ReferenceNode>) => void;
  onClose: () => void;
}
```
- Appears when node is selected
- Floating or docked in sidebar
- 320px width

#### Minimap
```typescript
interface MinimapProps {
  canvasSize: Size;
  viewport: Viewport;
  nodes: Array<{ position: Position; type: 'main' | 'reference' }>;
  onViewportChange: (viewport: Viewport) => void;
}
```
- 160x120px in bottom-right corner
- Shows all nodes as dots
- Clickable to navigate

---

## State Management

### State Shape

```typescript
interface CanvasState {
  // Canvas transform state
  transform: CanvasTransform;

  // Image library
  library: LibraryImage[];

  // Main image
  mainImage: MainImage | null;

  // Reference nodes on canvas
  nodes: ReferenceNode[];

  // Selection state
  selectedNodeId: string | null;

  // UI state
  ui: {
    sidebarCollapsed: boolean;
    propertiesPanelPosition: 'floating' | 'sidebar';
    showMinimap: boolean;
    canvasPattern: 'dots' | 'grid' | 'none';
  };

  // History for undo/redo
  history: HistoryState;
}

interface CanvasTransform {
  x: number;      // Pan X offset
  y: number;      // Pan Y offset
  scale: number;  // Zoom level (0.1 - 3.0)
}

interface LibraryImage {
  id: string;
  src: string;
  thumbnail: string;
  name: string;
  uploadedAt: Date;
  suggestedType?: NodeType;
}

interface MainImage {
  id: string;
  src: string;
  position: Position;
  size: Size;
}

interface ReferenceNode {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;
  position: Position;
  nodeType: NodeType;
  strength: number;        // 0-100
  isActive: boolean;
  mask?: MaskData;
  notes?: string;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface HistoryState {
  past: CanvasState[];
  future: CanvasState[];
}
```

### State Update Patterns

```typescript
// Actions
type CanvasAction =
  | { type: 'SET_TRANSFORM'; payload: CanvasTransform }
  | { type: 'ADD_LIBRARY_IMAGE'; payload: LibraryImage }
  | { type: 'REMOVE_LIBRARY_IMAGE'; payload: string }
  | { type: 'SET_MAIN_IMAGE'; payload: MainImage }
  | { type: 'ADD_NODE'; payload: ReferenceNode }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<ReferenceNode> } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'MOVE_NODE'; payload: { id: string; position: Position } }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// Reducer pattern
function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  // Implementation with history tracking
}
```

---

## Data Structures

### TypeScript Interfaces

```typescript
// Node types enum
enum NodeType {
  STYLE = 'style',
  OBJECT = 'object',
  COLOR = 'color',
  TEXTURE = 'texture',
  POSE = 'pose',
  LIGHTING = 'lighting',
  COMPOSITION = 'composition',
  FACE = 'face',
  BACKGROUND = 'background',
  DEPTH = 'depth',
  NEGATIVE = 'negative'
}

// Node type metadata
interface NodeTypeMeta {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: string;
  defaultStrength: number;
}

// Mask data for regional application
interface MaskData {
  type: 'paint' | 'region' | 'invert';
  data: string; // Base64 encoded mask or region coordinates
}

// Connection for visualization
interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string; // Always main image for this paradigm
  strength: number;
  nodeType: NodeType;
}

// Serialization format
interface CanvasConfiguration {
  version: string;
  mainImage: {
    src: string;
    name: string;
  } | null;
  references: Array<{
    src: string;
    name: string;
    nodeType: NodeType;
    strength: number;
    position: { x: number; y: number };
    mask?: MaskData;
    notes?: string;
  }>;
  canvasSettings: {
    pattern: 'dots' | 'grid' | 'none';
  };
}
```

---

## Interaction Handlers

### Canvas Interactions

#### Pan (Click + Drag on Empty Space)
```typescript
const handleCanvasPan = {
  onMouseDown: (e: MouseEvent) => {
    if (e.button === 0 && !isOverNode) {
      startPan({ x: e.clientX, y: e.clientY });
    }
  },
  onMouseMove: (e: MouseEvent) => {
    if (isPanning) {
      const delta = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      updateTransform({
        x: transform.x + delta.x,
        y: transform.y + delta.y
      });
    }
  },
  onMouseUp: () => endPan()
};
```

#### Zoom (Scroll Wheel)
```typescript
const handleCanvasZoom = (e: WheelEvent) => {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = clamp(transform.scale * zoomFactor, 0.1, 3.0);

  // Zoom toward cursor position
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  updateTransform({
    scale: newScale,
    x: x - (x - transform.x) * (newScale / transform.scale),
    y: y - (y - transform.y) * (newScale / transform.scale)
  });
};
```

### Node Interactions

#### Drag Node from Sidebar
```typescript
const handleNodeDrop = (e: DragEvent, image: LibraryImage) => {
  const canvasRect = canvas.getBoundingClientRect();
  const canvasPosition = screenToCanvas({
    x: e.clientX - canvasRect.left,
    y: e.clientY - canvasRect.top
  }, transform);

  addNode({
    id: generateId(),
    imageId: image.id,
    imageSrc: image.src,
    imageThumbnail: image.thumbnail,
    name: image.name,
    position: canvasPosition,
    nodeType: image.suggestedType || NodeType.STYLE,
    strength: 75,
    isActive: true
  });
};
```

#### Move Node on Canvas
```typescript
const handleNodeDrag = {
  onDragStart: (nodeId: string) => {
    selectNode(nodeId);
    setDraggingNode(nodeId);
  },
  onDrag: (e: MouseEvent) => {
    if (draggingNode) {
      const canvasPosition = screenToCanvas(
        { x: e.clientX, y: e.clientY },
        transform
      );
      moveNode(draggingNode, canvasPosition);
    }
  },
  onDragEnd: () => {
    // Check if dragged off canvas edge (delete zone)
    if (isInDeleteZone(currentPosition)) {
      deleteNode(draggingNode);
    }
    setDraggingNode(null);
  }
};
```

#### Select Node
```typescript
const handleNodeClick = (nodeId: string, e: MouseEvent) => {
  e.stopPropagation();
  selectNode(nodeId);
};
```

#### Delete Node
```typescript
const handleNodeDelete = (nodeId: string) => {
  // Confirm if needed
  if (confirmDelete || nodes.length > 5) {
    showConfirmDialog('Delete this reference?', () => {
      deleteNode(nodeId);
    });
  } else {
    deleteNode(nodeId);
  }
};
```

### Keyboard Shortcuts

```typescript
const keyboardShortcuts = {
  'Delete': deleteSelectedNode,
  'Backspace': deleteSelectedNode,
  'Escape': deselectAll,
  'Ctrl+Z': undo,
  'Ctrl+Shift+Z': redo,
  'Ctrl+Y': redo,
  'Ctrl+0': fitToView,
  '+': zoomIn,
  '-': zoomOut,
  'Space': (hold) => enablePanMode
};
```

### Edge Cases and Error States

1. **No main image**: Show upload prompt in center of canvas
2. **Node dragged off canvas**: Show delete zone indicator, remove node on drop
3. **Maximum nodes reached**: Show warning, prevent adding more
4. **Image upload failure**: Show error toast, retry option
5. **Invalid file type**: Reject with error message
6. **Large file**: Show compression option or reject
7. **Connection line collision**: Curve lines to avoid overlap
8. **Minimap overflow**: Clip nodes at edges, show overflow indicator

---

## Visual Design Specifications

### Color Palette

```css
/* Canvas colors */
--canvas-bg: #f8fafc;
--canvas-pattern: #e2e8f0;
--canvas-pattern-hover: #cbd5e1;

/* Sidebar colors */
--sidebar-bg: #ffffff;
--sidebar-border: #e2e8f0;
--sidebar-hover: #f1f5f9;

/* Node colors by type */
--node-style: #8b5cf6;
--node-object: #3b82f6;
--node-color: #f59e0b;
--node-texture: #10b981;
--node-pose: #ec4899;
--node-lighting: #f97316;
--node-composition: #06b6d4;
--node-face: #ef4444;
--node-background: #84cc16;
--node-depth: #6366f1;
--node-negative: #64748b;

/* Selection and interaction */
--selection-ring: #6366f1;
--drop-zone-active: rgba(99, 102, 241, 0.1);
--connection-default: #94a3b8;
```

### Typography

```css
/* Sidebar */
--sidebar-title: 600 14px/1.4 'Inter';
--thumbnail-label: 500 11px/1.3 'Inter';

/* Properties panel */
--panel-heading: 600 13px/1.4 'Inter';
--panel-label: 500 12px/1.4 'Inter';
--panel-value: 400 13px/1.4 'Inter';

/* Node labels */
--node-name: 500 11px/1.2 'Inter';
--node-type-badge: 600 9px/1 'Inter';
```

### Spacing

```css
/* Sidebar */
--sidebar-padding: 16px;
--thumbnail-gap: 8px;
--thumbnail-size: 64px;

/* Canvas */
--node-size: 80px;
--main-image-size: 200px;
--node-padding: 4px;

/* Properties panel */
--panel-padding: 16px;
--control-gap: 12px;
```

### Node Visual Design

```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │
│  │   Thumbnail   │  │
│  │               │  │
│  └───────────────┘  │
│  ┌─┐ Node Name   ◉  │
│  │T│ 75%         │  │
│  └─┘             │  │
└─────────────────────┘
     ↑ Type badge  ↑ Strength ring
```

### Connection Line Design

```
Reference Node ────────●═══════════════●──────── Main Image
                 Start cap          End cap

Line properties:
- Bezier curve with control points at 1/3 and 2/3
- Width: 2px (weak) to 6px (strong)
- Opacity: 0.4 (weak) to 1.0 (strong)
- Color: Based on node type
- Animated dash for selected connections
```

### Animations

```css
/* Node drag */
@keyframes nodeDrag {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
  transition: transform 150ms ease-out;
}

/* Node drop */
@keyframes nodeDrop {
  from { transform: scale(1.1); opacity: 0.8; }
  to { transform: scale(1); opacity: 1; }
  duration: 200ms;
  easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Connection line flow */
@keyframes connectionFlow {
  stroke-dashoffset: 0 to 20;
  duration: 1s;
  iteration: infinite;
}

/* Zoom transition */
transition: transform 150ms ease-out;

/* Pan momentum */
transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

---

## Responsive Behavior

### Desktop (1920px, 1440px, 1280px)

```
┌─────────────────────────────────────────────────────────┐
│ Header / Toolbar                                        │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  Sidebar   │         Canvas Workspace                   │
│  280px     │              (flex)                        │
│            │                                            │
│            │                    ┌──────┐                │
│            │                    │Minimap                │
│            │                    └──────┘                │
└────────────┴────────────────────────────────────────────┘
```

- Sidebar: 280px fixed width
- Canvas: Remaining width
- Properties panel: Floating or in sidebar
- Minimap: 160x120px bottom-right

### Tablet (1024px, 768px)

```
┌───────────────────────────────────────────┐
│ Header / Toolbar                          │
├───────┬───────────────────────────────────┤
│       │                                   │
│ Side  │      Canvas Workspace             │
│ 220px │           (flex)                  │
│       │                                   │
├───────┴───────────────────────────────────┤
│ Properties Panel (bottom sheet)           │
└───────────────────────────────────────────┘
```

- Sidebar: 220px, collapsible to icon-only (48px)
- Properties panel: Bottom sheet on selection
- Minimap: Hidden, accessible via button

### Mobile (428px, 375px)

**Note:** Canvas paradigm is not optimized for mobile. Recommend redirecting to Recipe paradigm.

If implemented:
```
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│                         │
│    Canvas (pinch/pan)   │
│                         │
├─────────────────────────┤
│ Bottom Sheet            │
│ - Quick add             │
│ - Properties            │
└─────────────────────────┘
```

- Full-width canvas
- Bottom sheet for all panels
- Gesture-based interactions
- Limited functionality

---

## Accessibility Requirements

### Keyboard Navigation

```typescript
const keyboardNavigation = {
  // Tab order
  tabOrder: ['sidebar', 'canvas', 'properties-panel'],

  // Within sidebar
  sidebar: {
    'Tab': 'next thumbnail',
    'Shift+Tab': 'previous thumbnail',
    'Enter': 'add to canvas',
    'Space': 'preview image'
  },

  // Within canvas
  canvas: {
    'Tab': 'next node',
    'Shift+Tab': 'previous node',
    'Enter': 'open properties',
    'Arrow keys': 'move selected node',
    'Delete': 'remove node'
  },

  // Within properties
  properties: {
    'Tab': 'next control',
    'Escape': 'close panel'
  }
};
```

### Screen Reader Considerations

```typescript
const ariaLabels = {
  sidebar: 'Reference image library',
  canvas: 'Composition canvas with {n} reference nodes',
  mainImage: 'Main image: {name}',
  referenceNode: '{name}, {type} reference, {strength}% strength',
  connectionLine: 'Connection from {nodeName} to main image',
  addButton: 'Add reference image',
  deleteButton: 'Remove {nodeName} from canvas'
};

const liveRegions = {
  nodeAdded: '{name} added to canvas',
  nodeRemoved: '{name} removed from canvas',
  strengthChanged: '{name} strength set to {strength}%',
  typeChanged: '{name} type changed to {type}'
};
```

### Focus Management

```typescript
const focusManagement = {
  // On node add
  onNodeAdd: () => focusNewNode(),

  // On node delete
  onNodeDelete: () => focusNextNode() || focusSidebar(),

  // On properties open
  onPropertiesOpen: () => focusFirstControl(),

  // On properties close
  onPropertiesClose: () => focusSelectedNode(),

  // Trap focus in modals
  modalFocusTrap: true
};
```

### ARIA Attributes

```tsx
// Canvas container
<div
  role="application"
  aria-label="Composition canvas"
  aria-describedby="canvas-instructions"
>

// Reference node
<div
  role="button"
  aria-pressed={isSelected}
  aria-label={`${node.name}, ${node.nodeType} reference, ${node.strength}% strength`}
  tabIndex={0}
>

// Sidebar image
<button
  aria-label={`Add ${image.name} to canvas`}
  aria-describedby={`suggested-type-${image.id}`}
>

// Strength slider
<input
  type="range"
  role="slider"
  aria-label="Influence strength"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={strength}
  aria-valuetext={`${strength}%`}
/>

// Connection line (decorative but announced)
<path
  role="presentation"
  aria-hidden="true"
/>
```

---

## Performance Considerations

### Virtualization

- Sidebar thumbnails: Virtual scroll for 50+ images
- Canvas nodes: Render only visible nodes (with buffer)
- Connection lines: Simplify when zoomed out

### Rendering Optimizations

```typescript
// Use React.memo for nodes
const ReferenceNode = React.memo(({ node, ... }) => {
  // Render
}, (prev, next) => {
  return prev.node.position === next.node.position &&
         prev.isSelected === next.isSelected;
});

// Throttle transform updates
const throttledTransform = useThrottle(transform, 16); // 60fps

// Debounce state persistence
const debouncedSave = useDebounce(saveState, 500);
```

### Canvas Rendering

- Use CSS transforms for pan/zoom (GPU accelerated)
- SVG for connection lines (vector, scalable)
- Image sprites for thumbnails
- Lazy load full-size images

---

## Implementation Notes

### Recommended Libraries

- **Canvas rendering**: React Flow (for node management) or custom with CSS transforms
- **Drag and drop**: @dnd-kit/core
- **State management**: Zustand or useReducer with context
- **Animations**: Framer Motion
- **Keyboard**: @react-aria/focus

### File Structure

```
/components/canvas-sidebar/
  CanvasSidebarUI.tsx
  CanvasWorkspace.tsx
  Sidebar.tsx
  PropertiesPanel.tsx
  ReferenceNode.tsx
  MainImageNode.tsx
  ConnectionLine.tsx
  Minimap.tsx
  hooks/
    useCanvasTransform.ts
    useNodeDrag.ts
    useKeyboardNavigation.ts
  utils/
    coordinates.ts
    bezier.ts
```
