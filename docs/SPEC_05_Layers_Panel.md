# Layers Panel (Photoshop-Style) Technical Specification

## Overview

The Layers Panel paradigm treats reference images as "influence layers" stacked on top of the base image, similar to layers in Photoshop or Figma. Each layer has familiar controls like opacity (strength), visibility toggle, blend mode, and can be reordered in the stack. This leverages decades of ingrained mental models from image editing software.

---

## Component Architecture

### Component Hierarchy

```
LayersPanelUI
├── PreviewArea
│   ├── PreviewToolbar
│   │   ├── ZoomControls
│   │   ├── ViewModeToggle (single/split/overlay)
│   │   └── FullscreenButton
│   ├── PreviewCanvas
│   │   ├── BaseImageView
│   │   └── LayerPreviewOverlay
│   └── PreviewControls
│       └── GenerateButton
├── LayersPanel
│   ├── PanelHeader
│   │   ├── PanelTitle
│   │   └── PanelActions (add, folder, effects)
│   ├── LayerStack
│   │   └── LayerRow[] (sortable)
│   │       ├── VisibilityToggle
│   │       ├── LayerThumbnail
│   │       ├── LayerInfo
│   │       │   ├── LayerName (editable)
│   │       │   └── TypeBadge
│   │       ├── OpacitySlider (mini)
│   │       ├── LockIndicator
│   │       └── LayerMenu
│   └── BaseLayer (locked, special styling)
├── LayerPropertiesPanel
│   ├── PropertiesHeader
│   ├── BlendModeSelector
│   ├── OpacityControl
│   ├── InfluenceTypeSelector
│   ├── MaskSection
│   │   ├── MaskToggle
│   │   └── MaskPreview
│   ├── AdvancedOptions
│   └── LayerNotes
└── Toolbar
    ├── LayerActions
    │   ├── NewLayerButton
    │   ├── DeleteLayerButton
    │   ├── DuplicateButton
    │   └── GroupButton
    ├── BlendModeQuick
    └── OpacityQuick
```

### Component Specifications

#### LayersPanelUI (Root)
```typescript
interface LayersPanelUIProps {
  initialState?: LayersState;
  onStateChange?: (state: LayersState) => void;
}
```
- Main layout with preview and layers panel
- Handles panel resizing

#### PreviewArea
```typescript
interface PreviewAreaProps {
  baseImage: BaseImage | null;
  layers: Layer[];
  previewMode: 'result' | 'base' | 'split' | 'overlay';
  zoom: number;
  panOffset: Position;
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: Position) => void;
  onGenerateClick: () => void;
  isGenerating: boolean;
  resultImage?: string;
}
```
- Main preview showing composition
- Supports multiple view modes

#### LayersPanel
```typescript
interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onReorderLayers: (from: number, to: number) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: () => void;
}
```
- Vertical panel with layer stack
- Default width: 280px
- Resizable

#### LayerRow
```typescript
interface LayerRowProps {
  layer: Layer;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onOpacityChange: (opacity: number) => void;
  onNameChange: (name: string) => void;
  onDoubleClick: () => void;
  dragHandleProps: DragHandleProps;
}
```
- Single layer in the stack
- Height: 48px
- Inline opacity slider

#### BaseLayer
```typescript
interface BaseLayerProps {
  baseImage: BaseImage;
  isSelected: boolean;
  onSelect: () => void;
  onChangeImage: () => void;
}
```
- Always at bottom of stack
- Cannot be deleted or reordered
- Lock icon visible

#### LayerPropertiesPanel
```typescript
interface LayerPropertiesPanelProps {
  layer: Layer | null;
  onUpdate: (updates: Partial<Layer>) => void;
  onAddMask: () => void;
  onDeleteMask: () => void;
}
```
- Detailed layer settings
- Below layers panel or in separate column

#### VisibilityToggle
```typescript
interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}
```
- Eye icon toggle
- Familiar Photoshop pattern

#### BlendModeSelector
```typescript
interface BlendModeSelectorProps {
  value: BlendMode;
  onChange: (mode: BlendMode) => void;
}

type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'difference'
  | 'exclusion';
```
- Dropdown with blend mode options
- Preview on hover (optional)

---

## State Management

### State Shape

