import { create } from 'zustand';
import {
  Agent,
  AgentId,
  AgentInstance,
  AgentState,
  AgentStatus,
  AgentGlobalMode,
  AgentInsight,
  AgentSuggestion,
  AgentTask,
  ChatMessage,
  AgentPreferences,
  ImageAnalysis,
  ColorAnalysis,
  CompositionAnalysis,
} from '../types/agents';
import { generateId, delay } from '../utils/helpers';

// Agent definitions
export const agentDefinitions: Record<AgentId, Agent> = {
  scout: {
    id: 'scout',
    name: 'Scout',
    role: 'Reference Discovery',
    description: 'Finds relevant reference images based on your intent and style preferences',
    icon: 'search',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    capabilities: ['Similar image search', 'Style matching', 'Trend awareness', 'Reference curation'],
    personality: ['Curious', 'Resourceful', 'Proactive'],
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    role: 'Image Analysis',
    description: 'Analyzes images for technical and artistic properties',
    icon: 'bar-chart-2',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-500',
    capabilities: ['Color extraction', 'Composition analysis', 'Style detection', 'Quality assessment'],
    personality: ['Precise', 'Knowledgeable', 'Detail-oriented'],
  },
  composer: {
    id: 'composer',
    name: 'Composer',
    role: 'Composition Orchestration',
    description: 'Optimizes how references combine with your base image',
    icon: 'sliders',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    capabilities: ['Conflict detection', 'Strength optimization', 'Harmony scoring', 'Balance suggestions'],
    personality: ['Creative', 'Balanced', 'Harmony-seeking'],
  },
  generator: {
    id: 'generator',
    name: 'Generator',
    role: 'Generation Management',
    description: 'Orchestrates the image generation process',
    icon: 'zap',
    color: '#EF4444',
    gradient: 'from-red-500 to-rose-500',
    capabilities: ['Progress narration', 'Quality optimization', 'Variation generation', 'Error recovery'],
    personality: ['Efficient', 'Communicative', 'Reliable'],
  },
  critic: {
    id: 'critic',
    name: 'Critic',
    role: 'Quality Assessment',
    description: 'Evaluates results and suggests improvements',
    icon: 'message-circle',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
    capabilities: ['Output evaluation', 'Improvement suggestions', 'Intent comparison', 'Quality scoring'],
    personality: ['Constructive', 'Honest', 'Encouraging'],
  },
};

// Initial agent instances
const createInitialAgentInstance = (agent: Agent): AgentInstance => ({
  agent,
  status: 'idle',
  currentTask: null,
  insights: [],
  suggestions: [],
  chatHistory: [],
  lastActivity: null,
  isEnabled: true,
});

const initialAgents: Record<AgentId, AgentInstance> = {
  scout: createInitialAgentInstance(agentDefinitions.scout),
  analyst: createInitialAgentInstance(agentDefinitions.analyst),
  composer: createInitialAgentInstance(agentDefinitions.composer),
  generator: createInitialAgentInstance(agentDefinitions.generator),
  critic: createInitialAgentInstance(agentDefinitions.critic),
};

const initialPreferences: AgentPreferences = {
  suggestionFrequency: 'medium',
  autoAnalysis: true,
  showConfidenceScores: true,
  enableAnimations: true,
  agentPersonalities: true,
};

const initialState: AgentState = {
  agents: initialAgents,
  activeAgentId: null,
  focusedAgentId: null,
  globalMode: 'proactive',
  preferences: initialPreferences,
};

interface AgentStore extends AgentState {
  // Focus management
  setActiveAgent: (agentId: AgentId | null) => void;
  setFocusedAgent: (agentId: AgentId | null) => void;
  toggleAgent: (agentId: AgentId) => void;

  // Status management
  setAgentStatus: (agentId: AgentId, status: AgentStatus) => void;

  // Task management
  startAgentTask: (agentId: AgentId, task: Omit<AgentTask, 'id' | 'startedAt'>) => string;
  updateAgentTask: (agentId: AgentId, taskId: string, updates: Partial<AgentTask>) => void;
  completeAgentTask: (agentId: AgentId, taskId: string, result?: unknown) => void;

  // Insights
  addInsight: (agentId: AgentId, insight: Omit<AgentInsight, 'id' | 'timestamp' | 'dismissed'>) => string;
  dismissInsight: (agentId: AgentId, insightId: string) => void;
  clearInsights: (agentId: AgentId) => void;

