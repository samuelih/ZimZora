# Recipe/Ingredient Metaphor Technical Specification

## Overview

The Recipe paradigm frames image generation as cooking a recipe. The main image is the "dish" being prepared, and reference images are "ingredients" that get added. The interface resembles a recipe card with a clear, linear, top-to-bottom structure that makes the process highly approachable.

---

## Component Architecture

### Component Hierarchy

```
RecipeIngredientUI
├── RecipeCard
│   ├── RecipeHeader
│   │   ├── RecipeTitle
│   │   └── RecipeActions (save, share, reset)
│   ├── BaseSection
│   │   ├── SectionLabel
│   │   ├── BaseImageDisplay
│   │   └── ChangeBaseButton
│   ├── IngredientsList
│   │   ├── IngredientsHeader
│   │   │   ├── SectionLabel
│   │   │   └── IngredientCount
│   │   └── IngredientRow[] (sortable)
│   │       ├── DragHandle
│   │       ├── IngredientThumbnail
│   │       ├── IngredientInfo
│   │       │   ├── IngredientName
│   │       │   └── TypeBadge
│   │       ├── AmountControl
│   │       ├── ExpandToggle
│   │       └── DeleteButton
│   ├── AddIngredientButton
│   └── CookSection
│       ├── RecipeSummary
│       └── CookButton
├── IngredientDetailPanel (expanded state)
│   ├── FullPreview
│   ├── TypeSelector
│   ├── AmountSlider
│   ├── RegionOptions
│   ├── NotesField
│   └── ActionButtons
├── AddIngredientModal
│   ├── UploadZone
│   ├── LibraryGrid
│   └── RecentIngredients
└── GeneratingOverlay
    ├── ProgressIndicator
    └── ResultPreview
```

### Component Specifications

#### RecipeIngredientUI (Root)
```typescript
interface RecipeIngredientUIProps {
  initialState?: RecipeState;
  onStateChange?: (state: RecipeState) => void;
}
```
- Centers recipe card in viewport
- Manages modals and overlays

#### RecipeCard
```typescript
interface RecipeCardProps {
  recipe: Recipe;
  onUpdateBase: (image: LibraryImage) => void;
  onAddIngredient: (image: LibraryImage, type: NodeType) => void;
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  onRemoveIngredient: (id: string) => void;
  onReorderIngredients: (from: number, to: number) => void;
  onCook: () => void;
}
```
- Main container styled as recipe card
- Fixed max-width: 520px
- Scrollable on overflow

#### BaseSection
```typescript
interface BaseSectionProps {
  baseImage: BaseImage | null;
  onChangeBase: () => void;
}
```
- Prominent display of base/main image
- Large thumbnail (200px height)
- Clear "Base" or "Start With" label

#### IngredientRow
```typescript
interface IngredientRowProps {
  ingredient: Ingredient;
  index: number;
  isExpanded: boolean;
  isDragging: boolean;
  onExpand: () => void;
  onUpdate: (updates: Partial<Ingredient>) => void;
  onDelete: () => void;
  dragHandleProps: DragHandleProps;
}
```
- Compact row showing essential info
- Expandable for detailed settings
- Drag handle for reordering

#### AmountControl
```typescript
interface AmountControlProps {
  value: number;  // 0-100
  mode: 'percentage' | 'culinary';
  onChange: (value: number) => void;
  onModeChange: (mode: 'percentage' | 'culinary') => void;
}

// Culinary term mappings
const culinaryTerms = [
  { label: 'A pinch', range: [5, 15], midpoint: 10 },
  { label: 'A dash', range: [15, 30], midpoint: 22 },
  { label: 'A spoonful', range: [30, 50], midpoint: 40 },
  { label: 'A portion', range: [50, 70], midpoint: 60 },
  { label: 'A generous helping', range: [70, 85], midpoint: 77 },
  { label: 'The whole thing', range: [85, 100], midpoint: 95 }
];
```
- Two modes: percentage slider or culinary terms
- Visual representation of amount
- Toggle between modes

#### AddIngredientButton
```typescript
interface AddIngredientButtonProps {
  onClick: () => void;
  disabled: boolean;
  maxIngredients: number;
  currentCount: number;
}
```
- Prominent "+" button
- Shows count limit if approaching max
- Opens add modal on click

