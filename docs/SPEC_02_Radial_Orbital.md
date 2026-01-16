# Radial/Orbital Layout Technical Specification

## Overview

The Radial/Orbital paradigm places the main image at the center of a circular workspace, with reference images orbiting around it like planets around a sun. Distance from center directly represents influence strength - closer means stronger influence.

---

## Component Architecture

### Component Hierarchy

```
RadialOrbitalUI
├── OrbitalCanvas
│   ├── InfluenceZones
│   │   ├── InnerZone (High Influence)
│   │   ├── MiddleZone (Medium Influence)
│   │   └── OuterZone (Low Influence)
│   ├── CentralImage
│   │   ├── ImageDisplay
│   │   └── GlowEffect
│   ├── OrbitalNode[]
│   │   ├── NodeThumbnail
│   │   ├── TypeIndicator
│   │   └── StrengthRing
│   └── ConnectionBeams[]
├── UploadArea
│   ├── UploadButton
│   └── QuickLibrary
├── NodeDetailPanel
│   ├── NodePreview
│   ├── TypeSelector
│   ├── StrengthDisplay
│   ├── AdvancedOptions
│   └── DeleteButton
└── GenerateButton
```

### Component Specifications

#### RadialOrbitalUI (Root)
```typescript
interface RadialOrbitalUIProps {
  initialState?: OrbitalState;
  onStateChange?: (state: OrbitalState) => void;
}
```
- Main container, centers the orbital workspace
- Manages responsive scaling

#### OrbitalCanvas
```typescript
interface OrbitalCanvasProps {
  centerPosition: Position;
  radius: number;
  zones: ZoneConfig[];
  mainImage: MainImage | null;
  nodes: OrbitalNode[];
  selectedNodeId: string | null;
  onNodeDrag: (id: string, position: PolarPosition) => void;
  onNodeSelect: (id: string | null) => void;
  onNodeDrop: (image: LibraryImage, position: PolarPosition) => void;
  onNodeRemove: (id: string) => void;
}
```
- Circular canvas area
- Fixed dimensions based on viewport
- Handles all orbital interactions

#### InfluenceZones
```typescript
interface InfluenceZonesProps {
  centerPosition: Position;
  outerRadius: number;
  zones: Array<{
    radiusPercent: number;  // 0.33, 0.66, 1.0
    label: string;
    color: string;
  }>;
  showLabels: boolean;
}
```
- Concentric rings visualization
- Labels at 3, 6, 9, 12 o'clock positions
- Gradient fill indicating influence falloff

#### CentralImage
```typescript
interface CentralImageProps {
  image: MainImage;
  size: number;  // Diameter in pixels
  glowIntensity: number;  // Based on active nodes
  isDropTarget: boolean;
  onClick: () => void;
}
```
- Fixed at exact center
- Size: 180px diameter default
- Pulsing glow effect

#### OrbitalNode
```typescript
interface OrbitalNodeProps {
  node: OrbitalNode;
  centerPosition: Position;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDrag: (position: Position) => void;
  onDragEnd: () => void;
}
```
- 60px diameter circular thumbnail
- Positioned using polar coordinates
- Shows type badge and strength indicator

#### ConnectionBeam
```typescript
interface ConnectionBeamProps {
  from: Position;  // Node position
  to: Position;    // Center position
  strength: number;
  nodeType: NodeType;
  isActive: boolean;
  animated: boolean;
}
```
- Gradient beam from node to center
- Width and opacity based on strength
- Particle/energy animation optional

#### NodeDetailPanel
```typescript
interface NodeDetailPanelProps {
  node: OrbitalNode | null;
  onUpdate: (updates: Partial<OrbitalNode>) => void;
  onDelete: () => void;
  onClose: () => void;
  position: 'modal' | 'slide-over';
}
```
- Opens on node selection
- Modal or slide-over depending on screen size
- Full node configuration

---

## State Management

### State Shape

