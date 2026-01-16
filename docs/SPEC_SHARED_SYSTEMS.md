# Shared Systems Specification

## Overview

This document specifies the systems and data structures shared across all five UI paradigms. These systems ensure consistency, enable seamless paradigm switching, and provide a unified foundation for the prototype.

---

## Image Upload System

### Upload Flow

```typescript
interface UploadConfig {
  maxFileSize: number;       // 10MB default
  acceptedFormats: string[]; // ['image/jpeg', 'image/png', 'image/webp']
  maxDimensions: {
    width: number;           // 4096px
    height: number;          // 4096px
  };
  thumbnailSize: {
    width: number;           // 128px
    height: number;          // 128px
  };
}

const defaultUploadConfig: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxDimensions: { width: 4096, height: 4096 },
  thumbnailSize: { width: 128, height: 128 }
};
```

### Upload States

```typescript
type UploadState =
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'validating'; file: File }
  | { status: 'processing'; file: File; progress: number }
  | { status: 'complete'; image: LibraryImage }
  | { status: 'error'; error: UploadError };

interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'DIMENSIONS_EXCEEDED' | 'PROCESSING_FAILED';
  message: string;
  details?: Record<string, any>;
}
```

### Upload Processing Pipeline

```typescript
async function processUpload(file: File): Promise<LibraryImage> {
  // 1. Validate file
  validateFile(file);

  // 2. Read as data URL
  const dataUrl = await readFileAsDataUrl(file);

  // 3. Validate dimensions
  const dimensions = await getImageDimensions(dataUrl);
  validateDimensions(dimensions);

  // 4. Generate thumbnail
  const thumbnail = await generateThumbnail(dataUrl, thumbnailSize);

  // 5. Auto-detect influence type
  const suggestedType = await detectInfluenceType(dataUrl);

  // 6. Create library image
  return {
    id: generateId(),
    src: dataUrl,
    thumbnail,
    name: file.name.replace(/\.[^/.]+$/, ''),
    uploadedAt: new Date(),
    dimensions,
    fileSize: file.size,
    suggestedType
  };
}

// Thumbnail generation
async function generateThumbnail(
  src: string,
  size: { width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Calculate aspect-ratio-preserving dimensions
      const ratio = Math.min(size.width / img.width, size.height / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = size.width;
      canvas.height = size.height;

      // Center the image
      const x = (size.width - width) / 2;
      const y = (size.height - height) / 2;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.drawImage(img, x, y, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = src;
  });
}
```

### Library Image Structure

```typescript
interface LibraryImage {
  id: string;
  src: string;                    // Full image data URL or URL
  thumbnail: string;              // Thumbnail data URL
  name: string;                   // Display name
  uploadedAt: Date;
  dimensions: { width: number; height: number };
  fileSize: number;
  suggestedType?: NodeType;       // Auto-detected influence type
  metadata?: {
    description?: string;
    tags?: string[];
    source?: string;
  };
}
```

### Upload Zone Component Interface

```typescript
interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  onError: (error: UploadError) => void;
  isUploading: boolean;
  progress?: number;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  children?: React.ReactNode;
}
```

---

## Node Type System

### All 12 Node Types