#### CookButton
```typescript
interface CookButtonProps {
  recipe: Recipe;
  isValid: boolean;
  isGenerating: boolean;
  onCook: () => void;
}
```
- Large, prominent action button
- Disabled if recipe invalid
- Shows generating state

#### IngredientDetailPanel
```typescript
interface IngredientDetailPanelProps {
  ingredient: Ingredient;
  onUpdate: (updates: Partial<Ingredient>) => void;
  onClose: () => void;
}
```
- Expanded view of ingredient
- All configuration options
- Inline editing

---

## State Management

### State Shape

```typescript
interface RecipeState {
  // Base/main image
  base: BaseImage | null;

  // Ingredients list (ordered)
  ingredients: Ingredient[];

  // Image library
  library: LibraryImage[];

  // UI state
  ui: {
    expandedIngredientId: string | null;
    amountMode: 'percentage' | 'culinary';
    showAddModal: boolean;
    isGenerating: boolean;
    generationProgress: number;
  };

  // Result
  result: {
    imageSrc: string | null;
    generatedAt: Date | null;
  };

  // History
  history: HistoryState;
}

interface BaseImage {
  id: string;
  src: string;
  name: string;
  uploadedAt: Date;
}

interface Ingredient {
  id: string;
  imageId: string;
  imageSrc: string;
  imageThumbnail: string;
  name: string;
  nodeType: NodeType;
  amount: number;      // 0-100
  isActive: boolean;
  order: number;       // Position in list

  // Advanced options
  region?: RegionConfig;
  blendMode?: BlendMode;
  notes?: string;
}

interface RegionConfig {
  type: 'all' | 'foreground' | 'background' | 'custom';
  customMask?: string;  // Base64 encoded
}

type BlendMode = 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light';
```

### State Update Patterns

```typescript
type RecipeAction =
  // Base actions
  | { type: 'SET_BASE'; payload: BaseImage }
  | { type: 'CLEAR_BASE' }

  // Ingredient actions
  | { type: 'ADD_INGREDIENT'; payload: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; payload: { id: string; updates: Partial<Ingredient> } }
  | { type: 'REMOVE_INGREDIENT'; payload: string }
  | { type: 'REORDER_INGREDIENTS'; payload: { from: number; to: number } }
  | { type: 'TOGGLE_INGREDIENT'; payload: string }

  // Library actions
  | { type: 'ADD_TO_LIBRARY'; payload: LibraryImage }
  | { type: 'REMOVE_FROM_LIBRARY'; payload: string }

  // UI actions
  | { type: 'EXPAND_INGREDIENT'; payload: string | null }
  | { type: 'SET_AMOUNT_MODE'; payload: 'percentage' | 'culinary' }
  | { type: 'TOGGLE_ADD_MODAL' }
  | { type: 'START_GENERATING' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_RESULT'; payload: { imageSrc: string } }

  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// Reducer with order maintenance
function recipeReducer(state: RecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    case 'REORDER_INGREDIENTS': {
      const { from, to } = action.payload;
      const ingredients = [...state.ingredients];
      const [moved] = ingredients.splice(from, 1);
      ingredients.splice(to, 0, moved);

      // Update order values
      return {
        ...state,
        ingredients: ingredients.map((ing, idx) => ({
          ...ing,
          order: idx
        }))
      };
    }
    // ... other cases
  }
}
```

---

## Data Structures

### TypeScript Interfaces

