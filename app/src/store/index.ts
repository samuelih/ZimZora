import { create } from 'zustand';
import {
  SharedState,
  MainImage,
  LibraryImage,
  ReferenceConfig,
  NodeType,
  ParadigmType,
  GenerationState
} from '../types';
import { generateId, delay } from '../utils/helpers';

interface AppStore extends SharedState {
  // Main image actions
  setMainImage: (image: MainImage | null) => void;

  // Library actions
  addToLibrary: (image: LibraryImage) => void;
  removeFromLibrary: (id: string) => void;

  // Reference actions
  addReference: (config: Omit<ReferenceConfig, 'id'>) => void;
  updateReference: (id: string, updates: Partial<ReferenceConfig>) => void;
  removeReference: (id: string) => void;
  reorderReferences: (from: number, to: number) => void;
  toggleReferenceActive: (id: string) => void;

  // Paradigm actions
  setParadigm: (paradigm: ParadigmType) => void;

  // Generation actions
  startGeneration: () => Promise<void>;
  cancelGeneration: () => void;
  resetGeneration: () => void;

  // Import/Export
  exportConfiguration: () => string;
  importConfiguration: (json: string) => boolean;
  reset: () => void;
}

const initialGenerationState: GenerationState = {
  status: 'idle',
  progress: 0,
};

const initialState: SharedState = {
  mainImage: null,
  references: [],
  library: [],
  generation: initialGenerationState,
  currentParadigm: 'recipe',
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // Main image actions
  setMainImage: (image) => set({ mainImage: image }),

  // Library actions
  addToLibrary: (image) => set((state) => ({
    library: [...state.library, image]
  })),

  removeFromLibrary: (id) => set((state) => ({
    library: state.library.filter(img => img.id !== id)
  })),

  // Reference actions
  addReference: (config) => set((state) => ({
    references: [...state.references, { ...config, id: generateId() }]
  })),

  updateReference: (id, updates) => set((state) => ({
    references: state.references.map(ref =>
      ref.id === id ? { ...ref, ...updates } : ref
    )
  })),

  removeReference: (id) => set((state) => ({
    references: state.references.filter(ref => ref.id !== id)
  })),

  reorderReferences: (from, to) => set((state) => {
    const references = [...state.references];
    const [moved] = references.splice(from, 1);
    references.splice(to, 0, moved);
    return { references };
  }),

  toggleReferenceActive: (id) => set((state) => ({
    references: state.references.map(ref =>
      ref.id === id ? { ...ref, isActive: !ref.isActive } : ref
    )
  })),

  // Paradigm actions
  setParadigm: (paradigm) => set({ currentParadigm: paradigm }),

  // Generation actions
  startGeneration: async () => {
    const state = get();
    if (!state.mainImage) return;

    const steps = [
      { progress: 0, message: 'Preparing images...' },
      { progress: 15, message: 'Analyzing references...' },
      { progress: 30, message: 'Extracting features...' },
      { progress: 45, message: 'Processing style...' },
      { progress: 60, message: 'Applying influences...' },
      { progress: 75, message: 'Blending elements...' },
      { progress: 90, message: 'Refining details...' },
      { progress: 100, message: 'Complete!' },
    ];

    set({
      generation: {
        status: 'generating',
        progress: 0,
        currentStep: steps[0].message,
        startedAt: new Date(),
      }
    });

    for (const step of steps) {
      if (get().generation.status !== 'generating') break;
      await delay(500);
      set({
        generation: {
          ...get().generation,
          progress: step.progress,
          currentStep: step.message,
        }
      });
    }

    if (get().generation.status === 'generating') {
      set({
        generation: {
          status: 'complete',
          progress: 100,
          currentStep: 'Complete!',
          completedAt: new Date(),
          resultImage: state.mainImage.src, // Mock: just return main image
        }
      });
    }
  },

  cancelGeneration: () => set({
    generation: { ...initialGenerationState, status: 'idle' }
  }),

  resetGeneration: () => set({
    generation: initialGenerationState
  }),

  // Import/Export
  exportConfiguration: () => {
    const state = get();
    const config = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      paradigm: state.currentParadigm,
      mainImage: state.mainImage ? {
        name: state.mainImage.name,
        src: state.mainImage.src,
      } : null,
      references: state.references.map(ref => ({
        name: ref.name,
        src: ref.imageSrc,
        type: ref.type,
        strength: ref.strength,
        isActive: ref.isActive,
        mask: ref.mask,
        blendMode: ref.blendMode,
        notes: ref.notes,
      })),
    };
    return JSON.stringify(config, null, 2);
  },

  importConfiguration: (json) => {
    try {
      const config = JSON.parse(json);

      const mainImage = config.mainImage ? {
        id: generateId(),
        src: config.mainImage.src,
        thumbnail: config.mainImage.src,
        name: config.mainImage.name,
      } : null;

      const references = config.references.map((ref: any) => ({
        id: generateId(),
        imageId: generateId(),
        imageSrc: ref.src,
        imageThumbnail: ref.src,
        name: ref.name,
        type: ref.type as NodeType,
        strength: ref.strength,
        isActive: ref.isActive,
        mask: ref.mask,
        blendMode: ref.blendMode,
        notes: ref.notes,
      }));

      set({
        mainImage,
        references,
        currentParadigm: config.paradigm || 'recipe',
      });

      return true;
    } catch (e) {
      console.error('Failed to import configuration:', e);
      return false;
    }
  },

  reset: () => set(initialState),
}));