```typescript
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

interface NodeTypeMeta {
  type: NodeType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  icon: string;
  defaultStrength: number;
  category: 'appearance' | 'structure' | 'subject' | 'special';
}

const nodeTypes: Record<NodeType, NodeTypeMeta> = {
  [NodeType.STYLE]: {
    type: NodeType.STYLE,
    label: 'Style Transfer',
    shortLabel: 'Style',
    description: 'Apply artistic style, mood, or visual treatment',
    color: '#8b5cf6',  // Purple
    icon: 'palette',
    defaultStrength: 75,
    category: 'appearance'
  },
  [NodeType.OBJECT]: {
    type: NodeType.OBJECT,
    label: 'Object Injection',
    shortLabel: 'Object',
    description: 'Add or replace specific objects',
    color: '#3b82f6',  // Blue
    icon: 'box',
    defaultStrength: 80,
    category: 'subject'
  },
  [NodeType.COLOR]: {
    type: NodeType.COLOR,
    label: 'Color Palette',
    shortLabel: 'Color',
    description: 'Apply color palette from reference',
    color: '#f59e0b',  // Amber
    icon: 'droplet',
    defaultStrength: 60,
    category: 'appearance'
  },
  [NodeType.TEXTURE]: {
    type: NodeType.TEXTURE,
    label: 'Material/Texture',
    shortLabel: 'Texture',
    description: 'Apply surface textures and materials',
    color: '#10b981',  // Emerald
    icon: 'grid-3x3',
    defaultStrength: 50,
    category: 'appearance'
  },
  [NodeType.POSE]: {
    type: NodeType.POSE,
    label: 'Pose Reference',
    shortLabel: 'Pose',
    description: 'Match body pose or position',
    color: '#ec4899',  // Pink
    icon: 'person-standing',
    defaultStrength: 85,
    category: 'structure'
  },
  [NodeType.LIGHTING]: {
    type: NodeType.LIGHTING,
    label: 'Lighting Reference',
    shortLabel: 'Lighting',
    description: 'Match lighting setup and shadows',
    color: '#f97316',  // Orange
    icon: 'sun',
    defaultStrength: 70,
    category: 'appearance'
  },
  [NodeType.COMPOSITION]: {
    type: NodeType.COMPOSITION,
    label: 'Composition',
    shortLabel: 'Composition',
    description: 'Match spatial layout and arrangement',
    color: '#06b6d4',  // Cyan
    icon: 'layout-grid',
    defaultStrength: 65,
    category: 'structure'
  },
  [NodeType.FACE]: {
    type: NodeType.FACE,
    label: 'Face/Identity',
    shortLabel: 'Face',
    description: 'Preserve facial features and likeness',
    color: '#ef4444',  // Red
    icon: 'user',
    defaultStrength: 90,
    category: 'subject'
  },
  [NodeType.BACKGROUND]: {
    type: NodeType.BACKGROUND,
    label: 'Background',
    shortLabel: 'Background',
    description: 'Replace or blend background environment',
    color: '#84cc16',  // Lime
    icon: 'image',
    defaultStrength: 75,
    category: 'structure'
  },
  [NodeType.DEPTH]: {
    type: NodeType.DEPTH,
    label: 'Depth/Perspective',
    shortLabel: 'Depth',
    description: 'Match camera angle and depth of field',
    color: '#6366f1',  // Indigo
    icon: 'move-3d',
    defaultStrength: 70,
    category: 'structure'
  },
  [NodeType.NEGATIVE]: {
    type: NodeType.NEGATIVE,
    label: 'Negative (Exclusion)',
    shortLabel: 'Avoid',
    description: 'Exclude these elements from generation',
    color: '#64748b',  // Slate
    icon: 'ban',
    defaultStrength: 80,
    category: 'special'
  }
};

// Helper functions
function getNodeTypeMeta(type: NodeType): NodeTypeMeta {
  return nodeTypes[type];
}

function getNodeTypeColor(type: NodeType): string {
  return nodeTypes[type].color;
}

function getNodeTypeIcon(type: NodeType): string {
  return nodeTypes[type].icon;
}

function getNodeTypesByCategory(category: string): NodeTypeMeta[] {
  return Object.values(nodeTypes).filter(t => t.category === category);
}
```

### Node Type Selector Component Interface

```typescript
interface NodeTypeSelectorProps {
  value: NodeType;
  onChange: (type: NodeType) => void;
  showDescription?: boolean;
  variant?: 'dropdown' | 'grid' | 'inline';
  disabled?: boolean;
}
```

---

## Influence Strength System

### Strength Representation

