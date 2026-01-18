import { create } from 'zustand';
import {
  StudioAgentId,
  StudioAgentState,
  CriticPersona,
  IterationPhase,
  IdeaInput,
  FaderState,
  StyleDNA,
  BlendResult,
  ProductRecommendation,
  QualityGateStatus,
  ComputeMode,
  QualityTier,
  SubscriptionTier,
  AgentFeedback,
  studioAgentDefinitions,
} from '../types/studio';
import { generateId } from '../utils/helpers';

// Mock product catalog for demo
const mockProducts: ProductRecommendation[] = [
  {
    id: 'prod-1',
    name: 'Eames Lounge Chair',
    description: 'Iconic mid-century modern lounge chair',
    price: 5495,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200',
    purchaseUrl: 'https://example.com/eames-chair',
    matchScore: 92,
    matchedStyles: ['mid-century', 'modern', 'leather'],
    vendor: 'Design Within Reach',
    category: 'Seating',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Arco Floor Lamp',
    description: 'Marble base arc floor lamp',
    price: 2995,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200',
    purchaseUrl: 'https://example.com/arco-lamp',
    matchScore: 87,
    matchedStyles: ['modern', 'italian', 'sculptural'],
    vendor: 'FLOS',
    category: 'Lighting',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Noguchi Coffee Table',
    description: 'Sculptural glass and wood coffee table',
    price: 2195,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200',
    purchaseUrl: 'https://example.com/noguchi-table',
    matchScore: 85,
    matchedStyles: ['organic', 'modern', 'sculptural'],
    vendor: 'Herman Miller',
    category: 'Tables',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Velvet Accent Pillow',
    description: 'Luxurious velvet throw pillow',
    price: 89,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200',
    purchaseUrl: 'https://example.com/velvet-pillow',
    matchScore: 78,
    matchedStyles: ['cozy', 'luxurious', 'textured'],
    vendor: 'West Elm',
    category: 'Decor',
    inStock: true,
  },
];

interface StudioState {
  // Mixing Desk
  ideas: IdeaInput[];
  faders: Record<string, FaderState>;

  // Synthesis
  synthesisMode: 'idle' | 'preview' | 'generating' | 'complete';
  blendResult: BlendResult | null;

  // Agents
  agents: Record<StudioAgentId, StudioAgentState>;
  criticPersona: CriticPersona;
  iteration: {
    current: number;
    max: number;
    phase: IterationPhase;
  };
  qualityGate: QualityGateStatus;

  // Commerce
  productRecommendations: ProductRecommendation[];
  showProducts: boolean;

  // Compute
  computeMode: ComputeMode;
  subscriptionTier: SubscriptionTier;
  qualityTier: QualityTier;

  // UI State
  showUpgradePrompt: boolean;
}

interface StudioActions {
  // Mixing Desk Actions
  addIdea: (idea: Omit<IdeaInput, 'id' | 'styleDNA' | 'addedAt'>) => string;
  removeIdea: (ideaId: string) => void;
  updateFader: (ideaId: string, updates: Partial<FaderState>) => void;
  muteIdea: (ideaId: string) => void;
  soloIdea: (ideaId: string) => void;
  clearAllIdeas: () => void;

  // Synthesis Actions
  startSynthesis: () => Promise<void>;
  cancelSynthesis: () => void;

  // Agent Actions
  setCriticPersona: (persona: CriticPersona) => void;
  startFeedbackLoop: () => Promise<void>;
  advancePhase: () => void;
  setAgentFeedback: (agentId: StudioAgentId, feedback: AgentFeedback) => void;

  // Commerce Actions
  loadProductRecommendations: () => void;
  toggleProductsPanel: () => void;

  // Compute Actions
  setComputeMode: (mode: ComputeMode) => void;
  setQualityTier: (tier: QualityTier) => void;
  showUpgrade: () => void;
  hideUpgrade: () => void;

  // Reset
  resetStudio: () => void;
}