```typescript
interface LayersState {
  // Base image
  baseImage: BaseImage | null;

  // Layer stack (ordered bottom to top)
  layers: Layer[];

  // Selection
  selectedLayerId: string | null;

  // Preview state
  preview: {
    mode: 'result' | 'base' | 'split' | 'overlay';
    zoom: number;
    panOffset: Position;
  };

  // Generation
  generation: {
    isGenerating: boolean;
    progress: number;
    resultSrc: string | null;
  };

  // UI state
  ui: {
    layersPanelWidth: number;
    showProperties: boolean;
    expandedLayerId: string | null;
  };

  // Library
  library: LibraryImage[];

  // History
  history: HistoryState;
}

interface Layer {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;
  order: number;          // Position in stack (0 = bottom)

  // Visibility and strength
  isVisible: boolean;
  opacity: number;        // 0-100

  // Blend settings
  blendMode: BlendMode;
  influenceType: NodeType;

  // Lock state
  isLocked: boolean;

  // Mask
  hasMask: boolean;
  maskData?: string;      // Base64 encoded
  maskEnabled: boolean;

  // Advanced
  notes?: string;
}

interface BaseImage {
  id: string;
  src: string;
  name: string;
  isLocked: true;  // Always locked
}
```

### State Update Patterns

```typescript
type LayersAction =
  // Base image
  | { type: 'SET_BASE_IMAGE'; payload: BaseImage }

  // Layer actions
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'DUPLICATE_LAYER'; payload: string }
  | { type: 'REORDER_LAYERS'; payload: { from: number; to: number } }
  | { type: 'MERGE_DOWN'; payload: string }

  // Visibility
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'SOLO_LAYER'; payload: string }
  | { type: 'SHOW_ALL_LAYERS' }

  // Selection
  | { type: 'SELECT_LAYER'; payload: string | null }
  | { type: 'SELECT_NEXT_LAYER' }
  | { type: 'SELECT_PREVIOUS_LAYER' }

  // Masks
  | { type: 'ADD_MASK'; payload: string }
  | { type: 'DELETE_MASK'; payload: string }
  | { type: 'UPDATE_MASK'; payload: { id: string; maskData: string } }
  | { type: 'TOGGLE_MASK'; payload: string }

  // Preview
  | { type: 'SET_PREVIEW_MODE'; payload: PreviewMode }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: Position }

  // Generation
  | { type: 'START_GENERATION' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_RESULT'; payload: string }

  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// Layer ordering logic
function reorderLayers(
  layers: Layer[],
  fromIndex: number,
  toIndex: number
): Layer[] {
  const result = [...layers];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // Update order values
  return result.map((layer, idx) => ({
    ...layer,
    order: idx
  }));
}

// Layer stacking order (for rendering)
function getVisibleLayers(layers: Layer[]): Layer[] {
  return layers
    .filter(l => l.isVisible)
    .sort((a, b) => a.order - b.order);
}
```

---

## Data Structures

### TypeScript Interfaces

```typescript
// Blend mode options with descriptions
interface BlendModeOption {
  value: BlendMode;
  label: string;
  description: string;
  group: 'normal' | 'darken' | 'lighten' | 'contrast' | 'inversion';
}

const blendModeOptions: BlendModeOption[] = [
  // Normal group
  { value: 'normal', label: 'Normal', description: 'Standard blending', group: 'normal' },

  // Darken group
  { value: 'multiply', label: 'Multiply', description: 'Darkens image', group: 'darken' },
  { value: 'color-burn', label: 'Color Burn', description: 'Intense darkening', group: 'darken' },

  // Lighten group
  { value: 'screen', label: 'Screen', description: 'Lightens image', group: 'lighten' },
  { value: 'color-dodge', label: 'Color Dodge', description: 'Intense lightening', group: 'lighten' },

  // Contrast group
  { value: 'overlay', label: 'Overlay', description: 'Increases contrast', group: 'contrast' },
  { value: 'soft-light', label: 'Soft Light', description: 'Subtle contrast', group: 'contrast' },
  { value: 'hard-light', label: 'Hard Light', description: 'Strong contrast', group: 'contrast' },

  // Inversion group
  { value: 'difference', label: 'Difference', description: 'Color inversion', group: 'inversion' },
  { value: 'exclusion', label: 'Exclusion', description: 'Soft inversion', group: 'inversion' }
];

// Layer preset configurations
interface LayerPreset {
  id: string;
  name: string;
  influenceType: NodeType;
  blendMode: BlendMode;
  opacity: number;
}

const layerPresets: LayerPreset[] = [
  { id: 'style', name: 'Style Transfer', influenceType: NodeType.STYLE, blendMode: 'overlay', opacity: 75 },
  { id: 'color', name: 'Color Grading', influenceType: NodeType.COLOR, blendMode: 'soft-light', opacity: 60 },
  { id: 'texture', name: 'Texture Overlay', influenceType: NodeType.TEXTURE, blendMode: 'multiply', opacity: 40 },
  { id: 'lighting', name: 'Lighting Effect', influenceType: NodeType.LIGHTING, blendMode: 'screen', opacity: 50 }
];

// Serialization format
interface LayersConfiguration {
  version: string;
  baseImage: {
    src: string;
    name: string;
  } | null;
  layers: Array<{
    src: string;
    name: string;
    order: number;
    isVisible: boolean;
    opacity: number;
    blendMode: BlendMode;
    influenceType: NodeType;
    hasMask: boolean;
    maskData?: string;
    notes?: string;
  }>;
  preview: {
    mode: string;
    zoom: number;
  };
}
```