```typescript
interface OrbitalState {
  // Main image
  mainImage: MainImage | null;

  // Orbital nodes
  nodes: OrbitalNode[];

  // Selection
  selectedNodeId: string | null;

  // Image library
  library: LibraryImage[];

  // Canvas configuration
  canvas: {
    centerX: number;
    centerY: number;
    radius: number;
    zones: ZoneConfig[];
  };

  // UI state
  ui: {
    showZoneLabels: boolean;
    animateBeams: boolean;
    showDetailPanel: boolean;
  };

  // History
  history: HistoryState;
}

interface OrbitalNode {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;

  // Polar position
  angle: number;      // 0-360 degrees
  distance: number;   // 0-1 (normalized radius)

  // Configuration
  nodeType: NodeType;
  strength: number;   // Calculated from distance, but can be overridden
  strengthOverride: boolean;
  isActive: boolean;

  // Advanced
  mask?: MaskData;
  notes?: string;
}

interface ZoneConfig {
  id: string;
  radiusPercent: number;  // 0-1
  label: string;
  minStrength: number;    // Strength at outer edge
  maxStrength: number;    // Strength at inner edge
  color: string;
}

// Default zones
const defaultZones: ZoneConfig[] = [
  {
    id: 'high',
    radiusPercent: 0.33,
    label: 'High Influence',
    minStrength: 67,
    maxStrength: 100,
    color: '#22c55e'
  },
  {
    id: 'medium',
    radiusPercent: 0.66,
    label: 'Medium Influence',
    minStrength: 34,
    maxStrength: 66,
    color: '#eab308'
  },
  {
    id: 'low',
    radiusPercent: 1.0,
    label: 'Low Influence',
    minStrength: 0,
    maxStrength: 33,
    color: '#64748b'
  }
];
```

### State Update Patterns

```typescript
type OrbitalAction =
  | { type: 'SET_MAIN_IMAGE'; payload: MainImage }
  | { type: 'ADD_NODE'; payload: OrbitalNode }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<OrbitalNode> } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'MOVE_NODE'; payload: { id: string; angle: number; distance: number } }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'ADD_LIBRARY_IMAGE'; payload: LibraryImage }
  | { type: 'UPDATE_CANVAS'; payload: Partial<OrbitalState['canvas']> }
  | { type: 'TOGGLE_ZONE_LABELS' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// Calculate strength from distance
function calculateStrength(distance: number, zones: ZoneConfig[]): number {
  // Linear interpolation based on distance
  // distance 0 = 100% strength
  // distance 1 = 0% strength
  return Math.round((1 - distance) * 100);
}

// Calculate distance from strength
function calculateDistance(strength: number): number {
  return 1 - (strength / 100);
}
```

---

## Data Structures

### TypeScript Interfaces

```typescript
// Polar coordinate system
interface PolarPosition {
  angle: number;    // Degrees, 0 = right, 90 = bottom
  distance: number; // 0 = center, 1 = outer edge
}

// Cartesian position
interface CartesianPosition {
  x: number;
  y: number;
}

// Conversion functions
function polarToCartesian(
  polar: PolarPosition,
  center: CartesianPosition,
  radius: number
): CartesianPosition {
  const radians = (polar.angle * Math.PI) / 180;
  return {
    x: center.x + Math.cos(radians) * polar.distance * radius,
    y: center.y + Math.sin(radians) * polar.distance * radius
  };
}

function cartesianToPolar(
  point: CartesianPosition,
  center: CartesianPosition,
  radius: number
): PolarPosition {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy) / radius;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return { angle, distance: Math.min(distance, 1) };
}

// Zone boundary detection
interface ZoneBoundary {
  zone: ZoneConfig;
  isEntering: boolean;
  isLeaving: boolean;
}

function detectZoneCrossing(
  oldDistance: number,
  newDistance: number,
  zones: ZoneConfig[]
): ZoneBoundary | null {
  for (const zone of zones) {
    const threshold = zone.radiusPercent;
    if (oldDistance < threshold && newDistance >= threshold) {
      return { zone, isEntering: false, isLeaving: true };
    }
    if (oldDistance >= threshold && newDistance < threshold) {
      return { zone, isEntering: true, isLeaving: false };
    }
  }
  return null;
}

// Serialization format
interface OrbitalConfiguration {
  version: string;
  mainImage: {
    src: string;
    name: string;
  } | null;
  references: Array<{
    src: string;
    name: string;
    angle: number;
    distance: number;
    nodeType: NodeType;
    strengthOverride: boolean;
    strength?: number;
    mask?: MaskData;
    notes?: string;
  }>;
}
```

