# ZimZora Agent-Based UI Specification

## Executive Summary

This document specifies a new agent-based UI paradigm for ZimZora that introduces intelligent assistants to help users with photo generation workflows. Unlike traditional UI paradigms where users manually configure every aspect of image composition, the agent-based approach provides contextual assistance, automated analysis, and intelligent recommendations through specialized AI agents.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Agent Types & Responsibilities](#agent-types--responsibilities)
3. [UI Architecture](#ui-architecture)
4. [Component Specifications](#component-specifications)
5. [Interaction Patterns](#interaction-patterns)
6. [State Management](#state-management)
7. [Agent Communication Protocol](#agent-communication-protocol)
8. [Visual Design System](#visual-design-system)
9. [Accessibility Considerations](#accessibility-considerations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Design Philosophy

### Core Principles

1. **Assistive, Not Intrusive**: Agents provide help when needed but don't overwhelm the creative process
2. **Contextual Intelligence**: Agents understand the current state and provide relevant suggestions
3. **Transparent Reasoning**: Users can see why an agent made a recommendation
4. **Progressive Disclosure**: Simple interactions by default, depth available on demand
5. **Collaborative Workflow**: Agents work together and with the user as a team
6. **User Agency**: Final decisions always rest with the user; agents suggest, users approve

### The Agent Mental Model

Think of agents as specialized creative assistants sitting beside you:
- **They observe** what you're working on
- **They analyze** your images and composition
- **They suggest** improvements and alternatives
- **They execute** approved actions on your behalf
- **They learn** your preferences over time

---

## Agent Types & Responsibilities

### Primary Agents

#### 1. **Scout Agent** 🔍
**Role**: Reference Discovery & Context Gathering

| Attribute | Description |
|-----------|-------------|
| **Primary Function** | Find relevant reference images based on user intent |
| **Triggers** | User uploads base image, requests references, describes desired outcome |
| **Outputs** | Curated reference suggestions with relevance scores |
| **Personality** | Curious, resourceful, proactive |

**Capabilities**:
- Reverse image search integration
- Style/mood matching from description
- Similar image discovery
- Trend awareness (what's popular in this style)
- Historical reference (art movements, photographers)

**Example Interactions**:
```
User: "I want this portrait to feel more cinematic"
Scout: "I found 8 references that could help. Here are 3 lighting setups
        from film noir, 2 color grades from Blade Runner, and 3 composition
        examples from Roger Deakins' work. Which direction interests you?"
```

---

#### 2. **Analyst Agent** 📊
**Role**: Image Analysis & Technical Insight

| Attribute | Description |
|-----------|-------------|
| **Primary Function** | Analyze uploaded images for technical and artistic properties |
| **Triggers** | Any image upload (automatic), user request for analysis |
| **Outputs** | Structured analysis reports, detected features, quality metrics |
| **Personality** | Precise, knowledgeable, detail-oriented |

**Capabilities**:
- Style detection (photographic, illustrated, 3D, etc.)
- Color palette extraction
- Composition analysis (rule of thirds, golden ratio, etc.)
- Lighting analysis (direction, quality, color temperature)
- Face/pose/object detection
- Quality assessment (resolution, noise, artifacts)
- Depth estimation
- Mood/emotion classification

**Analysis Output Structure**:
```typescript
interface ImageAnalysis {
  technical: {
    resolution: { width: number; height: number };
    aspectRatio: string;
    colorSpace: string;
    estimatedQuality: 'low' | 'medium' | 'high' | 'excellent';
  };
  composition: {
    dominantLines: 'horizontal' | 'vertical' | 'diagonal' | 'curved';
    balance: 'symmetric' | 'asymmetric' | 'radial';
    focusPoint: { x: number; y: number };
    ruleOfThirdsScore: number; // 0-100
  };
  color: {
    palette: Color[];
    harmony: 'complementary' | 'analogous' | 'triadic' | 'monochromatic';
    temperature: 'warm' | 'neutral' | 'cool';
    saturation: 'muted' | 'moderate' | 'vibrant';
  };
  lighting: {
    direction: 'front' | 'side' | 'back' | 'top' | 'bottom' | 'ambient';
    quality: 'hard' | 'soft' | 'mixed';
    contrast: 'low' | 'medium' | 'high';
  };
  subjects: {
    faces: FaceDetection[];
    poses: PoseDetection[];
    objects: ObjectDetection[];
  };
  style: {
    category: string;
    influences: string[];
    era: string;
    mood: string[];
  };
}
```

---

#### 3. **Composer Agent** 🎨
**Role**: Composition Orchestration & Optimization

| Attribute | Description |
|-----------|-------------|
| **Primary Function** | Optimize how references combine with the base image |
| **Triggers** | References added, user requests optimization, before generation |
| **Outputs** | Suggested configurations, conflict warnings, harmony scores |
| **Personality** | Creative, balanced, harmony-seeking |

**Capabilities**:
- Detect conflicting references (e.g., warm and cool color refs)
- Suggest optimal strength values
- Recommend reference ordering/priority
- Identify missing elements ("You have style but no lighting reference")
- Balance composition across node types
- Preview potential outcomes (rough sketch)

**Conflict Detection Examples**:
- Style conflict: "Watercolor style" + "Photorealistic style"
- Color conflict: "Warm sunset palette" + "Cool blue tones"
- Lighting conflict: "Harsh shadows" + "Soft diffused light"
- Mood conflict: "Serene peaceful" + "Dramatic intense"

---

#### 4. **Generator Agent** ⚡
**Role**: Generation Process Management

| Attribute | Description |
|-----------|-------------|
| **Primary Function** | Orchestrate the actual image generation process |
| **Triggers** | User initiates generation |
| **Outputs** | Progress updates, intermediate results, final output, generation insights |
| **Personality** | Efficient, communicative, reliable |

**Capabilities**:
- Pre-generation validation
- Real-time progress narration
- Intermediate preview generation
- Error recovery and retry logic
- Generation parameter optimization
- Post-generation quality assessment
- Variation suggestion

**Progress Narration Example**:
```
"Starting generation..."
"Encoding your base image - this portrait has great bone structure"
"Processing style reference - extracting that film grain texture"
"Applying color influence - warming up those shadows"
"Harmonizing lighting - balancing the rim light with fill"
"Refining details - enhancing facial features"
"Almost there - final quality pass..."
"Done! The style transfer came through beautifully.
 Want me to generate some variations?"
```

---

#### 5. **Critic Agent** 🎭
**Role**: Quality Assessment & Improvement Suggestions

| Attribute | Description |
|-----------|-------------|
| **Primary Function** | Evaluate generated results and suggest improvements |
| **Triggers** | Generation complete, user requests feedback |
| **Outputs** | Quality scores, improvement suggestions, comparison with intent |
| **Personality** | Constructive, honest, encouraging |

**Capabilities**:
- Compare output to original intent
- Identify what worked well
- Suggest specific improvements
- Rate technical quality
- Assess artistic coherence
- Provide actionable next steps

---

### Supporting Agents

#### 6. **History Agent** 📚
**Role**: Session Memory & Learning

- Tracks user preferences over time
- Remembers successful combinations
- Suggests based on past choices
- Maintains undo/redo with context

#### 7. **Tutorial Agent** 🎓
**Role**: Onboarding & Education

- Guides new users through features
- Explains node types and their effects
- Provides tips contextually
- Answers "how do I..." questions

#### 8. **Export Agent** 📤
**Role**: Output Management

- Handles various export formats
- Manages batch operations
- Creates shareable links
- Packages configurations for reuse

---

## UI Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Paradigm Switcher | Project Name | Settings | Help     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────┐ ┌──────────────────┐ │
│  │                                      │ │                  │ │
│  │                                      │ │   Agent Panel    │ │
│  │        Main Workspace                │ │                  │ │
│  │        (Composition View)            │ │  ┌────────────┐  │ │
│  │                                      │ │  │ Active     │  │ │
│  │                                      │ │  │ Agent      │  │ │
│  │                                      │ │  │ Card       │  │ │
│  │                                      │ │  └────────────┘  │ │
│  │                                      │ │                  │ │
│  │                                      │ │  ┌────────────┐  │ │
│  │                                      │ │  │ Agent      │  │ │
│  │                                      │ │  │ Chat       │  │ │
│  │                                      │ │  │ Interface  │  │ │
│  │                                      │ │  │            │  │ │
│  │                                      │ │  └────────────┘  │ │
│  │                                      │ │                  │ │
│  └──────────────────────────────────────┘ └──────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Agent Dock: [Scout] [Analyst] [Composer] [Generator] ...  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AgentParadigmUI
├── AgentDock
│   ├── AgentDockItem (per agent)
│   │   ├── AgentAvatar
│   │   ├── AgentStatusIndicator
│   │   └── NotificationBadge
│   └── DockOverflowMenu
├── MainWorkspace
│   ├── CompositionCanvas
│   │   ├── BaseImageDisplay
│   │   ├── ReferenceOverlay
│   │   └── AgentAnnotations
│   └── QuickActions
├── AgentPanel
│   ├── AgentHeader
│   │   ├── AgentIdentity
│   │   ├── AgentStatus
│   │   └── AgentActions (minimize, settings, close)
│   ├── AgentContent
│   │   ├── InsightsView
│   │   ├── SuggestionsView
│   │   └── ChatView
│   └── AgentInput
│       ├── TextInput
│       ├── QuickReplies
│       └── ActionButtons
├── AgentOverlay (for focused interactions)
│   ├── AgentSpotlight
│   └── GuidedFlow
└── AgentNotifications
    └── ToastStack
```

---

## Component Specifications

### AgentDock

The persistent bottom bar showing all available agents.

```typescript
interface AgentDockProps {
  agents: Agent[];
  activeAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
  onAgentDismiss: (agentId: string) => void;
  position: 'bottom' | 'left' | 'right';
}

interface AgentDockItemProps {
  agent: Agent;
  isActive: boolean;
  hasNotification: boolean;
  notificationCount?: number;
  status: AgentStatus;
  onClick: () => void;
  onContextMenu: () => void;
}
```

**Visual States**:
- **Idle**: Subtle, monochrome avatar
- **Active**: Elevated, colored, glow effect
- **Working**: Animated pulse/spin indicator
- **Has Suggestion**: Notification badge with count
- **Error**: Red indicator, requires attention

**Interaction**:
- Click to activate/focus agent
- Right-click for context menu (settings, disable, info)
- Drag to reorder
- Double-click for expanded view

---

### AgentCard

Compact display of agent identity and current state.

```typescript
interface AgentCardProps {
  agent: Agent;
  status: AgentStatus;
  currentTask?: string;
  lastInsight?: AgentInsight;
  onExpand: () => void;
  onDismiss: () => void;
  variant: 'compact' | 'expanded' | 'floating';
}

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string | ReactNode;
  color: string;
  capabilities: string[];
  personality: string[];
}

type AgentStatus =
  | 'idle'
  | 'observing'
  | 'analyzing'
  | 'thinking'
  | 'suggesting'
  | 'working'
  | 'waiting'
  | 'error';
```

**Design**:
```
┌─────────────────────────────────────┐
│ [🔍]  Scout Agent           [−] [×] │
│       Finding references...         │
├─────────────────────────────────────┤
│                                     │
│  "I found 5 cinematic lighting      │
│   references that match your        │
│   portrait's mood."                 │
│                                     │
│  [View Suggestions]  [Dismiss]      │
│                                     │
└─────────────────────────────────────┘
```

---

### AgentChatInterface

Conversational interface for deep agent interaction.

```typescript
interface AgentChatProps {
  agent: Agent;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onQuickReply: (reply: QuickReply) => void;
  onActionClick: (action: AgentAction) => void;
  isTyping: boolean;
  suggestions?: QuickReply[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string | ReactNode;
  timestamp: Date;
  attachments?: Attachment[];
  actions?: AgentAction[];
  metadata?: Record<string, unknown>;
}

interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'ghost';
  requiresConfirmation?: boolean;
  payload: unknown;
}

interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}
```

**Message Types**:

1. **Text Message**: Simple conversational text
2. **Insight Card**: Structured analysis result
3. **Suggestion Card**: Actionable recommendation with preview
4. **Image Grid**: Multiple image options to choose from
5. **Comparison View**: Before/after or A/B comparison
6. **Progress Update**: Generation or analysis progress
7. **Action Prompt**: Request for user decision

---

### AgentInsightCard

Displays structured insights from agent analysis.

```typescript
interface AgentInsightCardProps {
  insight: AgentInsight;
  onApply?: () => void;
  onDismiss?: () => void;
  onExpand?: () => void;
  variant: 'inline' | 'floating' | 'modal';
}

interface AgentInsight {
  id: string;
  agentId: string;
  type: InsightType;
  title: string;
  summary: string;
  details?: string;
  confidence: number; // 0-100
  relevance: number; // 0-100
  visualData?: InsightVisualization;
  suggestedActions?: AgentAction[];
  relatedImages?: string[];
  timestamp: Date;
}

type InsightType =
  | 'analysis'
  | 'suggestion'
  | 'warning'
  | 'tip'
  | 'comparison'
  | 'discovery';
```

**Visual Design**:
```
┌─────────────────────────────────────────┐
│ 📊 Color Analysis                   95% │
├─────────────────────────────────────────┤
│                                         │
│  Your image uses a complementary        │
│  color scheme with warm oranges         │
│  and cool teals.                        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [██] [██] [██] [██] [██]        │    │
│  │ Extracted Palette               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💡 Tip: Your style reference has a     │
│  different color temperature. Consider  │
│  adding a color reference to preserve   │
│  your original warmth.                  │
│                                         │
│  [Add Color Reference]  [Ignore]        │
│                                         │
└─────────────────────────────────────────┘
```

---

### AgentSuggestionCarousel

Horizontal scrollable list of agent suggestions.

```typescript
interface SuggestionCarouselProps {
  suggestions: AgentSuggestion[];
  onSelect: (suggestion: AgentSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  onViewAll: () => void;
}

interface AgentSuggestion {
  id: string;
  agentId: string;
  type: SuggestionType;
  title: string;
  description: string;
  preview?: string; // image URL or data URL
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  nodeType?: NodeType;
  strength?: number;
  metadata?: Record<string, unknown>;
}

type SuggestionType =
  | 'add_reference'
  | 'adjust_strength'
  | 'change_node_type'
  | 'remove_reference'
  | 'reorder'
  | 'style_change'
  | 'generation_setting';
```

---

### AgentAnnotationOverlay

Visual annotations agents can place on the workspace.

```typescript
interface AnnotationOverlayProps {
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationDismiss: (annotationId: string) => void;
  showLabels: boolean;
}

interface Annotation {
  id: string;
  agentId: string;
  type: AnnotationType;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content: string | ReactNode;
  color: string;
  priority: number;
}

type AnnotationType =
  | 'point'      // Single point of interest
  | 'region'     // Highlighted area
  | 'arrow'      // Directional indicator
  | 'comparison' // Side-by-side regions
  | 'flow'       // Connected sequence
  | 'hotspot';   // Interactive clickable area
```

---

## Interaction Patterns

### 1. Passive Observation Mode

Agents observe and analyze without interrupting.

**Behavior**:
- Agents run analysis in background
- Insights accumulate silently
- Notification badges indicate available insights
- User can check insights when ready

**Use Case**: User wants to work uninterrupted but have insights available

---

### 2. Proactive Suggestion Mode

Agents actively offer suggestions as user works.

**Behavior**:
- Agents display suggestions as floating cards
- Cards auto-dismiss after timeout or can be pinned
- High-confidence suggestions get more prominent display
- Critical warnings interrupt workflow

**Use Case**: User wants guidance but maintains control

---

### 3. Conversational Mode

Deep interaction through chat interface.

**Behavior**:
- User opens agent panel for focused conversation
- Natural language back-and-forth
- Agent can ask clarifying questions
- Rich responses with embedded actions

**Use Case**: User wants to explore options, get explanations, or make complex decisions

---

### 4. Guided Flow Mode

Agent takes the lead through a structured process.

**Behavior**:
- Agent presents step-by-step wizard
- Each step has clear actions
- Progress indicator shows remaining steps
- User can exit flow at any point

**Use Case**: New users, complex operations, batch processing

---

### 5. Collaborative Mode

Multiple agents work together on a task.

**Behavior**:
- Agents can hand off to each other
- Conversation shows agent transitions
- Combined insights from multiple perspectives
- Orchestrated by the user or a coordinator agent

**Example Flow**:
```
User: "Help me make this photo more dramatic"

Scout: "I'll find some dramatic references for you..."
       [Presents options]

User: [Selects a reference]

Analyst: "Good choice! This reference has strong contrast
         and cool shadows. Let me analyze how it'll
         combine with your base image..."

Composer: "I notice your base image is warm-toned.
          I'd recommend adding a color reference to
          preserve some warmth, or the result may
          feel too cold. What do you prefer?"

User: "Keep some warmth"

Composer: "Got it. I'll set the style influence to 70%
          and add a subtle warm color reference at 30%.
          Ready to generate?"
```

---

### Agent Summoning Patterns

**Methods to Activate an Agent**:

1. **Direct Click**: Click agent icon in dock
2. **Mention**: Type "@Scout find me..." in any input
3. **Context Menu**: Right-click image → "Ask Analyst"
4. **Keyboard Shortcut**: `Cmd+1` through `Cmd+5` for primary agents
5. **Voice** (future): "Hey Scout, find me..."
6. **Automatic**: Agent activates based on context triggers

**Dismissal Patterns**:

1. Click X on agent card
2. Click outside agent panel
3. Press Escape
4. Say "Thanks, that's all"
5. Agent auto-dismisses after task completion

---

## State Management

### Agent State Structure

```typescript
interface AgentState {
  agents: Record<string, AgentInstance>;
  activeAgentId: string | null;
  focusedAgentId: string | null;
  globalMode: AgentGlobalMode;
  preferences: AgentPreferences;
  history: AgentInteraction[];
}

interface AgentInstance {
  agent: Agent;
  status: AgentStatus;
  currentTask: AgentTask | null;
  insights: AgentInsight[];
  suggestions: AgentSuggestion[];
  chatHistory: ChatMessage[];
  lastActivity: Date;
  isEnabled: boolean;
  settings: AgentSettings;
}

interface AgentTask {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: Error;
}

type AgentGlobalMode =
  | 'passive'      // Agents observe silently
  | 'proactive'    // Agents offer suggestions
  | 'focused'      // One agent has full attention
  | 'collaborative' // Multiple agents working together
  | 'disabled';    // All agents paused

interface AgentPreferences {
  suggestionFrequency: 'low' | 'medium' | 'high';
  autoAnalysis: boolean;
  showConfidenceScores: boolean;
  enableAnimations: boolean;
  voiceEnabled: boolean;
  agentPersonalities: boolean; // Show personality in responses
}
```

### Zustand Store Extension

```typescript
interface AgentSlice {
  // State
  agents: AgentState;

  // Agent Lifecycle
  initializeAgents: () => void;
  enableAgent: (agentId: string) => void;
  disableAgent: (agentId: string) => void;

  // Focus Management
  setActiveAgent: (agentId: string | null) => void;
  setFocusedAgent: (agentId: string | null) => void;

  // Task Management
  startAgentTask: (agentId: string, task: AgentTask) => void;
  updateAgentTask: (agentId: string, taskId: string, updates: Partial<AgentTask>) => void;
  completeAgentTask: (agentId: string, taskId: string, result: unknown) => void;

  // Insights & Suggestions
  addInsight: (agentId: string, insight: AgentInsight) => void;
  dismissInsight: (agentId: string, insightId: string) => void;
  addSuggestion: (agentId: string, suggestion: AgentSuggestion) => void;
  applySuggestion: (agentId: string, suggestionId: string) => void;
  dismissSuggestion: (agentId: string, suggestionId: string) => void;

  // Chat
  addChatMessage: (agentId: string, message: ChatMessage) => void;
  clearChatHistory: (agentId: string) => void;

  // Global
  setGlobalMode: (mode: AgentGlobalMode) => void;
  updatePreferences: (preferences: Partial<AgentPreferences>) => void;
}
```

---

## Agent Communication Protocol

### Message Format

```typescript
interface AgentMessage {
  id: string;
  timestamp: Date;
  source: 'user' | 'agent' | 'system';
  agentId?: string;
  type: AgentMessageType;
  payload: unknown;
  context: MessageContext;
}

type AgentMessageType =
  // User → Agent
  | 'user_query'
  | 'user_command'
  | 'user_feedback'
  | 'user_selection'

  // Agent → User
  | 'agent_response'
  | 'agent_insight'
  | 'agent_suggestion'
  | 'agent_question'
  | 'agent_progress'
  | 'agent_error'

  // Agent → Agent
  | 'agent_handoff'
  | 'agent_request'
  | 'agent_data_share'

  // System
  | 'system_event'
  | 'context_update';

interface MessageContext {
  mainImage: string | null;
  references: ReferenceConfig[];
  currentParadigm: string;
  recentActions: string[];
  userPreferences: AgentPreferences;
}
```

### Agent API Interface

```typescript
interface AgentAPI {
  // Analysis
  analyzeImage(imageData: string): Promise<ImageAnalysis>;
  compareImages(image1: string, image2: string): Promise<ImageComparison>;

  // Search & Discovery
  findSimilarImages(imageData: string, options: SearchOptions): Promise<ImageResult[]>;
  searchByDescription(description: string, options: SearchOptions): Promise<ImageResult[]>;

  // Generation
  generatePreview(config: GenerationConfig): Promise<string>;
  generateFull(config: GenerationConfig): Promise<GenerationResult>;
  generateVariations(baseResult: string, count: number): Promise<string[]>;

  // Optimization
  suggestStrengths(config: GenerationConfig): Promise<StrengthSuggestion[]>;
  detectConflicts(config: GenerationConfig): Promise<Conflict[]>;
  optimizeConfig(config: GenerationConfig): Promise<GenerationConfig>;

  // Conversation
  chat(message: string, context: MessageContext): Promise<ChatResponse>;
}
```

---

## Visual Design System

### Agent Color Palette

Each agent has a signature color for instant recognition:

| Agent | Primary Color | Gradient | Icon |
|-------|--------------|----------|------|
| Scout | `#10B981` (Emerald) | Emerald → Teal | 🔍 |
| Analyst | `#6366F1` (Indigo) | Indigo → Purple | 📊 |
| Composer | `#F59E0B` (Amber) | Amber → Orange | 🎨 |
| Generator | `#EF4444` (Red) | Red → Rose | ⚡ |
| Critic | `#8B5CF6` (Violet) | Violet → Purple | 🎭 |
| History | `#6B7280` (Gray) | Gray → Slate | 📚 |
| Tutorial | `#3B82F6` (Blue) | Blue → Sky | 🎓 |
| Export | `#14B8A6` (Teal) | Teal → Cyan | 📤 |

### Agent Avatar Design

**Style**: Friendly, abstract, geometric

**States**:
- **Idle**: Static, subtle glow
- **Thinking**: Gentle pulse animation
- **Working**: Orbital animation / spinner
- **Success**: Brief celebration (sparkle/confetti)
- **Error**: Shake + red tint

### Animation Specifications

```typescript
// Agent appearance
const agentEnter = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 25 }
};

// Message appearance
const messageEnter = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 30 }
};

// Thinking indicator
const thinkingPulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7]
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// Suggestion card hover
const suggestionHover = {
  scale: 1.02,
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  transition: { type: 'spring', stiffness: 400 }
};
```

### Typography

- **Agent Name**: `font-semibold text-sm`
- **Agent Status**: `font-medium text-xs text-gray-500`
- **Chat Message**: `font-normal text-sm leading-relaxed`
- **Insight Title**: `font-semibold text-base`
- **Insight Body**: `font-normal text-sm text-gray-600`
- **Action Button**: `font-medium text-sm`

---

## Accessibility Considerations

### Screen Reader Support

```tsx
// Agent status announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {agentStatus === 'thinking' && `${agent.name} is analyzing your image`}
  {agentStatus === 'suggesting' && `${agent.name} has ${suggestions.length} suggestions`}
</div>

// Chat messages
<div role="log" aria-label={`Conversation with ${agent.name}`}>
  {messages.map(msg => (
    <div
      key={msg.id}
      role="article"
      aria-label={`${msg.sender === 'agent' ? agent.name : 'You'} said`}
    >
      {msg.content}
    </div>
  ))}
</div>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between agents in dock |
| `Enter` | Activate focused agent |
| `Escape` | Dismiss current agent panel |
| `Cmd+1-5` | Quick access to primary agents |
| `Cmd+/` | Toggle agent mode (passive/proactive) |
| `Arrow Up/Down` | Navigate chat history |

### Reduced Motion

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animation = prefersReducedMotion
  ? { opacity: 1 }
  : { opacity: 1, scale: 1, y: 0 };
```

---

## Implementation Roadmap

### Phase 1: Foundation (Core Infrastructure)

**Components**:
- [ ] AgentDock component
- [ ] AgentCard component
- [ ] AgentPanel container
- [ ] Basic agent state management

**Features**:
- [ ] Agent dock with status indicators
- [ ] Click to focus agent
- [ ] Basic panel open/close
- [ ] Agent status display

---

### Phase 2: Analyst Agent (First Agent)

**Components**:
- [ ] AgentInsightCard
- [ ] AnalysisResultView
- [ ] ColorPaletteDisplay
- [ ] CompositionOverlay

**Features**:
- [ ] Automatic image analysis on upload
- [ ] Color palette extraction
- [ ] Composition analysis visualization
- [ ] Basic insights display

---

### Phase 3: Chat Interface

**Components**:
- [ ] AgentChatInterface
- [ ] ChatMessage variants
- [ ] QuickReplyButtons
- [ ] ActionButtons

**Features**:
- [ ] Text input and send
- [ ] Message history display
- [ ] Quick reply suggestions
- [ ] Inline action buttons

---

### Phase 4: Scout Agent

**Components**:
- [ ] ImageSearchResults
- [ ] SuggestionCarousel
- [ ] ReferencePreview

**Features**:
- [ ] Search by description
- [ ] Similar image finding
- [ ] Reference suggestions
- [ ] One-click add reference

---

### Phase 5: Composer Agent

**Components**:
- [ ] ConflictWarning
- [ ] StrengthOptimizer
- [ ] CompositionPreview

**Features**:
- [ ] Conflict detection
- [ ] Strength recommendations
- [ ] Pre-generation validation
- [ ] Configuration optimization

---

### Phase 6: Generator Agent

**Components**:
- [ ] GenerationProgress (enhanced)
- [ ] IntermediatePreview
- [ ] VariationGrid

**Features**:
- [ ] Narrated generation progress
- [ ] Intermediate previews
- [ ] Variation generation
- [ ] Error recovery

---

### Phase 7: Polish & Integration

**Features**:
- [ ] Agent handoff flows
- [ ] Collaborative mode
- [ ] Preference learning
- [ ] Performance optimization
- [ ] Full accessibility audit

---

## Appendix: File Structure

```
app/src/
├── components/
│   └── agents/
│       ├── AgentDock/
│       │   ├── AgentDock.tsx
│       │   ├── AgentDockItem.tsx
│       │   └── index.ts
│       ├── AgentPanel/
│       │   ├── AgentPanel.tsx
│       │   ├── AgentHeader.tsx
│       │   ├── AgentContent.tsx
│       │   └── index.ts
│       ├── AgentCard/
│       │   ├── AgentCard.tsx
│       │   ├── AgentAvatar.tsx
│       │   ├── AgentStatus.tsx
│       │   └── index.ts
│       ├── AgentChat/
│       │   ├── AgentChatInterface.tsx
│       │   ├── ChatMessage.tsx
│       │   ├── QuickReplies.tsx
│       │   ├── ChatInput.tsx
│       │   └── index.ts
│       ├── AgentInsights/
│       │   ├── AgentInsightCard.tsx
│       │   ├── AnalysisResult.tsx
│       │   ├── SuggestionCard.tsx
│       │   └── index.ts
│       ├── AgentOverlay/
│       │   ├── AnnotationOverlay.tsx
│       │   ├── GuidedFlow.tsx
│       │   └── index.ts
│       └── shared/
│           ├── AgentButton.tsx
│           ├── ConfidenceBadge.tsx
│           └── index.ts
├── store/
│   └── slices/
│       └── agentSlice.ts
├── types/
│   └── agents.ts
├── utils/
│   └── agentHelpers.ts
└── hooks/
    └── useAgent.ts
```

---

## Conclusion

This specification defines a comprehensive agent-based UI system that transforms ZimZora from a manual composition tool into an intelligent creative assistant platform. The agents provide contextual help, automated analysis, and smart recommendations while keeping the user in full creative control.

The modular design allows for incremental implementation, starting with core infrastructure and the Analyst agent, then progressively adding more sophisticated agents and interaction patterns.

Key differentiators:
- **Personality-driven agents** that feel like creative collaborators
- **Multiple interaction modes** from passive to fully guided
- **Transparent reasoning** so users understand suggestions
- **Seamless integration** with existing paradigms
- **Accessible by design** for all users

This foundation can evolve to support more advanced features like voice interaction, preference learning, and multi-user collaboration in future iterations.