---

## Interaction Handlers

### Layer Selection

```typescript
const selectionHandlers = {
  // Single click to select
  onClick: (layerId: string, e: MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_LAYER', payload: layerId });
  },

  // Ctrl/Cmd + click for multi-select (future)
  onCtrlClick: (layerId: string, e: MouseEvent) => {
    // Reserved for multi-select in future version
  },

  // Double-click to rename
  onDoubleClick: (layerId: string) => {
    setEditingName(layerId);
  },

  // Click outside to deselect
  onCanvasClick: () => {
    dispatch({ type: 'SELECT_LAYER', payload: null });
  }
};
```

### Layer Reordering

```typescript
// Using @dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

function SortableLayerRow({ layer, ... }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LayerRow layer={layer} isDragging={isDragging} />
    </div>
  );
}

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = layers.findIndex(l => l.id === active.id);
    const newIndex = layers.findIndex(l => l.id === over.id);

    // Prevent moving below base layer
    if (newIndex === 0) return;

    dispatch({
      type: 'REORDER_LAYERS',
      payload: { from: oldIndex, to: newIndex }
    });
  }
};
```

### Visibility Toggle

```typescript
const visibilityHandlers = {
  // Toggle single layer
  onToggle: (layerId: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', payload: layerId });
  },

  // Alt + click to solo
  onAltClick: (layerId: string, e: MouseEvent) => {
    if (e.altKey) {
      dispatch({ type: 'SOLO_LAYER', payload: layerId });
    } else {
      dispatch({ type: 'TOGGLE_VISIBILITY', payload: layerId });
    }
  },

  // Show all
  onShowAll: () => {
    dispatch({ type: 'SHOW_ALL_LAYERS' });
  }
};

// Solo layer logic
function soloLayer(layers: Layer[], soloId: string): Layer[] {
  const isSoloed = layers.every(l =>
    l.id === soloId ? l.isVisible : !l.isVisible
  );

  if (isSoloed) {
    // Un-solo: show all
    return layers.map(l => ({ ...l, isVisible: true }));
  } else {
    // Solo: hide all except this one
    return layers.map(l => ({
      ...l,
      isVisible: l.id === soloId
    }));
  }
}
```

### Opacity Control

```typescript
const opacityHandlers = {
  // Inline slider change
  onSliderChange: (layerId: string, opacity: number) => {
    dispatch({
      type: 'UPDATE_LAYER',
      payload: { id: layerId, updates: { opacity } }
    });
  },

  // Scrub on number (Photoshop-style)
  onNumberScrub: (layerId: string, delta: number) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const newOpacity = clamp(layer.opacity + delta, 0, 100);
    dispatch({
      type: 'UPDATE_LAYER',
      payload: { id: layerId, updates: { opacity: newOpacity } }
    });
  },

  // Keyboard input
  onKeyDown: (layerId: string, e: KeyboardEvent) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    let delta = 0;
    if (e.key === 'ArrowUp') delta = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowDown') delta = e.shiftKey ? -10 : -1;

    if (delta !== 0) {
      e.preventDefault();
      const newOpacity = clamp(layer.opacity + delta, 0, 100);
      dispatch({
        type: 'UPDATE_LAYER',
        payload: { id: layerId, updates: { opacity: newOpacity } }
      });
    }
  }
};
```