---

## Interaction Handlers

### Node Dragging

```typescript
const handleNodeDrag = {
  onDragStart: (nodeId: string, e: MouseEvent | TouchEvent) => {
    selectNode(nodeId);
    setDraggingNode(nodeId);
    setDragOffset(calculateDragOffset(e, node));

    // Add dragging styles
    addDraggingClass(nodeId);
  },

  onDrag: (e: MouseEvent | TouchEvent) => {
    if (!draggingNode) return;

    const point = getEventPosition(e);
    const polar = cartesianToPolar(point, center, radius);

    // Check zone crossing for feedback
    const currentNode = getNode(draggingNode);
    const crossing = detectZoneCrossing(
      currentNode.distance,
      polar.distance,
      zones
    );

    if (crossing) {
      // Provide haptic/visual feedback
      triggerZoneFeedback(crossing);
    }

    // Update node position
    moveNode(draggingNode, polar);
  },

  onDragEnd: (e: MouseEvent | TouchEvent) => {
    if (!draggingNode) return;

    const point = getEventPosition(e);
    const polar = cartesianToPolar(point, center, radius);

    // Check if dragged outside
    if (polar.distance > 1.2) {
      // Remove node with animation
      removeNodeWithAnimation(draggingNode);
    } else {
      // Clamp to valid range and snap to position
      const clampedPolar = {
        angle: polar.angle,
        distance: Math.min(polar.distance, 1)
      };
      moveNode(draggingNode, clampedPolar);
    }

    setDraggingNode(null);
    removeDraggingClass();
  }
};
```

### Node Selection

```typescript
const handleNodeSelect = (nodeId: string, e: MouseEvent | TouchEvent) => {
  e.stopPropagation();

  if (selectedNodeId === nodeId) {
    // Already selected - open detail panel
    openDetailPanel();
  } else {
    // Select the node
    selectNode(nodeId);
  }
};

const handleNodeDoubleClick = (nodeId: string) => {
  selectNode(nodeId);
  openDetailPanel();
};

const handleCanvasClick = (e: MouseEvent | TouchEvent) => {
  // Click on empty space deselects
  if (!isOverNode(e)) {
    deselectAll();
    closeDetailPanel();
  }
};
```

### Adding Nodes

```typescript
const handleAddNode = (image: LibraryImage) => {
  // Find a good position for new node
  const position = findAvailablePosition(nodes);

  const newNode: OrbitalNode = {
    id: generateId(),
    imageId: image.id,
    imageSrc: image.src,
    imageThumbnail: image.thumbnail,
    name: image.name,
    angle: position.angle,
    distance: 0.5, // Start in medium zone
    nodeType: image.suggestedType || NodeType.STYLE,
    strength: 50,
    strengthOverride: false,
    isActive: true
  };

  addNode(newNode);
  selectNode(newNode.id);
};

// Find position that doesn't overlap with existing nodes
function findAvailablePosition(nodes: OrbitalNode[]): PolarPosition {
  const occupiedAngles = nodes.map(n => n.angle);
  const minGap = 30; // Minimum 30 degrees between nodes

  // Find largest gap
  if (occupiedAngles.length === 0) {
    return { angle: 0, distance: 0.5 };
  }

  occupiedAngles.sort((a, b) => a - b);

  let maxGap = 0;
  let gapStart = 0;

  for (let i = 0; i < occupiedAngles.length; i++) {
    const next = occupiedAngles[(i + 1) % occupiedAngles.length];
    const current = occupiedAngles[i];
    let gap = next - current;
    if (gap < 0) gap += 360;

    if (gap > maxGap) {
      maxGap = gap;
      gapStart = current;
    }
  }

  return {
    angle: (gapStart + maxGap / 2) % 360,
    distance: 0.5
  };
}
```

### Zone Feedback