```typescript
// Recipe summary for display
interface RecipeSummary {
  baseImage: string;
  ingredientCount: number;
  totalInfluence: number;  // Sum of all amounts
  dominantType: NodeType;  // Most common type
  estimatedTime: string;   // Mock estimate
}

function calculateRecipeSummary(recipe: RecipeState): RecipeSummary {
  const activeIngredients = recipe.ingredients.filter(i => i.isActive);

  const typeCounts = activeIngredients.reduce((acc, ing) => {
    acc[ing.nodeType] = (acc[ing.nodeType] || 0) + 1;
    return acc;
  }, {} as Record<NodeType, number>);

  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as NodeType || NodeType.STYLE;

  return {
    baseImage: recipe.base?.name || 'None',
    ingredientCount: activeIngredients.length,
    totalInfluence: activeIngredients.reduce((sum, i) => sum + i.amount, 0),
    dominantType,
    estimatedTime: calculateEstimatedTime(activeIngredients.length)
  };
}

// Culinary amount conversion
function amountToTerm(amount: number): string {
  for (const term of culinaryTerms) {
    if (amount >= term.range[0] && amount <= term.range[1]) {
      return term.label;
    }
  }
  return 'A portion';
}

function termToAmount(term: string): number {
  const found = culinaryTerms.find(t => t.label === term);
  return found?.midpoint || 50;
}

// Serialization format
interface RecipeConfiguration {
  version: string;
  name: string;
  description?: string;
  base: {
    src: string;
    name: string;
  } | null;
  ingredients: Array<{
    src: string;
    name: string;
    nodeType: NodeType;
    amount: number;
    region?: RegionConfig;
    blendMode?: BlendMode;
    notes?: string;
  }>;
  settings: {
    amountMode: 'percentage' | 'culinary';
  };
}
```

---

## Interaction Handlers

### Ingredient Management

```typescript
const ingredientHandlers = {
  // Add ingredient
  onAddIngredient: (image: LibraryImage) => {
    const suggestedType = image.suggestedType || NodeType.STYLE;

    const newIngredient: Ingredient = {
      id: generateId(),
      imageId: image.id,
      imageSrc: image.src,
      imageThumbnail: image.thumbnail,
      name: image.name,
      nodeType: suggestedType,
      amount: 50,
      isActive: true,
      order: ingredients.length
    };

    dispatch({ type: 'ADD_INGREDIENT', payload: newIngredient });
    dispatch({ type: 'TOGGLE_ADD_MODAL' });

    // Optionally expand for immediate configuration
    dispatch({ type: 'EXPAND_INGREDIENT', payload: newIngredient.id });
  },

  // Update ingredient
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => {
    dispatch({ type: 'UPDATE_INGREDIENT', payload: { id, updates } });
  },

  // Remove ingredient
  onRemoveIngredient: (id: string) => {
    // Animate out first
    animateRemove(id).then(() => {
      dispatch({ type: 'REMOVE_INGREDIENT', payload: id });
    });
  },

  // Toggle active state
  onToggleIngredient: (id: string) => {
    dispatch({ type: 'TOGGLE_INGREDIENT', payload: id });
  },

  // Expand/collapse
  onExpandIngredient: (id: string) => {
    const isExpanded = expandedIngredientId === id;
    dispatch({
      type: 'EXPAND_INGREDIENT',
      payload: isExpanded ? null : id
    });
  }
};
```

### Drag and Drop Reordering

```typescript
// Using @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = ingredients.findIndex(i => i.id === active.id);
    const newIndex = ingredients.findIndex(i => i.id === over.id);

    dispatch({
      type: 'REORDER_INGREDIENTS',
      payload: { from: oldIndex, to: newIndex }
    });
  }
};

// Usage
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={ingredients.map(i => i.id)}
    strategy={verticalListSortingStrategy}
  >
    {ingredients.map((ingredient, index) => (
      <SortableIngredientRow
        key={ingredient.id}
        ingredient={ingredient}
        index={index}
      />
    ))}
  </SortableContext>
</DndContext>
```

### Amount Control Interactions

```typescript
const amountHandlers = {
  // Slider change
  onSliderChange: (id: string, value: number) => {
    dispatch({
      type: 'UPDATE_INGREDIENT',
      payload: { id, updates: { amount: value } }
    });
  },

  // Culinary term selection
  onTermSelect: (id: string, term: string) => {
    const amount = termToAmount(term);
    dispatch({
      type: 'UPDATE_INGREDIENT',
      payload: { id, updates: { amount } }
    });
  },

  // Mode toggle
  onToggleMode: () => {
    const newMode = amountMode === 'percentage' ? 'culinary' : 'percentage';
    dispatch({ type: 'SET_AMOUNT_MODE', payload: newMode });
  }
};
```

### Swipe to Delete (Mobile)

```typescript
const swipeHandlers = {
  onSwipeStart: (id: string) => {
    setSwipingId(id);
  },

  onSwipe: (id: string, deltaX: number) => {
    // Show delete button as swipe progresses
    setSwipeProgress(Math.min(1, Math.abs(deltaX) / 100));
  },

  onSwipeEnd: (id: string, deltaX: number) => {
    if (Math.abs(deltaX) > 100) {
      // Confirm and delete
      onRemoveIngredient(id);
    } else {
      // Snap back
      resetSwipe(id);
    }
  }
};
```