### Keyboard Shortcuts

```typescript
const keyboardShortcuts = {
  // Layer navigation
  'ArrowUp': selectPreviousLayer,
  'ArrowDown': selectNextLayer,

  // Visibility
  'v': toggleSelectedVisibility,

  // Opacity shortcuts (number keys)
  '1': () => setOpacity(10),
  '2': () => setOpacity(20),
  '3': () => setOpacity(30),
  '4': () => setOpacity(40),
  '5': () => setOpacity(50),
  '6': () => setOpacity(60),
  '7': () => setOpacity(70),
  '8': () => setOpacity(80),
  '9': () => setOpacity(90),
  '0': () => setOpacity(100),

  // Layer actions
  'Ctrl+J': duplicateSelectedLayer,
  'Delete': deleteSelectedLayer,
  'Backspace': deleteSelectedLayer,
  'Ctrl+G': groupSelectedLayers,
  'Ctrl+E': mergeDown,

  // Blend mode cycling
  'Shift+Plus': nextBlendMode,
  'Shift+Minus': previousBlendMode,

  // General
  'Ctrl+Z': undo,
  'Ctrl+Shift+Z': redo,
  'Enter': commitNameEdit,
  'Escape': cancelNameEdit
};
```

---

## Visual Design Specifications

### Color Palette

```css
/* Panel colors (dark theme option) */
--panel-bg: #252526;
--panel-bg-alt: #2d2d2d;
--panel-border: #3e3e42;
--panel-text: #cccccc;
--panel-text-muted: #808080;

/* Light theme */
--panel-bg-light: #f3f3f3;
--panel-bg-alt-light: #ffffff;
--panel-border-light: #e0e0e0;
--panel-text-light: #333333;

/* Layer row */
--layer-bg: transparent;
--layer-hover: rgba(255, 255, 255, 0.05);
--layer-selected: rgba(99, 102, 241, 0.2);
--layer-selected-border: #6366f1;

/* Visibility eye */
--eye-visible: #cccccc;
--eye-hidden: #505050;

/* Opacity slider */
--opacity-track: #404040;
--opacity-fill: #6366f1;

/* Lock indicator */
--lock-color: #808080;

/* Base layer */
--base-layer-bg: rgba(99, 102, 241, 0.1);
```

### Layers Panel Layout

```
┌─────────────────────────────────────┐
│  Layers                    [+] [≡]  │ ← Panel header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 👁 [img] Style Layer    100%│    │ ← Layer row
│  │     🎨 Overlay              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 👁 [img] Color Layer     75%│    │
│  │     🌈 Soft Light           │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 👁 [img] Texture Layer   50%│    │
│  │     🔲 Multiply             │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 🔒 [img] Background     100%│    │ ← Base layer (locked)
│  │     Base Image              │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Layer Row Design

```
┌─────────────────────────────────────────────────────────┐
│ 👁 │ [thumb] │ Layer Name          │ [blend▼] │ 75% │ ⋮ │
│    │  32x32  │ 🎨 Style            │          │ ══▒ │   │
└─────────────────────────────────────────────────────────┘
 ↑      ↑            ↑                    ↑        ↑    ↑
Vis  Thumb   Name + Type badge      Blend mode  Opacity Menu

Selected state:
┌─────────────────────────────────────────────────────────┐
│▌👁 │ [thumb] │ Layer Name          │ [blend▼] │ 75% │ ⋮ │
│▌   │  32x32  │ 🎨 Style            │          │ ══▒ │   │
└─────────────────────────────────────────────────────────┘
 ↑ Selection indicator
```

### Properties Panel Design

```
┌─────────────────────────────────────┐
│  Layer Properties                   │
├─────────────────────────────────────┤
│                                     │
│  Blend Mode                         │
│  ┌─────────────────────────────┐    │
│  │ Overlay                   ▼ │    │
│  └─────────────────────────────┘    │
│                                     │
│  Opacity                            │
│  ═══════════════════▒▒▒▒▒ [75%]    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Influence Type                     │
│  ┌─────────────────────────────┐    │
│  │ 🎨 Style Transfer         ▼ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Mask                               │
│  [ ] Enable Layer Mask              │
│  [Add Mask]                         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Notes                              │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Animations