```typescript
// Strength is always stored as 0-100 integer
type StrengthValue = number; // 0-100

// Different visual representations
interface StrengthDisplay {
  percentage: string;      // "75%"
  decimal: string;         // "0.75"
  culinary: string;        // "A generous helping"
  bar: number;             // 0.75 (for progress bars)
  opacity: number;         // 0.75 (for visual opacity)
  distance: number;        // Inverse: 0.25 (for orbital distance)
}

function getStrengthDisplay(value: number): StrengthDisplay {
  const normalized = value / 100;
  return {
    percentage: `${value}%`,
    decimal: normalized.toFixed(2),
    culinary: getCulinaryTerm(value),
    bar: normalized,
    opacity: 0.3 + (normalized * 0.7), // Never fully transparent
    distance: 1 - normalized
  };
}

// Culinary terms mapping
const culinaryTerms = [
  { min: 0, max: 10, term: 'A whisper' },
  { min: 11, max: 25, term: 'A pinch' },
  { min: 26, max: 40, term: 'A dash' },
  { min: 41, max: 55, term: 'A spoonful' },
  { min: 56, max: 70, term: 'A portion' },
  { min: 71, max: 85, term: 'A generous helping' },
  { min: 86, max: 100, term: 'The whole thing' }
];

function getCulinaryTerm(value: number): string {
  const term = culinaryTerms.find(t => value >= t.min && value <= t.max);
  return term?.term || 'A portion';
}
```

### Visual Representation by Paradigm

```typescript
// Canvas + Sidebar
interface CanvasStrengthVisual {
  lineThickness: number;    // 2-6px based on strength
  lineOpacity: number;      // 0.4-1.0 based on strength
  nodeRingSize: number;     // Visual ring thickness
}

// Radial/Orbital
interface OrbitalStrengthVisual {
  distanceFromCenter: number; // Inverse of strength
  beamWidth: number;          // Thicker = stronger
  beamOpacity: number;        // More opaque = stronger
}

// Node Graph
interface NodeGraphStrengthVisual {
  wireThickness: number;
  parameterValue: number;    // Displayed in node
}

// Recipe
interface RecipeStrengthVisual {
  sliderPosition: number;    // 0-100%
  culinaryLabel: string;     // Term display
  fillAmount: number;        // Visual bar fill
}

// Layers
interface LayersStrengthVisual {
  opacity: number;           // Layer opacity = strength
  sliderPosition: number;
}
```

### Strength Slider Component Interface

```typescript
interface StrengthSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;          // Default 0
  max?: number;          // Default 100
  step?: number;         // Default 1
  showValue?: boolean;
  showCulinary?: boolean;
  color?: string;        // Node type color
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
}
```

---

## Mock Generation System

### Generation Configuration

```typescript
interface GenerationConfig {
  mockDelay: number;         // 3000-5000ms
  showProgress: boolean;
  progressSteps: number;     // Number of progress updates
  resultMode: 'blend' | 'overlay' | 'original';
}

const defaultGenerationConfig: GenerationConfig = {
  mockDelay: 4000,
  showProgress: true,
  progressSteps: 10,
  resultMode: 'blend'
};
```

### Generation States

```typescript
interface GenerationState {
  status: 'idle' | 'preparing' | 'generating' | 'complete' | 'error';
  progress: number;          // 0-100
  currentStep?: string;      // "Analyzing style...", "Applying colors..."
  startedAt?: Date;
  completedAt?: Date;
  resultImage?: string;
  error?: GenerationError;
}

interface GenerationError {
  code: string;
  message: string;
}

// Progress step messages
const generationSteps = [
  { progress: 0, message: 'Preparing images...' },
  { progress: 10, message: 'Analyzing references...' },
  { progress: 25, message: 'Extracting features...' },
  { progress: 40, message: 'Processing style...' },
  { progress: 55, message: 'Applying influences...' },
  { progress: 70, message: 'Blending elements...' },
  { progress: 85, message: 'Refining details...' },
  { progress: 95, message: 'Finalizing...' },
  { progress: 100, message: 'Complete!' }
];
```

### Mock Generation Function