### Cook/Generate Flow

```typescript
const cookHandlers = {
  onCook: async () => {
    // Validate recipe
    if (!base) {
      showError('Please add a base image first');
      return;
    }

    if (activeIngredients.length === 0) {
      showError('Please add at least one ingredient');
      return;
    }

    // Start generation
    dispatch({ type: 'START_GENERATING' });

    // Simulate generation (mock)
    for (let i = 0; i <= 100; i += 10) {
      await delay(300);
      dispatch({ type: 'UPDATE_PROGRESS', payload: i });
    }

    // Set result
    const resultSrc = await generateMockResult(base, ingredients);
    dispatch({ type: 'SET_RESULT', payload: { imageSrc: resultSrc } });
  }
};
```

### Keyboard Shortcuts

```typescript
const keyboardShortcuts = {
  // Navigation
  'ArrowUp': selectPreviousIngredient,
  'ArrowDown': selectNextIngredient,
  'Enter': expandSelectedIngredient,
  'Escape': collapseIngredient,

  // Actions
  'Delete': removeSelectedIngredient,
  'Backspace': removeSelectedIngredient,
  'n': openAddModal,
  'Space': toggleSelectedIngredient,

  // Amount adjustments
  '+': increaseAmount(10),
  '-': decreaseAmount(10),
  'Shift++': increaseAmount(5),
  'Shift+-': decreaseAmount(5),

  // Reorder
  'Ctrl+ArrowUp': moveIngredientUp,
  'Ctrl+ArrowDown': moveIngredientDown,

  // Cook
  'Ctrl+Enter': cook,

  // History
  'Ctrl+Z': undo,
  'Ctrl+Shift+Z': redo
};
```

---

## Visual Design Specifications

### Color Palette

```css
/* Recipe card */
--recipe-bg: #ffffff;
--recipe-border: #e2e8f0;
--recipe-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Warm accents */
--accent-warm: #f59e0b;
--accent-warm-light: #fef3c7;

/* Section colors */
--section-bg: #f8fafc;
--section-border: #e2e8f0;

/* Ingredient row */
--ingredient-bg: #ffffff;
--ingredient-hover: #f1f5f9;
--ingredient-active: #e0e7ff;
--ingredient-inactive: #f1f5f9;

/* Amount indicator */
--amount-track: #e2e8f0;
--amount-fill: #6366f1;
--amount-thumb: #4f46e5;

/* Cook button */
--cook-bg: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--cook-hover: linear-gradient(135deg, #d97706 0%, #b45309 100%);
--cook-text: #ffffff;

/* Type badges (inherit from shared) */
```

### Recipe Card Design

```
┌─────────────────────────────────────┐
│           🍳 My Recipe              │  ← Recipe title
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     📷 Base Image             │  │  ← Base section
│  │       (Tap to change)         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ─ ─ ─ ─ Ingredients (3) ─ ─ ─ ─   │  ← Divider
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ☰ [img] Style Reference       │  │  ← Ingredient row
│  │       🎨 Style   ═══════75%   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ☰ [img] Color Palette         │  │
│  │       🌈 Color   ════50%      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ☰ [img] Furniture Style       │  │
│  │       🪑 Object  ══60%        │  │
│  └───────────────────────────────┘  │
│                                     │
│         [+ Add Ingredient]          │  ← Add button
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     🍳  Cook This Recipe      │  │  ← Cook button
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  3 ingredients • ~15 sec            │  ← Summary
└─────────────────────────────────────┘
```

### Ingredient Row States

