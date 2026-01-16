// Node Types
export enum NodeType {
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

export interface NodeTypeMeta {
  type: NodeType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  icon: string;
  defaultStrength: number;
  category: 'appearance' | 'structure' | 'subject' | 'special';
}

// Position types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PolarPosition {
  angle: number;
  distance: number;
}

// Image types
export interface LibraryImage {
  id: string;
  src: string;
  thumbnail: string;
  name: string;
  uploadedAt: Date;
  dimensions?: Size;
  suggestedType?: NodeType;
}

export interface MainImage {
  id: string;
  src: string;
  thumbnail: string;
  name: string;
  dimensions?: Size;
}

// Reference configuration (shared across paradigms)
export interface ReferenceConfig {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;
  type: NodeType;
  strength: number;
  isActive: boolean;
  mask?: MaskData;
  blendMode?: BlendMode;
  notes?: string;
}

export interface MaskData {
  type: 'all' | 'foreground' | 'background' | 'custom';
  data?: string;
}

export type BlendMode =
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

// Generation state
export interface GenerationState {
  status: 'idle' | 'preparing' | 'generating' | 'complete' | 'error';
  progress: number;
  currentStep?: string;
  startedAt?: Date;
  completedAt?: Date;
  resultImage?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Paradigm types
export type ParadigmType = 'canvas' | 'orbital' | 'node-graph' | 'recipe' | 'layers';

// Shared state
export interface SharedState {
  mainImage: MainImage | null;
  references: ReferenceConfig[];
  library: LibraryImage[];
  generation: GenerationState;
  currentParadigm: ParadigmType;
}

// Canvas state
export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

// Serialization
export interface ExportConfiguration {
  version: string;
  exportedAt: string;
  paradigm: ParadigmType;
  mainImage: {
    name: string;
    src: string;
  } | null;
  references: Array<{
    name: string;
    src: string;
    type: NodeType;
    strength: number;
    isActive: boolean;
    mask?: MaskData;
    blendMode?: BlendMode;
    notes?: string;
  }>;
}