```typescript
async function mockGenerate(
  mainImage: LibraryImage,
  references: ReferenceConfig[],
  config: GenerationConfig = defaultGenerationConfig
): Promise<string> {
  const onProgress = (progress: number, message: string) => {
    // Update generation state
  };

  // Simulate generation with progress
  for (const step of generationSteps) {
    await delay(config.mockDelay / generationSteps.length);
    onProgress(step.progress, step.message);
  }

  // Generate mock result
  return generateMockResult(mainImage, references, config.resultMode);
}

// Mock result generation
async function generateMockResult(
  mainImage: LibraryImage,
  references: ReferenceConfig[],
  mode: 'blend' | 'overlay' | 'original'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Load main image
  const img = await loadImage(mainImage.src);
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Apply mock effects based on references
  if (mode === 'blend' || mode === 'overlay') {
    // Add subtle color tint from color references
    const colorRef = references.find(r => r.type === NodeType.COLOR);
    if (colorRef) {
      const avgColor = await getAverageColor(colorRef.imageSrc);
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = colorRef.strength / 200; // Subtle effect
      ctx.fillStyle = avgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Add vignette for style effect
    const styleRef = references.find(r => r.type === NodeType.STYLE);
    if (styleRef) {
      addVignette(ctx, canvas.width, canvas.height, styleRef.strength / 100);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
```

### Loading States Component Interface

```typescript
interface GenerationOverlayProps {
  state: GenerationState;
  onCancel?: () => void;
  showPreview?: boolean;
}

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  variant?: 'bar' | 'circular' | 'dots';
}
```

---

## Shared State Interface

### Common State Structure

```typescript
// Core reference configuration shared across paradigms
interface ReferenceConfig {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;
  type: NodeType;
  strength: number;        // 0-100
  isActive: boolean;

  // Optional advanced settings
  mask?: MaskData;
  blendMode?: BlendMode;
  notes?: string;
}

// Main/Base image
interface MainImage {
  id: string;
  src: string;
  thumbnail: string;
  name: string;
  dimensions: { width: number; height: number };
}

// Common state that can be shared across paradigms
interface SharedState {
  // Core data
  mainImage: MainImage | null;
  references: ReferenceConfig[];
  library: LibraryImage[];

  // Generation
  generation: GenerationState;

  // Result
  result: {
    imageSrc: string | null;
    generatedAt: Date | null;
    configuration: ReferenceConfig[];
  };
}
```

### Paradigm-Specific Extensions

```typescript
// Each paradigm extends SharedState with its own state
interface CanvasState extends SharedState {
  transform: CanvasTransform;
  nodePositions: Record<string, Position>;
  selectedNodeId: string | null;
  ui: CanvasUIState;
}

interface OrbitalState extends SharedState {
  nodePositions: Record<string, PolarPosition>;
  selectedNodeId: string | null;
  ui: OrbitalUIState;
}

interface NodeGraphState extends SharedState {
  nodes: GraphNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  ui: NodeGraphUIState;
}

interface RecipeState extends SharedState {
  ingredientOrder: string[];
  expandedIngredientId: string | null;
  amountMode: 'percentage' | 'culinary';
  ui: RecipeUIState;
}

interface LayersState extends SharedState {
  layerOrder: string[];
  selectedLayerId: string | null;
  layerSettings: Record<string, LayerSettings>;
  ui: LayersUIState;
}
```

### State Conversion Functions

```typescript
// Convert from shared state to paradigm state
function toCanvasState(shared: SharedState): Partial<CanvasState> {
  return {
    mainImage: shared.mainImage,
    references: shared.references,
    library: shared.library,
    nodePositions: generateDefaultPositions(shared.references),
    // ... paradigm-specific defaults
  };
}

function toOrbitalState(shared: SharedState): Partial<OrbitalState> {
  return {
    mainImage: shared.mainImage,
    references: shared.references,
    library: shared.library,
    nodePositions: generateOrbitalPositions(shared.references),
    // ...
  };
}

// Convert from paradigm state back to shared
function toSharedState(paradigmState: CanvasState | OrbitalState | ...): SharedState {
  return {
    mainImage: paradigmState.mainImage,
    references: paradigmState.references,
    library: paradigmState.library,
    generation: paradigmState.generation,
    result: paradigmState.result
  };
}
```

### Paradigm Switching