  // Suggestions
  addSuggestion: (agentId: AgentId, suggestion: Omit<AgentSuggestion, 'id' | 'timestamp' | 'applied' | 'dismissed'>) => string;
  applySuggestion: (agentId: AgentId, suggestionId: string) => void;
  dismissSuggestion: (agentId: AgentId, suggestionId: string) => void;
  clearSuggestions: (agentId: AgentId) => void;

  // Chat
  addChatMessage: (agentId: AgentId, message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  clearChatHistory: (agentId: AgentId) => void;

  // Global
  setGlobalMode: (mode: AgentGlobalMode) => void;
  updatePreferences: (preferences: Partial<AgentPreferences>) => void;

  // Analysis actions (simulated)
  analyzeImage: (imageId: string, imageSrc: string) => Promise<ImageAnalysis>;
  generateInsightsFromAnalysis: (analysis: ImageAnalysis) => void;

  // Reset
  resetAgentState: () => void;
}

// Simulated color analysis
const analyzeColors = (imageSrc: string): ColorAnalysis => {
  // In a real implementation, this would use canvas to extract colors
  const palettes = [
    [
      { hex: '#2D3748', percentage: 35, name: 'Dark Slate' },
      { hex: '#E2E8F0', percentage: 25, name: 'Light Gray' },
      { hex: '#4A5568', percentage: 20, name: 'Gray' },
      { hex: '#718096', percentage: 15, name: 'Medium Gray' },
      { hex: '#A0AEC0', percentage: 5, name: 'Silver' },
    ],
    [
      { hex: '#F6AD55', percentage: 30, name: 'Orange' },
      { hex: '#FC8181', percentage: 25, name: 'Coral' },
      { hex: '#FBD38D', percentage: 20, name: 'Yellow' },
      { hex: '#F687B3', percentage: 15, name: 'Pink' },
      { hex: '#B794F4', percentage: 10, name: 'Purple' },
    ],
    [
      { hex: '#4299E1', percentage: 35, name: 'Blue' },
      { hex: '#63B3ED', percentage: 25, name: 'Light Blue' },
      { hex: '#90CDF4', percentage: 20, name: 'Sky' },
      { hex: '#BEE3F8', percentage: 15, name: 'Pale Blue' },
      { hex: '#2B6CB0', percentage: 5, name: 'Navy' },
    ],
  ];

  const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
  const harmonies: ColorAnalysis['harmony'][] = ['complementary', 'analogous', 'triadic', 'monochromatic'];
  const temps: ColorAnalysis['temperature'][] = ['warm', 'neutral', 'cool'];
  const sats: ColorAnalysis['saturation'][] = ['muted', 'moderate', 'vibrant'];

  return {
    palette: randomPalette,
    harmony: harmonies[Math.floor(Math.random() * harmonies.length)],
    temperature: temps[Math.floor(Math.random() * temps.length)],
    saturation: sats[Math.floor(Math.random() * sats.length)],
    dominantColor: randomPalette[0].hex,
  };
};

// Simulated composition analysis
const analyzeComposition = (): CompositionAnalysis => {
  const balances: CompositionAnalysis['balance'][] = ['symmetric', 'asymmetric', 'radial'];
  const complexities: CompositionAnalysis['complexity'][] = ['minimal', 'moderate', 'complex'];

  return {
    ruleOfThirds: Math.floor(Math.random() * 40) + 60, // 60-100
    balance: balances[Math.floor(Math.random() * balances.length)],
    focusPoint: {
      x: Math.random() * 0.4 + 0.3, // 0.3-0.7
      y: Math.random() * 0.4 + 0.3,
    },
    leadingLines: Math.random() > 0.5,
    complexity: complexities[Math.floor(Math.random() * complexities.length)],
  };
};

export const useAgentStore = create<AgentStore>((set, get) => ({
  ...initialState,

  // Focus management
  setActiveAgent: (agentId) => set({ activeAgentId: agentId }),
  setFocusedAgent: (agentId) => set({ focusedAgentId: agentId }),

  toggleAgent: (agentId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          isEnabled: !state.agents[agentId].isEnabled,
        },
      },
    })),

  // Status management
  setAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status,
          lastActivity: new Date(),
        },
      },
    })),

  // Task management
  startAgentTask: (agentId, task) => {
    const taskId = generateId();
    const fullTask: AgentTask = {
      ...task,
      id: taskId,
      startedAt: new Date(),
    };
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          currentTask: fullTask,
          status: 'working',
          lastActivity: new Date(),
        },
      },
    }));
    return taskId;
  },

  updateAgentTask: (agentId, taskId, updates) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent.currentTask || agent.currentTask.id !== taskId) return state;
      return {
        agents: {
          ...state.agents,
          [agentId]: {
            ...agent,
            currentTask: { ...agent.currentTask, ...updates },
          },
        },
      };
    }),

  completeAgentTask: (agentId, taskId, result) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent.currentTask || agent.currentTask.id !== taskId) return state;
      return {
        agents: {
          ...state.agents,
          [agentId]: {
            ...agent,
            currentTask: null,
            status: 'idle',
            lastActivity: new Date(),
          },
        },
      };
    }),

  // Insights
  addInsight: (agentId, insight) => {
    const insightId = generateId();
    const fullInsight: AgentInsight = {
      ...insight,
      id: insightId,
      timestamp: new Date(),
      dismissed: false,
    };
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          insights: [...state.agents[agentId].insights, fullInsight],
          lastActivity: new Date(),
        },
      },
    }));
    return insightId;
  },

  dismissInsight: (agentId, insightId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          insights: state.agents[agentId].insights.map((i) =>
            i.id === insightId ? { ...i, dismissed: true } : i
          ),
        },
      },
    })),

  clearInsights: (agentId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          insights: [],
        },
      },
    })),

  // Suggestions
  addSuggestion: (agentId, suggestion) => {
    const suggestionId = generateId();
    const fullSuggestion: AgentSuggestion = {
      ...suggestion,
      id: suggestionId,
      timestamp: new Date(),
      applied: false,
      dismissed: false,
    };
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          suggestions: [...state.agents[agentId].suggestions, fullSuggestion],
          lastActivity: new Date(),
        },
      },
    }));
    return suggestionId;
  },

  applySuggestion: (agentId, suggestionId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          suggestions: state.agents[agentId].suggestions.map((s) =>
            s.id === suggestionId ? { ...s, applied: true } : s
          ),
        },
      },
    })),

  dismissSuggestion: (agentId, suggestionId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          suggestions: state.agents[agentId].suggestions.map((s) =>
            s.id === suggestionId ? { ...s, dismissed: true } : s
          ),
        },
      },
    })),

  clearSuggestions: (agentId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          suggestions: [],
        },
      },
    })),

  // Chat
  addChatMessage: (agentId, message) => {
    const messageId = generateId();
    const fullMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          chatHistory: [...state.agents[agentId].chatHistory, fullMessage],
          lastActivity: new Date(),
        },
      },
    }));
    return messageId;
  },

  clearChatHistory: (agentId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          chatHistory: [],
        },
      },
    })),

  // Global
  setGlobalMode: (mode) => set({ globalMode: mode }),
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),

  // Analysis
  analyzeImage: async (imageId, imageSrc) => {
    const store = get();
    const agentId: AgentId = 'analyst';

    // Start task
    store.setAgentStatus(agentId, 'analyzing');
    const taskId = store.startAgentTask(agentId, {
      type: 'image_analysis',
      description: 'Analyzing image properties',
      status: 'running',
      progress: 0,
    });

    // Simulate analysis steps
    await delay(500);
    store.updateAgentTask(agentId, taskId, { progress: 25 });

    await delay(400);
    store.updateAgentTask(agentId, taskId, { progress: 50 });

    await delay(400);
    store.updateAgentTask(agentId, taskId, { progress: 75 });

    await delay(300);
    store.updateAgentTask(agentId, taskId, { progress: 100 });

    // Generate analysis
    const analysis: ImageAnalysis = {
      id: generateId(),
      imageId,
      color: analyzeColors(imageSrc),
      composition: analyzeComposition(),
      style: {
        category: ['Photography', 'Illustration', 'Digital Art', '3D Render'][Math.floor(Math.random() * 4)],
        mood: ['Calm', 'Energetic', 'Dramatic', 'Peaceful', 'Mysterious'].slice(0, Math.floor(Math.random() * 3) + 1),
        era: Math.random() > 0.5 ? 'Modern' : 'Contemporary',
      },
      quality: {
        sharpness: Math.floor(Math.random() * 30) + 70,
        noise: Math.floor(Math.random() * 20) + 5,
        overall: ['medium', 'high', 'excellent'][Math.floor(Math.random() * 3)] as 'medium' | 'high' | 'excellent',
      },
      subjects: {
        hasFaces: Math.random() > 0.5,
        faceCount: Math.floor(Math.random() * 3),
        hasText: Math.random() > 0.7,
        dominantSubject: ['Person', 'Landscape', 'Object', 'Abstract'][Math.floor(Math.random() * 4)],
      },
      analyzedAt: new Date(),
    };

    store.completeAgentTask(agentId, taskId, analysis);

    // Generate insights from analysis
    store.generateInsightsFromAnalysis(analysis);

    return analysis;
  },

  generateInsightsFromAnalysis: (analysis) => {
    const store = get();

    // Color insight
    store.addInsight('analyst', {
      agentId: 'analyst',
      type: 'analysis',
      title: 'Color Analysis Complete',
      summary: `Your image uses a ${analysis.color.harmony} color scheme with ${analysis.color.temperature} tones and ${analysis.color.saturation} saturation.`,
      details: `Dominant color: ${analysis.color.dominantColor}. The palette consists of ${analysis.color.palette.length} main colors.`,
      confidence: 92,
      relevance: 85,
      data: { colorAnalysis: analysis.color },
    });

    // Composition insight
    store.addInsight('analyst', {
      agentId: 'analyst',
      type: 'analysis',
      title: 'Composition Assessment',
      summary: `${analysis.composition.balance.charAt(0).toUpperCase() + analysis.composition.balance.slice(1)} balance with ${analysis.composition.complexity} complexity. Rule of thirds score: ${analysis.composition.ruleOfThirds}%.`,
      confidence: 88,
      relevance: 80,
      data: { compositionAnalysis: analysis.composition },
    });

    // Style insight
    store.addInsight('analyst', {
      agentId: 'analyst',
      type: 'discovery',
      title: 'Style Detection',
      summary: `Detected style: ${analysis.style.category}. Mood: ${analysis.style.mood.join(', ')}.`,
      confidence: 85,
      relevance: 90,
      data: { styleAnalysis: analysis.style },
    });

    // Quality tip
    if (analysis.quality.overall !== 'excellent') {
      store.addInsight('analyst', {
        agentId: 'analyst',
        type: 'tip',
        title: 'Quality Note',
        summary: `Image quality is ${analysis.quality.overall}. Higher resolution images typically produce better generation results.`,
        confidence: 95,
        relevance: 70,
      });
    }

    // Generate a suggestion from composer
    store.addSuggestion('composer', {
      agentId: 'composer',
      type: 'add_reference',
      title: 'Add Complementary Style',
      description: `Based on the ${analysis.style.category} style detected, consider adding a lighting reference to enhance the ${analysis.style.mood[0] || 'overall'} mood.`,
      confidence: 78,
      impact: 'medium',
      metadata: { basedOn: analysis.style },
    });
  },

  resetAgentState: () => set(initialState),
}));

// Selector hooks for convenience
export const useAgent = (agentId: AgentId) =>
  useAgentStore((state) => state.agents[agentId]);

export const useActiveAgent = () =>
  useAgentStore((state) =>
    state.activeAgentId ? state.agents[state.activeAgentId] : null
  );

export const useFocusedAgent = () =>
  useAgentStore((state) =>
    state.focusedAgentId ? state.agents[state.focusedAgentId] : null
  );

export const useAgentInsights = (agentId: AgentId) =>
  useAgentStore((state) =>
    state.agents[agentId].insights.filter((i) => !i.dismissed)
  );

export const useAllActiveInsights = () =>
  useAgentStore((state) =>
    Object.values(state.agents)
      .flatMap((a) => a.insights)
      .filter((i) => !i.dismissed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  );

export const useAgentSuggestions = (agentId: AgentId) =>
  useAgentStore((state) =>
    state.agents[agentId].suggestions.filter((s) => !s.dismissed && !s.applied)
  );

export const useAllActiveSuggestions = () =>
  useAgentStore((state) =>
    Object.values(state.agents)
      .flatMap((a) => a.suggestions)
      .filter((s) => !s.dismissed && !s.applied)
      .sort((a, b) => b.confidence - a.confidence)
  );