// Helper to extract mock StyleDNA from an image
function extractStyleDNA(): StyleDNA {
  const colors = [
    ['#2C3E50', '#E74C3C', '#ECF0F1'],
    ['#1ABC9C', '#3498DB', '#F1C40F'],
    ['#9B59B6', '#34495E', '#E67E22'],
    ['#27AE60', '#2980B9', '#8E44AD'],
  ];
  const moods = [
    ['calm', 'serene'],
    ['energetic', 'vibrant'],
    ['cozy', 'warm'],
    ['modern', 'sleek'],
  ];
  const aesthetics = [
    ['minimalist', 'scandinavian'],
    ['industrial', 'urban'],
    ['bohemian', 'eclectic'],
    ['mid-century', 'retro'],
  ];
  const patterns = [
    ['geometric', 'linear'],
    ['organic', 'flowing'],
    ['textured', 'layered'],
    ['clean', 'simple'],
  ];

  const idx = Math.floor(Math.random() * 4);
  return {
    colors: colors[idx],
    mood: moods[idx],
    aesthetics: aesthetics[idx],
    patterns: patterns[idx],
    confidence: 0.7 + Math.random() * 0.25,
  };
}

const initialAgentStates: Record<StudioAgentId, StudioAgentState> = {
  creator: {
    agent: studioAgentDefinitions.creator,
    status: 'idle',
    currentFeedback: null,
    feedbackHistory: [],
  },
  critic: {
    agent: studioAgentDefinitions.critic,
    status: 'idle',
    currentFeedback: null,
    feedbackHistory: [],
  },
  reality: {
    agent: studioAgentDefinitions.reality,
    status: 'idle',
    currentFeedback: null,
    feedbackHistory: [],
  },
  refiner: {
    agent: studioAgentDefinitions.refiner,
    status: 'idle',
    currentFeedback: null,
    feedbackHistory: [],
  },
};

const initialQualityGate: QualityGateStatus = {
  passed: false,
  overallScore: 0,
  requiredScore: 80,
  criteria: [
    { id: 'composition', name: 'Composition', description: 'Visual balance and layout', passed: false, score: 0, weight: 0.25 },
    { id: 'harmony', name: 'Color Harmony', description: 'Color palette cohesion', passed: false, score: 0, weight: 0.25 },
    { id: 'feasibility', name: 'Feasibility', description: 'Real-world practicality', passed: false, score: 0, weight: 0.25 },
    { id: 'style', name: 'Style Consistency', description: 'Adherence to style DNA', passed: false, score: 0, weight: 0.25 },
  ],
};