```
Default:
┌───────────────────────────────────────┐
│ ☰  [img]  Style Reference     × │
│           🎨 Style  ═══════▒▒▒ 75% │
└───────────────────────────────────────┘

Expanded:
┌───────────────────────────────────────┐
│ ☰  [img]  Style Reference     ▼ │
│           🎨 Style                    │
├───────────────────────────────────────┤
│  Type: [🎨 Style     ▼]              │
│                                       │
│  Amount: ═══════════════▒▒▒▒ 75%     │
│          A generous helping           │
│                                       │
│  Apply to: [○ All  ○ Region]         │
│                                       │
│  Notes: [                    ]        │
│                                       │
│  [Remove Ingredient]                  │
└───────────────────────────────────────┘

Dragging:
┌───────────────────────────────────────┐
│ ☰  [img]  Style Reference            │ ← Elevated shadow
│           🎨 Style  ═══════▒▒▒ 75%   │   Slight rotation
└───────────────────────────────────────┘

Inactive:
┌───────────────────────────────────────┐
│ ☰  [img]  Style Reference     × │ ← Reduced opacity
│           🎨 Style  ═══════▒▒▒ 75% │   Strikethrough
└───────────────────────────────────────┘
```

### Amount Control Modes

```
Percentage Mode:
┌─────────────────────────────────────┐
│ Amount                              │
│ ═════════════════▒▒▒▒▒▒▒▒▒▒ [75%]  │
└─────────────────────────────────────┘

Culinary Mode:
┌─────────────────────────────────────┐
│ Amount                              │
│ [A pinch] [A dash] [A spoonful]     │
│ [A portion] [●Generous] [All of it] │
└─────────────────────────────────────┘
```

### Animations

```css
/* Ingredient add */
@keyframes ingredientAdd {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  duration: 250ms;
  easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Ingredient remove */
@keyframes ingredientRemove {
  to {
    opacity: 0;
    transform: translateX(-100%);
    height: 0;
    margin: 0;
    padding: 0;
  }
  duration: 200ms;
  easing: ease-in;
}

/* Expand/collapse */
@keyframes expand {
  from { max-height: 0; opacity: 0; }
  to { max-height: 300px; opacity: 1; }
  duration: 200ms;
  easing: ease-out;
}

/* Cook button pulse */
@keyframes cookPulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  100% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  duration: 1.5s;
  iteration: infinite;
}

/* Drag item */
.dragging {
  box-shadow: var(--shadow-lg);
  transform: rotate(2deg) scale(1.02);
  opacity: 0.9;
}
```

### Typography

```css
/* Recipe title */
--recipe-title: 700 24px/1.2 'Inter';

/* Section label */
--section-label: 600 12px/1 'Inter';
text-transform: uppercase;
letter-spacing: 0.5px;
color: var(--color-text-muted);

/* Ingredient name */
--ingredient-name: 500 14px/1.3 'Inter';

/* Type badge */
--type-badge: 600 10px/1 'Inter';

/* Amount value */
--amount-value: 600 14px/1 'Inter';

/* Culinary term */
--culinary-term: 500 13px/1.3 'Inter';
font-style: italic;

/* Cook button */
--cook-text: 700 16px/1 'Inter';
```

---

## Responsive Behavior

### Desktop (1920px, 1440px, 1280px)

```
┌─────────────────────────────────────────────────────────┐
│                       Toolbar                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 ┌───────────────────┐                   │
│                 │                   │                   │
│                 │   Recipe Card     │                   │
│                 │   max-width: 520px│                   │
│                 │                   │                   │
│                 │                   │                   │
│                 │                   │                   │
│                 │                   │                   │
│                 └───────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Recipe card: Centered, max-width 520px
- Generous padding around card
- Floating action buttons

### Tablet (1024px, 768px)

```
┌───────────────────────────────────────────┐
│                Toolbar                    │
├───────────────────────────────────────────┤
│                                           │
│        ┌───────────────────────┐          │
│        │                       │          │
│        │     Recipe Card       │          │
│        │     max-width: 480px  │          │
│        │                       │          │
│        │                       │          │
│        └───────────────────────┘          │
│                                           │
└───────────────────────────────────────────┘
```

- Recipe card: max-width 480px
- Touch-optimized row heights (min 56px)
- Larger touch targets

### Mobile (428px, 375px)

```
┌─────────────────────────┐
│        Toolbar          │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   Recipe Card     │  │
│  │   (full width)    │  │
│  │                   │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│  [🍳 Cook Recipe]       │ ← Sticky bottom bar
└─────────────────────────┘
```

- Full-width card with horizontal padding
- Larger ingredient rows (72px)
- Sticky cook button at bottom
- Swipe to delete
- Bottom sheet for add modal
- Simplified expanded state

---

## Accessibility Requirements

### Keyboard Navigation

```typescript
const keyboardNav = {
  // List navigation
  'ArrowUp': 'Previous ingredient',
  'ArrowDown': 'Next ingredient',

  // Row actions
  'Enter': 'Expand/collapse ingredient',
  'Delete': 'Remove ingredient',
  'Space': 'Toggle active state',

  // Focus management
  'Tab': 'Move to next control',
  'Shift+Tab': 'Move to previous control',

  // Reordering
  'Ctrl+ArrowUp': 'Move ingredient up',
  'Ctrl+ArrowDown': 'Move ingredient down'
};
```

### Screen Reader Support

```typescript
const ariaLabels = {
  recipeCard: 'Recipe with {n} ingredients',
  baseSection: 'Base image: {name}',
  ingredientsList: 'Ingredients list, {n} items',
  ingredientRow: '{name}, {type} ingredient, {amount}% amount, position {i} of {n}',
  amountSlider: 'Amount control for {name}, currently {amount}%',
  addButton: 'Add new ingredient',
  cookButton: 'Generate image from recipe'
};