```css
/* Layer selection */
.layer-row {
  transition: background-color 100ms ease-out;
}

.layer-row.selected {
  background-color: var(--layer-selected);
  border-left: 3px solid var(--layer-selected-border);
}

/* Visibility toggle */
@keyframes eyeBlink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
  duration: 150ms;
}

/* Layer reorder drag */
.layer-row.dragging {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
  background-color: var(--panel-bg-alt);
}

/* Drop indicator */
.drop-indicator {
  height: 2px;
  background-color: var(--layer-selected-border);
  animation: dropPulse 500ms ease-in-out infinite;
}

@keyframes dropPulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Opacity scrub feedback */
.opacity-scrubbing {
  cursor: ew-resize;
}

/* Layer add */
@keyframes layerAdd {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
  duration: 200ms;
  easing: ease-out;
}

/* Layer remove */
@keyframes layerRemove {
  to {
    opacity: 0;
    height: 0;
    transform: translateX(20px);
  }
  duration: 150ms;
  easing: ease-in;
}
```

### Typography

```css
/* Layer name */
--layer-name: 500 13px/1.3 'Inter';

/* Layer type */
--layer-type: 400 11px/1 'Inter';
color: var(--panel-text-muted);

/* Opacity value */
--opacity-value: 500 11px/1 'Inter';
font-variant-numeric: tabular-nums;

/* Panel header */
--panel-header: 600 12px/1 'Inter';
text-transform: uppercase;
letter-spacing: 0.5px;

/* Properties label */
--property-label: 400 11px/1.3 'Inter';
color: var(--panel-text-muted);
```

---

## Responsive Behavior

### Desktop (1920px, 1440px, 1280px)

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar                                                 │
├───────────────────────────────────────────┬─────────────┤
│                                           │             │
│                                           │   Layers    │
│                                           │   Panel     │
│           Preview Area                    │   280px     │
│              (flex)                       │             │
│                                           ├─────────────┤
│                                           │             │
│                                           │ Properties  │
│                                           │   Panel     │
│                                           │             │
└───────────────────────────────────────────┴─────────────┘
```

- Preview: Flex grow
- Layers panel: 280px fixed
- Properties: Below layers or separate column
- Resizable divider

### Tablet (1024px, 768px)

```
┌───────────────────────────────────────────┐
│                 Toolbar                   │
├───────────────────────────────────────────┤
│                                           │
│           Preview Area                    │
│             (full width)                  │
│                                           │
├───────────────────────────────────────────┤
│  [Layers] [Properties] ← Tab bar          │
│                                           │
│  Layers Panel (full width)                │
│                                           │
└───────────────────────────────────────────┘
```

- Stacked layout
- Tabbed bottom panel
- Larger touch targets

### Mobile (428px, 375px)

```
┌─────────────────────────┐
│        Toolbar          │
├─────────────────────────┤
│                         │
│     Preview Area        │
│      (full width)       │
│                         │
├─────────────────────────┤
│ [Layers] [Props] [Gen]  │ ← Bottom tabs
├─────────────────────────┤
│                         │
│   Panel Content         │
│   (slides from bottom)  │
│                         │
└─────────────────────────┘
```

- Full-width preview
- Bottom sheet for layers
- Simplified layer rows
- Swipe gestures for visibility

---

## Accessibility Requirements

### Keyboard Navigation

```typescript
const keyboardNav = {
  // Layer list navigation
  'ArrowUp': 'Select previous layer',
  'ArrowDown': 'Select next layer',
  'Home': 'Select top layer',
  'End': 'Select bottom layer (before base)',

  // Layer actions
  'Enter': 'Edit layer name',
  'Space': 'Toggle layer visibility',
  'Delete': 'Delete selected layer',

  // Property focus
  'Tab': 'Move to next property control',
  'Shift+Tab': 'Move to previous property control',

  // Reordering
  'Ctrl+ArrowUp': 'Move layer up',
  'Ctrl+ArrowDown': 'Move layer down'
};
```

### Screen Reader Support

```typescript
const ariaLabels = {
  layersPanel: 'Layers panel with {n} layers',
  layerRow: '{name}, {type} layer, {opacity}% opacity, {isVisible ? "visible" : "hidden"}',
  baseLayer: 'Background layer: {name}, locked',
  visibilityToggle: 'Toggle visibility for {name}, currently {isVisible ? "visible" : "hidden"}',
  opacitySlider: 'Opacity for {name}',
  blendModeSelect: 'Blend mode for {name}',
  addLayerButton: 'Add new layer',
  deleteLayerButton: 'Delete {name}'
};