export const useStudioStore = create<StudioState & StudioActions>((set, get) => ({
  // Initial State
  ideas: [],
  faders: {},
  synthesisMode: 'idle',
  blendResult: null,
  agents: initialAgentStates,
  criticPersona: 'minimalist',
  iteration: { current: 0, max: 5, phase: 'idle' },
  qualityGate: initialQualityGate,
  productRecommendations: [],
  showProducts: false,
  computeMode: 'local',
  subscriptionTier: 'free',
  qualityTier: 'draft',
  showUpgradePrompt: false,

  // Mixing Desk Actions
  addIdea: (ideaData) => {
    const id = generateId();
    const styleDNA = extractStyleDNA();
    const idea: IdeaInput = {
      ...ideaData,
      id,
      styleDNA,
      addedAt: new Date(),
    };
    const fader: FaderState = {
      ideaId: id,
      influence: 50,
      muted: false,
      solo: false,
    };
    set((state) => ({
      ideas: [...state.ideas, idea],
      faders: { ...state.faders, [id]: fader },
    }));
    return id;
  },

  removeIdea: (ideaId) => {
    set((state) => {
      const { [ideaId]: _, ...remainingFaders } = state.faders;
      return {
        ideas: state.ideas.filter((i) => i.id !== ideaId),
        faders: remainingFaders,
      };
    });
  },

  updateFader: (ideaId, updates) => {
    set((state) => ({
      faders: {
        ...state.faders,
        [ideaId]: { ...state.faders[ideaId], ...updates },
      },
    }));
  },

  muteIdea: (ideaId) => {
    set((state) => ({
      faders: {
        ...state.faders,
        [ideaId]: { ...state.faders[ideaId], muted: !state.faders[ideaId].muted },
      },
    }));
  },

  soloIdea: (ideaId) => {
    set((state) => {
      const isSolo = state.faders[ideaId]?.solo;
      const newFaders = { ...state.faders };
      // Toggle solo - if turning on, turn off all others
      Object.keys(newFaders).forEach((id) => {
        newFaders[id] = { ...newFaders[id], solo: id === ideaId ? !isSolo : false };
      });
      return { faders: newFaders };
    });
  },

  clearAllIdeas: () => {
    set({ ideas: [], faders: {} });
  },

  // Synthesis Actions
  startSynthesis: async () => {
    const state = get();
    if (state.ideas.length === 0) return;

    set({ synthesisMode: 'generating', iteration: { ...state.iteration, phase: 'create', current: 1 } });

    // Simulate generation phases
    const phases: IterationPhase[] = ['create', 'critique', 'reality-check', 'refine'];

    for (const phase of phases) {
      await new Promise((r) => setTimeout(r, 1500));
      set((s) => ({
        iteration: { ...s.iteration, phase },
        agents: {
          ...s.agents,
          [phase === 'create' ? 'creator' : phase === 'critique' ? 'critic' : phase === 'reality-check' ? 'reality' : 'refiner']: {
            ...s.agents[phase === 'create' ? 'creator' : phase === 'critique' ? 'critic' : phase === 'reality-check' ? 'reality' : 'refiner'],
            status: 'working',
          },
        },
      }));
      await new Promise((r) => setTimeout(r, 1000));
      set((s) => {
        const agentId = phase === 'create' ? 'creator' : phase === 'critique' ? 'critic' : phase === 'reality-check' ? 'reality' : 'refiner';
        return {
          agents: {
            ...s.agents,
            [agentId]: {
              ...s.agents[agentId],
              status: 'complete',
              currentFeedback: {
                id: generateId(),
                agentId,
                type: 'approval',
                title: `${s.agents[agentId].agent.name} complete`,
                message: `Analysis complete. Proceeding to next phase.`,
                actionRequired: false,
                timestamp: new Date(),
              },
            },
          },
        };
      });
    }

    // Complete with quality gate
    const scores = [75 + Math.random() * 20, 80 + Math.random() * 15, 70 + Math.random() * 25, 85 + Math.random() * 10];
    const criteria = initialQualityGate.criteria.map((c, i) => ({
      ...c,
      score: scores[i],
      passed: scores[i] >= 75,
    }));
    const overallScore = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);

    set({
      synthesisMode: 'complete',
      iteration: { ...get().iteration, phase: 'complete' },
      qualityGate: {
        passed: overallScore >= 80,
        overallScore,
        requiredScore: 80,
        criteria,
      },
      blendResult: {
        id: generateId(),
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
        synthesizedDNA: extractStyleDNA(),
        inputContributions: get().ideas.map((idea) => ({
          ideaId: idea.id,
          contributionPercent: get().faders[idea.id]?.influence || 50,
        })),
        timestamp: new Date(),
      },
      showProducts: true,
      productRecommendations: mockProducts.slice(0, 4),
    });
  },

  cancelSynthesis: () => {
    set({
      synthesisMode: 'idle',
      iteration: { current: 0, max: 5, phase: 'idle' },
      agents: initialAgentStates,
    });
  },

  // Agent Actions
  setCriticPersona: (persona) => {
    set({ criticPersona: persona });
  },

  startFeedbackLoop: async () => {
    await get().startSynthesis();
  },

  advancePhase: () => {
    const phases: IterationPhase[] = ['idle', 'create', 'critique', 'reality-check', 'refine', 'complete'];
    const currentIdx = phases.indexOf(get().iteration.phase);
    if (currentIdx < phases.length - 1) {
      set((state) => ({
        iteration: { ...state.iteration, phase: phases[currentIdx + 1] },
      }));
    }
  },

  setAgentFeedback: (agentId, feedback) => {
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          currentFeedback: feedback,
          feedbackHistory: [...state.agents[agentId].feedbackHistory, feedback],
        },
      },
    }));
  },

  // Commerce Actions
  loadProductRecommendations: () => {
    set({ productRecommendations: mockProducts });
  },

  toggleProductsPanel: () => {
    set((state) => ({ showProducts: !state.showProducts }));
  },

  // Compute Actions
  setComputeMode: (mode) => {
    const state = get();
    if (mode === 'cloud' && state.subscriptionTier === 'free') {
      set({ showUpgradePrompt: true });
      return;
    }
    set({
      computeMode: mode,
      qualityTier: mode === 'cloud' ? 'production' : 'draft',
    });
  },

  setQualityTier: (tier) => {
    set({ qualityTier: tier });
  },

  showUpgrade: () => {
    set({ showUpgradePrompt: true });
  },

  hideUpgrade: () => {
    set({ showUpgradePrompt: false });
  },

  // Reset
  resetStudio: () => {
    set({
      ideas: [],
      faders: {},
      synthesisMode: 'idle',
      blendResult: null,
      agents: initialAgentStates,
      iteration: { current: 0, max: 5, phase: 'idle' },
      qualityGate: initialQualityGate,
      productRecommendations: [],
      showProducts: false,
    });
  },
}));
