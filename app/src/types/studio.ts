// Studio Agent Types
export type StudioAgentId = 'creator' | 'critic' | 'reality' | 'refiner';
export type CriticPersona = 'minimalist' | 'architect' | 'stylist';
export type IterationPhase = 'idle' | 'create' | 'critique' | 'reality-check' | 'refine' | 'complete';
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'complete' | 'error';

export interface StudioAgent {
  id: StudioAgentId;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface StudioAgentState {
  agent: StudioAgent;
  status: AgentStatus;
  currentFeedback: AgentFeedback | null;
  feedbackHistory: AgentFeedback[];
}

export interface AgentFeedback {
  id: string;
  agentId: StudioAgentId;
  type: 'suggestion' | 'warning' | 'approval' | 'rejection';
  title: string;
  message: string;
  details?: string;
  affectedAreas?: string[];
  actionRequired: boolean;
  timestamp: Date;
}

// Mixing Desk Types
export type IdeaType = 'pin' | 'photo' | 'sketch' | 'url';

export interface IdeaInput {
  id: string;
  type: IdeaType;
  source: string;
  thumbnail: string;
  name: string;
  styleDNA: StyleDNA;
  addedAt: Date;
}

export interface StyleDNA {
  colors: string[];
  mood: string[];
  aesthetics: string[];
  patterns: string[];
  materials?: string[];
  era?: string;
  confidence: number;
}

export interface FaderState {
  ideaId: string;
  influence: number; // 0-100
  muted: boolean;
  solo: boolean;
}

// Synthesis Types
export type SynthesisMode = 'idle' | 'preview' | 'generating' | 'complete';

export interface BlendResult {
  id: string;
  imageUrl: string;
  synthesizedDNA: StyleDNA;
  inputContributions: Array<{
    ideaId: string;
    contributionPercent: number;
  }>;
  timestamp: Date;
}

// Commerce Types
export interface ProductRecommendation {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl: string;
  thumbnailUrl: string;
  purchaseUrl: string;
  matchScore: number;
  matchedStyles: string[];
  vendor: string;
  category: string;
  inStock: boolean;
}

export interface IntentCapture {
  id: string;
  timestamp: Date;
  action: 'view' | 'interact' | 'add-to-world' | 'purchase-click';
  productId?: string;
  ideaIds: string[];
  sessionData: Record<string, unknown>;
}

// Compute Types
export type ComputeMode = 'local' | 'cloud';
export type SubscriptionTier = 'free' | 'premium';
export type QualityTier = 'draft' | 'production';

export interface ComputeState {
  mode: ComputeMode;
  subscriptionTier: SubscriptionTier;
  qualityTier: QualityTier;
  localCapabilities: {
    npuAvailable: boolean;
    estimatedSpeed: 'fast' | 'medium' | 'slow';
  };
  cloudQuota?: {
    remaining: number;
    total: number;
    resetDate: Date;
  };
}

// Quality Gate Types
export interface QualityCriterion {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  score: number;
  weight: number;
}

export interface QualityGateStatus {
  passed: boolean;
  overallScore: number;
  criteria: QualityCriterion[];
  requiredScore: number;
}

// Iteration Cycle Types
export interface IterationCycle {
  currentPhase: IterationPhase;
  iteration: number;
  maxIterations: number;
  autoMode: boolean;
}

// Critic Persona Definitions
export interface CriticPersonaDefinition {
  id: CriticPersona;
  name: string;
  description: string;
  focusAreas: string[];
  icon: string;
  color: string;
}

// Studio Agent Definitions
export const studioAgentDefinitions: Record<StudioAgentId, StudioAgent> = {
  creator: {
    id: 'creator',
    name: 'Creator',
    role: 'Visual Generator',
    description: 'Generates the initial visual based on your selected ideas and mix',
    icon: 'Paintbrush',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
  },
  critic: {
    id: 'critic',
    name: 'Critic',
    role: 'Design Reviewer',
    description: 'Provides feedback based on selected persona (Minimalist, Architect, Stylist)',
    icon: 'Eye',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
  },
  reality: {
    id: 'reality',
    name: 'Reality',
    role: 'Feasibility Checker',
    description: 'Tests creation against real-world physics and product availability',
    icon: 'CheckCircle',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
  },
  refiner: {
    id: 'refiner',
    name: 'Refiner',
    role: 'Quality Enhancer',
    description: 'Updates the material based on combined feedback until quality gate passes',
    icon: 'Sparkles',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
  },
};

export const criticPersonaDefinitions: Record<CriticPersona, CriticPersonaDefinition> = {
  minimalist: {
    id: 'minimalist',
    name: 'The Minimalist',
    description: 'Focuses on simplicity, clean lines, and reducing visual clutter',
    focusAreas: ['clutter', 'whitespace', 'simplicity', 'focus'],
    icon: 'Minus',
    color: '#6B7280',
  },
  architect: {
    id: 'architect',
    name: 'The Architect',
    description: 'Emphasizes structure, proportion, and spatial harmony',
    focusAreas: ['structure', 'proportion', 'balance', 'geometry'],
    icon: 'Ruler',
    color: '#2563EB',
  },
  stylist: {
    id: 'stylist',
    name: 'The Stylist',
    description: 'Prioritizes color harmony, texture combinations, and aesthetic appeal',
    focusAreas: ['color', 'texture', 'mood', 'cohesion'],
    icon: 'Palette',
    color: '#EC4899',
  },
};
