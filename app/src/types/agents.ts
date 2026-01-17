// Agent Types

export type AgentId = 'scout' | 'analyst' | 'composer' | 'generator' | 'critic';

export type AgentStatus =
  | 'idle'
  | 'observing'
  | 'analyzing'
  | 'thinking'
  | 'suggesting'
  | 'working'
  | 'waiting'
  | 'error';

export type AgentGlobalMode =
  | 'passive'
  | 'proactive'
  | 'focused'
  | 'collaborative'
  | 'disabled';

export type InsightType =
  | 'analysis'
  | 'suggestion'
  | 'warning'
  | 'tip'
  | 'comparison'
  | 'discovery';

export type SuggestionType =
  | 'add_reference'
  | 'adjust_strength'
  | 'change_node_type'
  | 'remove_reference'
  | 'reorder'
  | 'style_change'
  | 'generation_setting';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  capabilities: string[];
  personality: string[];
}

export interface AgentInstance {
  agent: Agent;
  status: AgentStatus;
  currentTask: AgentTask | null;
  insights: AgentInsight[];
  suggestions: AgentSuggestion[];
  chatHistory: ChatMessage[];
  lastActivity: Date | null;
  isEnabled: boolean;
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
}

export interface AgentInsight {
  id: string;
  agentId: AgentId;
  type: InsightType;
  title: string;
  summary: string;
  details?: string;
  confidence: number;
  relevance: number;
  data?: Record<string, unknown>;
  suggestedActions?: AgentAction[];
  timestamp: Date;
  dismissed: boolean;
}

export interface AgentSuggestion {
  id: string;
  agentId: AgentId;
  type: SuggestionType;
  title: string;
  description: string;
  preview?: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
  timestamp: Date;
  applied: boolean;
  dismissed: boolean;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'ghost';
  payload: unknown;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: AgentId;
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  actions?: AgentAction[];
  typing?: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'insight' | 'suggestion';
  data: unknown;
}

export interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}

export interface AgentPreferences {
  suggestionFrequency: 'low' | 'medium' | 'high';
  autoAnalysis: boolean;
  showConfidenceScores: boolean;
  enableAnimations: boolean;
  agentPersonalities: boolean;
}

export interface AgentState {
  agents: Record<AgentId, AgentInstance>;
  activeAgentId: AgentId | null;
  focusedAgentId: AgentId | null;
  globalMode: AgentGlobalMode;
  preferences: AgentPreferences;
}

// Color analysis result
export interface ColorAnalysis {
  palette: Array<{ hex: string; percentage: number; name: string }>;
  harmony: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary';
  temperature: 'warm' | 'neutral' | 'cool';
  saturation: 'muted' | 'moderate' | 'vibrant';
  dominantColor: string;
}

// Composition analysis result
export interface CompositionAnalysis {
  ruleOfThirds: number;
  balance: 'symmetric' | 'asymmetric' | 'radial';
  focusPoint: { x: number; y: number };
  leadingLines: boolean;
  complexity: 'minimal' | 'moderate' | 'complex';
}

// Full image analysis
export interface ImageAnalysis {
  id: string;
  imageId: string;
  color: ColorAnalysis;
  composition: CompositionAnalysis;
  style: {
    category: string;
    mood: string[];
    era?: string;
  };
  quality: {
    sharpness: number;
    noise: number;
    overall: 'low' | 'medium' | 'high' | 'excellent';
  };
  subjects: {
    hasFaces: boolean;
    faceCount: number;
    hasText: boolean;
    dominantSubject?: string;
  };
  analyzedAt: Date;
}