```typescript
interface ParadigmSwitcher {
  currentParadigm: ParadigmType;
  sharedState: SharedState;

  switchTo: (paradigm: ParadigmType) => void;
  getParadigmState: <T>(paradigm: ParadigmType) => T;
  syncSharedState: (updates: Partial<SharedState>) => void;
}

type ParadigmType = 'canvas' | 'orbital' | 'node-graph' | 'recipe' | 'layers';

// Context for paradigm switching
const ParadigmContext = createContext<ParadigmSwitcher | null>(null);

function SharedStateProvider({ children }: { children: React.ReactNode }) {
  const [currentParadigm, setCurrentParadigm] = useState<ParadigmType>('recipe');
  const [sharedState, setSharedState] = useState<SharedState>(initialSharedState);

  const switchTo = (paradigm: ParadigmType) => {
    // Save current paradigm-specific state
    // Extract shared state
    // Switch to new paradigm
    // Initialize new paradigm with shared state
    setCurrentParadigm(paradigm);
  };

  return (
    <ParadigmContext.Provider value={{ currentParadigm, sharedState, switchTo, ... }}>
      {children}
    </ParadigmContext.Provider>
  );
}
```

---

## Export/Import Configuration

### Configuration Format

```typescript
interface ExportConfiguration {
  version: string;
  exportedAt: string;
  paradigm: ParadigmType;

  // Core data
  mainImage: {
    name: string;
    src: string;  // Data URL or external URL
  } | null;

  references: Array<{
    name: string;
    src: string;
    type: NodeType;
    strength: number;
    isActive: boolean;
    mask?: string;
    blendMode?: BlendMode;
    notes?: string;
  }>;

  // Paradigm-specific settings (optional)
  paradigmData?: Record<string, any>;
}

const EXPORT_VERSION = '1.0.0';
```

### Export Function

```typescript
async function exportConfiguration(
  state: SharedState,
  options: {
    includeImages: boolean;
    paradigm?: ParadigmType;
    paradigmData?: Record<string, any>;
  }
): Promise<string> {
  const config: ExportConfiguration = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    paradigm: options.paradigm || 'recipe',
    mainImage: state.mainImage ? {
      name: state.mainImage.name,
      src: options.includeImages ? state.mainImage.src : ''
    } : null,
    references: state.references.map(ref => ({
      name: ref.name,
      src: options.includeImages ? ref.imageSrc : '',
      type: ref.type,
      strength: ref.strength,
      isActive: ref.isActive,
      mask: ref.mask ? JSON.stringify(ref.mask) : undefined,
      blendMode: ref.blendMode,
      notes: ref.notes
    })),
    paradigmData: options.paradigmData
  };

  return JSON.stringify(config, null, 2);
}

function downloadConfiguration(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Import Function

```typescript
async function importConfiguration(
  json: string
): Promise<{ config: ExportConfiguration; warnings: string[] }> {
  const warnings: string[] = [];

  let config: ExportConfiguration;
  try {
    config = JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid JSON format');
  }

  // Validate version
  if (!config.version) {
    warnings.push('No version specified, assuming v1.0.0');
    config.version = '1.0.0';
  }

  // Validate required fields
  if (!Array.isArray(config.references)) {
    throw new Error('Invalid configuration: missing references');
  }

  // Validate node types
  config.references = config.references.map(ref => {
    if (!Object.values(NodeType).includes(ref.type)) {
      warnings.push(`Unknown node type "${ref.type}" for "${ref.name}", defaulting to style`);
      return { ...ref, type: NodeType.STYLE };
    }
    return ref;
  });

  // Validate strength values
  config.references = config.references.map(ref => {
    if (ref.strength < 0 || ref.strength > 100) {
      warnings.push(`Invalid strength ${ref.strength} for "${ref.name}", clamping to 0-100`);
      return { ...ref, strength: Math.max(0, Math.min(100, ref.strength)) };
    }
    return ref;
  });

  return { config, warnings };
}
```

### Import Dialog Interface

```typescript
interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (config: ExportConfiguration) => void;
}
```

---

## ID Generation

```typescript
// Simple ID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// For more collision resistance (if needed)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## Utilities

### Image Utilities

```typescript
// Load image and get dimensions
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Get average color from image
async function getAverageColor(src: string): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

// Resize image maintaining aspect ratio
async function resizeImage(
  src: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  const img = await loadImage(src);
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

  if (ratio >= 1) return src; // No resize needed

  const canvas = document.createElement('canvas');
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.9);
}
```

### Math Utilities

```typescript
// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Map value from one range to another
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Delay promise
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