```typescript
const triggerZoneFeedback = (crossing: ZoneBoundary) => {
  // Visual feedback
  highlightZone(crossing.zone.id);

  // Optional haptic feedback (mobile)
  if ('vibrate' in navigator) {
    navigator.vibrate(crossing.isEntering ? [50] : [30, 30]);
  }

  // Audio feedback (optional)
  if (soundEnabled) {
    playZoneSound(crossing.isEntering ? 'enter' : 'exit');
  }

  // Announce for screen readers
  announceZoneChange(crossing);
};
```

### Keyboard Navigation

```typescript
const keyboardShortcuts = {
  // Node selection
  'Tab': selectNextNode,
  'Shift+Tab': selectPreviousNode,

  // Node movement
  'ArrowUp': () => adjustDistance(-0.1),
  'ArrowDown': () => adjustDistance(0.1),
  'ArrowLeft': () => adjustAngle(-15),
  'ArrowRight': () => adjustAngle(15),

  // Fine adjustments
  'Shift+ArrowUp': () => adjustDistance(-0.02),
  'Shift+ArrowDown': () => adjustDistance(0.02),
  'Shift+ArrowLeft': () => adjustAngle(-5),
  'Shift+ArrowRight': () => adjustAngle(5),

  // Actions
  'Enter': openDetailPanel,
  'Space': toggleNodeActive,
  'Delete': deleteSelectedNode,
  'Escape': deselectAll,

  // Undo/Redo
  'Ctrl+Z': undo,
  'Ctrl+Shift+Z': redo
};
```

---

## Visual Design Specifications

### Color Palette

```css
/* Central glow */
--center-glow-base: rgba(99, 102, 241, 0.3);
--center-glow-active: rgba(99, 102, 241, 0.6);

/* Zone colors */
--zone-high: rgba(34, 197, 94, 0.15);
--zone-high-border: rgba(34, 197, 94, 0.4);
--zone-medium: rgba(234, 179, 8, 0.12);
--zone-medium-border: rgba(234, 179, 8, 0.35);
--zone-low: rgba(100, 116, 139, 0.08);
--zone-low-border: rgba(100, 116, 139, 0.25);

/* Beam colors (match node types) */
--beam-gradient-start: var(--node-type-color);
--beam-gradient-end: transparent;

/* Background */
--orbital-bg: radial-gradient(
  circle at center,
  #f8fafc 0%,
  #f1f5f9 50%,
  #e2e8f0 100%
);
```

### Zone Visualization

```
         Low Influence
       ╭─────────────────╮
      ╱                   ╲
     ╱   Medium Influence  ╲
    ╱  ╭─────────────────╮  ╲
   ╱  ╱                   ╲  ╲
  │  │   High Influence    │  │
  │  │  ╭───────────────╮  │  │
  │  │  │               │  │  │
  │  │  │     MAIN      │  │  │
  │  │  │     IMAGE     │  │  │
  │  │  │               │  │  │
  │  │  ╰───────────────╯  │  │
  │  │                     │  │
   ╲  ╲                   ╱  ╱
    ╲  ╰─────────────────╯  ╱
     ╲                     ╱
      ╲                   ╱
       ╰─────────────────╯
```

### Node Design

```
     ┌──────────┐
    ╱            ╲
   │   ┌──────┐   │  ← 60px diameter
   │   │ Img  │   │
   │   │      │   │
   │   └──────┘   │
   │   ┌─┐        │  ← Type badge
   │   └─┘        │
    ╲            ╱
     └──────────┘
         ↑
    Strength ring (glow intensity)
```

### Connection Beam Design

```
Node ●━━━━━━━━━━━━━━● Center

Beam properties:
- Gradient: Node color → transparent toward center
- Width: 2px (far) to 8px (close)
- Opacity: 0.3 (far) to 0.9 (close)
- Optional particle animation along beam
- Glow effect matching node type color
```

### Animations