const liveRegions = {
  layerAdded: '{name} layer added',
  layerDeleted: '{name} layer deleted',
  layerMoved: '{name} moved to position {position}',
  visibilityChanged: '{name} now {isVisible ? "visible" : "hidden"}',
  opacityChanged: '{name} opacity set to {opacity}%',
  blendModeChanged: '{name} blend mode set to {mode}'
};
```

### ARIA Attributes

```tsx
// Layers panel
<div
  role="listbox"
  aria-label={`Layers panel, ${layers.length} layers`}
  aria-activedescendant={selectedLayerId}
>

// Layer row
<div
  role="option"
  id={layer.id}
  aria-selected={isSelected}
  aria-label={generateLayerLabel(layer)}
>

// Visibility toggle
<button
  role="switch"
  aria-checked={layer.isVisible}
  aria-label={`Visibility for ${layer.name}`}
>

// Opacity slider
<input
  type="range"
  role="slider"
  aria-label={`Opacity for ${layer.name}`}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={layer.opacity}
  aria-valuetext={`${layer.opacity}%`}
/>

// Blend mode dropdown
<select
  aria-label={`Blend mode for ${layer.name}`}
>
```

---

## Performance Considerations

### Rendering Optimizations

```typescript
// Memoize layer rows
const LayerRow = React.memo(({ layer, isSelected, ... }) => {
  // Render
}, (prev, next) => {
  return (
    prev.layer.isVisible === next.layer.isVisible &&
    prev.layer.opacity === next.layer.opacity &&
    prev.layer.name === next.layer.name &&
    prev.isSelected === next.isSelected
  );
});

// Virtual list for many layers
import { FixedSizeList } from 'react-window';

function VirtualLayersList({ layers }) {
  const ROW_HEIGHT = 48;

  return (
    <FixedSizeList
      height={400}
      itemCount={layers.length}
      itemSize={ROW_HEIGHT}
    >
      {({ index, style }) => (
        <div style={style}>
          <LayerRow layer={layers[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// Throttle opacity updates
const throttledOpacity = useThrottle(updateOpacity, 16);
```

### Preview Rendering

```typescript
// Debounce preview updates
const debouncedPreview = useDebouncedCallback(
  updatePreview,
  100
);

// Low-res preview during interaction
function PreviewCanvas({ layers, isInteracting }) {
  const quality = isInteracting ? 'low' : 'high';

  return (
    <canvas
      style={{
        imageRendering: quality === 'low' ? 'pixelated' : 'auto'
      }}
    />
  );
}
```

---

## Implementation Notes

### Recommended Libraries

- **Drag and drop**: @dnd-kit/core, @dnd-kit/sortable
- **Virtualization**: react-window (if many layers)
- **Resizable panels**: react-resizable-panels
- **Icons**: lucide-react (Photoshop-like icons)

### Dark/Light Theme Support

```typescript
// Theme context
const ThemeContext = createContext<'light' | 'dark'>('light');

// CSS custom properties approach
function LayersPanel() {
  const theme = useContext(ThemeContext);

  return (
    <div
      className="layers-panel"
      data-theme={theme}
    >
      {/* Content */}
    </div>
  );
}

// CSS
.layers-panel[data-theme="dark"] {
  --panel-bg: #252526;
  --panel-text: #cccccc;
}

.layers-panel[data-theme="light"] {
  --panel-bg: #f3f3f3;
  --panel-text: #333333;
}
```

### File Structure

```
/components/layers/
  LayersPanelUI.tsx
  PreviewArea.tsx
  LayersPanel.tsx
  LayerRow.tsx
  BaseLayer.tsx
  LayerProperties.tsx
  BlendModeSelector.tsx
  VisibilityToggle.tsx
  OpacitySlider.tsx
  hooks/
    useLayersState.ts
    useDragReorder.ts
    useKeyboardShortcuts.ts
  utils/
    blendModes.ts
    layerPresets.ts
```