const liveRegions = {
  ingredientAdded: '{name} added to recipe',
  ingredientRemoved: '{name} removed from recipe',
  ingredientMoved: '{name} moved to position {n}',
  amountChanged: '{name} amount set to {amount}%',
  generationStarted: 'Generating image...',
  generationComplete: 'Image generated successfully'
};
```

### ARIA Attributes

```tsx
// Recipe card
<div
  role="form"
  aria-label="Image recipe builder"
>

// Ingredients list
<ul
  role="list"
  aria-label={`Ingredients, ${ingredients.length} items`}
>

// Ingredient row
<li
  role="listitem"
  aria-label={`${ingredient.name}, ${ingredient.nodeType} ingredient`}
  aria-expanded={isExpanded}
>

// Sortable handle
<div
  role="button"
  aria-label="Drag to reorder"
  aria-describedby="reorder-instructions"
>

// Amount slider
<input
  type="range"
  role="slider"
  aria-label={`Amount for ${ingredient.name}`}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={ingredient.amount}
  aria-valuetext={amountMode === 'culinary' ?
    amountToTerm(ingredient.amount) :
    `${ingredient.amount}%`
  }
/>

// Cook button
<button
  aria-label="Generate image from recipe"
  aria-busy={isGenerating}
  aria-disabled={!isValid}
>
```

---

## Performance Considerations

### Rendering Optimizations

```typescript
// Memoize ingredient rows
const IngredientRow = React.memo(({ ingredient, ... }) => {
  // Render
}, (prev, next) => {
  return (
    prev.ingredient.amount === next.ingredient.amount &&
    prev.ingredient.isActive === next.ingredient.isActive &&
    prev.isExpanded === next.isExpanded &&
    prev.index === next.index
  );
});

// Lazy load expanded content
const IngredientDetails = React.lazy(() =>
  import('./IngredientDetails')
);

// Debounce amount updates
const debouncedAmount = useDebouncedCallback(
  (id, amount) => updateIngredient(id, { amount }),
  100
);
```

### Image Handling

```typescript
// Progressive image loading
function IngredientThumbnail({ src, thumbnail }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="thumbnail-container">
      <img
        src={thumbnail}
        className={cn('blur-up', loaded && 'loaded')}
      />
      <img
        src={src}
        onLoad={() => setLoaded(true)}
        className="full-image"
      />
    </div>
  );
}
```

---

## Implementation Notes

### Recommended Libraries

- **Drag and drop**: @dnd-kit/core, @dnd-kit/sortable
- **Gestures**: react-use-gesture (for swipe)
- **Animations**: Framer Motion
- **Forms**: React Hook Form (for expanded state)

### File Structure

```
/components/recipe/
  RecipeIngredientUI.tsx
  RecipeCard.tsx
  BaseSection.tsx
  IngredientsList.tsx
  IngredientRow.tsx
  AmountControl.tsx
  AddIngredientModal.tsx
  CookSection.tsx
  GeneratingOverlay.tsx
  hooks/
    useRecipeState.ts
    useDragReorder.ts
    useSwipeToDelete.ts
  utils/
    culinaryTerms.ts
    validation.ts
```