```css
/* Node enter */
@keyframes nodeEnter {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  duration: 400ms;
  easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Node exit (drag off) */
@keyframes nodeExit {
  to {
    transform: scale(0) translateY(-50px);
    opacity: 0;
  }
  duration: 300ms;
  easing: ease-in;
}

/* Zone crossing */
@keyframes zonePulse {
  0% { opacity: 0.15; }
  50% { opacity: 0.4; }
  100% { opacity: 0.15; }
  duration: 300ms;
}

/* Central glow pulse */
@keyframes centerPulse {
  0% { box-shadow: 0 0 20px var(--center-glow-base); }
  50% { box-shadow: 0 0 40px var(--center-glow-active); }
  100% { box-shadow: 0 0 20px var(--center-glow-base); }
  duration: 2s;
  iteration: infinite;
}

/* Beam flow */
@keyframes beamFlow {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
  duration: 1s;
  iteration: infinite;
}

/* Drag feedback */
@keyframes dragScale {
  transform: scale(1.15);
  transition: 150ms ease-out;
}
```

### Typography

```css
/* Zone labels */
--zone-label: 600 11px/1 'Inter';
letter-spacing: 0.5px;
text-transform: uppercase;
color: var(--zone-border-color);

/* Node name (tooltip) */
--node-tooltip: 500 12px/1.3 'Inter';
color: var(--color-text-primary);

/* Strength indicator */
--strength-display: 700 10px/1 'Inter';
color: white;
```

---

## Responsive Behavior

### Desktop (1920px, 1440px, 1280px)

```
┌─────────────────────────────────────────────────────────┐
│                      Toolbar                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   ╭───────────────╮                     │
│                  ╱                 ╲                    │
│                 ╱   ╭───────────╮   ╲                   │
│                │   ╱             ╲   │                  │
│                │  │   ┌─────┐    │  │                   │
│                │  │   │MAIN │    │  │                   │
│                │  │   └─────┘    │  │  ← radius: min(vh, vw) * 0.4
│                │   ╲             ╱   │                  │
│                 ╲   ╰───────────╯   ╱                   │
│                  ╲                 ╱                    │
│                   ╰───────────────╯                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [+ Add]     Library thumbnails...        [Generate]    │
└─────────────────────────────────────────────────────────┘
```

- Canvas: Square, centered
- Radius: 40% of viewport minimum dimension
- Main image: 180px
- Nodes: 60px
- Detail panel: Modal overlay

### Tablet (1024px, 768px)

```
┌───────────────────────────────────────────┐
│                 Toolbar                   │
├───────────────────────────────────────────┤
│                                           │
│            ╭─────────────────╮            │
│           ╱                   ╲           │
│          │    ┌─────────┐     │           │
│          │    │  MAIN   │     │           │
│          │    └─────────┘     │           │
│           ╲                   ╱           │
│            ╰─────────────────╯            │
│                                           │
├───────────────────────────────────────────┤
│ [+Add]  Scrollable library    [Generate]  │
└───────────────────────────────────────────┘
```

- Radius: 35% of viewport width
- Main image: 150px
- Nodes: 54px
- Detail panel: Bottom sheet

### Mobile (428px, 375px)

```
┌─────────────────────────┐
│        Toolbar          │
├─────────────────────────┤
│                         │
│     ╭───────────────╮   │
│    ╱                 ╲  │
│   │   ┌─────────┐    │  │
│   │   │  MAIN   │    │  │
│   │   └─────────┘    │  │
│    ╲                 ╱  │
│     ╰───────────────╯   │
│                         │
├─────────────────────────┤
│  [+]  [Generate]        │
└─────────────────────────┘
```

- Radius: 45% of viewport width
- Main image: 120px
- Nodes: 48px
- Library: Fullscreen modal
- Detail panel: Fullscreen modal
- Touch-optimized drag

---

## Accessibility Requirements

### Keyboard Navigation

```typescript
const keyboardNavigation = {
  // Navigate between nodes in angular order
  tabOrder: 'angular', // 0° → 360°

  // Spatial navigation
  arrowKeys: {
    up: 'decrease distance (stronger)',
    down: 'increase distance (weaker)',
    left: 'rotate counter-clockwise',
    right: 'rotate clockwise'
  }
};
```

### Screen Reader Considerations