// Node type metadata
export const nodeTypes: Record<NodeType, import('../types').NodeTypeMeta> = {
  [NodeType.STYLE]: {
    type: NodeType.STYLE,
    label: 'Style Transfer',
    shortLabel: 'Style',
    description: 'Apply artistic style, mood, or visual treatment',
    color: '#8b5cf6',
    icon: 'palette',
    defaultStrength: 75,
    category: 'appearance',
  },
  [NodeType.OBJECT]: {
    type: NodeType.OBJECT,
    label: 'Object Injection',
    shortLabel: 'Object',
    description: 'Add or replace specific objects',
    color: '#3b82f6',
    icon: 'box',
    defaultStrength: 80,
    category: 'subject',
  },
  [NodeType.COLOR]: {
    type: NodeType.COLOR,
    label: 'Color Palette',
    shortLabel: 'Color',
    description: 'Apply color palette from reference',
    color: '#f59e0b',
    icon: 'droplet',
    defaultStrength: 60,
    category: 'appearance',
  },
  [NodeType.TEXTURE]: {
    type: NodeType.TEXTURE,
    label: 'Material/Texture',
    shortLabel: 'Texture',
    description: 'Apply surface textures and materials',
    color: '#10b981',
    icon: 'grid',
    defaultStrength: 50,
    category: 'appearance',
  },
  [NodeType.POSE]: {
    type: NodeType.POSE,
    label: 'Pose Reference',
    shortLabel: 'Pose',
    description: 'Match body pose or position',
    color: '#ec4899',
    icon: 'person',
    defaultStrength: 85,
    category: 'structure',
  },
  [NodeType.LIGHTING]: {
    type: NodeType.LIGHTING,
    label: 'Lighting Reference',
    shortLabel: 'Lighting',
    description: 'Match lighting setup and shadows',
    color: '#f97316',
    icon: 'sun',
    defaultStrength: 70,
    category: 'appearance',
  },
  [NodeType.COMPOSITION]: {
    type: NodeType.COMPOSITION,
    label: 'Composition',
    shortLabel: 'Composition',
    description: 'Match spatial layout and arrangement',
    color: '#06b6d4',
    icon: 'layout',
    defaultStrength: 65,
    category: 'structure',
  },
  [NodeType.FACE]: {
    type: NodeType.FACE,
    label: 'Face/Identity',
    shortLabel: 'Face',
    description: 'Preserve facial features and likeness',
    color: '#ef4444',
    icon: 'user',
    defaultStrength: 90,
    category: 'subject',
  },
  [NodeType.BACKGROUND]: {
    type: NodeType.BACKGROUND,
    label: 'Background',
    shortLabel: 'Background',
    description: 'Replace or blend background environment',
    color: '#84cc16',
    icon: 'image',
    defaultStrength: 75,
    category: 'structure',
  },
  [NodeType.DEPTH]: {
    type: NodeType.DEPTH,
    label: 'Depth/Perspective',
    shortLabel: 'Depth',
    description: 'Match camera angle and depth of field',
    color: '#6366f1',
    icon: 'move3d',
    defaultStrength: 70,
    category: 'structure',
  },
  [NodeType.NEGATIVE]: {
    type: NodeType.NEGATIVE,
    label: 'Negative (Exclusion)',
    shortLabel: 'Avoid',
    description: 'Exclude these elements from generation',
    color: '#64748b',
    icon: 'ban',
    defaultStrength: 80,
    category: 'special',
  },
};