```typescript
const ariaLabels = {
  canvas: 'Orbital influence canvas with {n} reference images around the main image',
  mainImage: 'Main image at center: {name}',
  node: '{name}, {type} reference, at {distance}% distance, {strength}% influence',
  zone: '{label} zone, {minStrength}% to {maxStrength}% influence',
  addButton: 'Add reference image',
  removeButton: 'Remove {name} from orbit'
};

const liveRegions = {
  nodeAdded: '{name} added to orbit at medium influence',
  nodeRemoved: '{name} removed from orbit',
  zoneCrossed: '{name} moved to {zone} zone, now {strength}% influence',
  strengthChanged: '{name} influence changed to {strength}%'
};
```

### Focus Management

```typescript
const focusManagement = {
  // Navigate in angular order
  getNextNode: (currentNode) => {
    const sorted = nodes.sort((a, b) => a.angle - b.angle);
    const index = sorted.findIndex(n => n.id === currentNode.id);
    return sorted[(index + 1) % sorted.length];
  },

  // Focus trap in detail panel
  detailPanelTrap: true,

  // Return focus on panel close
  returnFocusOnClose: true
};
```

### ARIA Attributes

```tsx
// Canvas container
<div
  role="application"
  aria-label={`Orbital canvas with ${nodes.length} reference images`}
  aria-describedby="orbital-instructions"
>

// Zone (decorative but described)
<circle
  role="img"
  aria-label={`${zone.label} zone`}
/>

// Node
<div
  role="button"
  aria-label={`${node.name}, ${getZoneName(node.distance)} influence`}
  aria-describedby={`node-${node.id}-details`}
  aria-pressed={isSelected}
  tabIndex={0}
>

// Central image
<div
  role="img"
  aria-label={`Main image: ${mainImage.name}`}
>

// Hidden description for each node
<span id={`node-${node.id}-details`} className="sr-only">
  {node.nodeType} reference at {Math.round(node.angle)} degrees,
  {Math.round(node.strength)}% influence strength.
  Drag to adjust position and influence.
</span>
```

---

## Performance Considerations

### Rendering Optimizations

```typescript
// Memoize node components
const OrbitalNode = React.memo(({ node, ... }) => {
  // Render
}, (prev, next) => {
  return (
    prev.node.angle === next.node.angle &&
    prev.node.distance === next.node.distance &&
    prev.isSelected === next.isSelected
  );
});

// Throttle drag updates
const throttledMove = useThrottle(moveNode, 16); // 60fps

// Batch zone calculations
const zoneCalculations = useMemo(() => {
  return nodes.map(node => ({
    id: node.id,
    zone: getZone(node.distance),
    strength: calculateStrength(node.distance)
  }));
}, [nodes]);
```

### Animation Performance

```typescript
// Use CSS transforms for node positioning
const nodeStyle = useMemo(() => {
  const pos = polarToCartesian(
    { angle: node.angle, distance: node.distance },
    center,
    radius
  );
  return {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    transition: isDragging ? 'none' : 'transform 150ms ease-out'
  };
}, [node.angle, node.distance, isDragging]);

// GPU-accelerated beam animation
const beamStyle = {
  willChange: 'stroke-dashoffset',
  transform: 'translateZ(0)'
};
```

---

## Implementation Notes

### Recommended Libraries

- **Drag handling**: @dnd-kit/core or react-use-gesture
- **Animations**: Framer Motion
- **SVG rendering**: Native SVG with React
- **Touch gestures**: react-use-gesture

### Polar Coordinate Utilities

```typescript
// utilities/polar.ts
export const polarUtils = {
  toCartesian: (polar, center, radius) => {...},
  toPolar: (point, center, radius) => {...},
  normalizeAngle: (angle) => ((angle % 360) + 360) % 360,
  angleBetween: (a1, a2) => {...},
  interpolate: (from, to, t) => {...}
};
```

### File Structure

```
/components/radial-orbital/
  RadialOrbitalUI.tsx
  OrbitalCanvas.tsx
  CentralImage.tsx
  OrbitalNode.tsx
  InfluenceZones.tsx
  ConnectionBeam.tsx
  NodeDetailPanel.tsx
  UploadArea.tsx
  hooks/
    usePolarDrag.ts
    useZoneFeedback.ts
  utils/
    polar.ts
    zones.ts
```
