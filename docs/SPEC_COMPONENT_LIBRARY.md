# Shared Component Library Specification

## Overview

This document specifies the shared component library used across all five UI paradigms. Components are designed to be reusable, accessible, and visually consistent.

---

## Design Tokens

### Colors

```typescript
// design-tokens.ts
export const colors = {
  // Primary
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81'
  },

  // Neutrals
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // Node type colors
  nodeTypes: {
    style: '#8b5cf6',
    object: '#3b82f6',
    color: '#f59e0b',
    texture: '#10b981',
    pose: '#ec4899',
    lighting: '#f97316',
    composition: '#06b6d4',
    face: '#ef4444',
    background: '#84cc16',
    depth: '#6366f1',
    negative: '#64748b'
  },

  // Semantic
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6'
};
```

### Typography

```typescript
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  }
};
```

### Spacing

```typescript
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem'      // 80px
};
```

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};
```

### Border Radius

```typescript
export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px'
};
```

---

## Base Components

### Button

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// Styling
const buttonStyles = {
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',

  variants: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  },

  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  },

  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'relative text-transparent'
};
```

### IconButton

```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;  // For accessibility
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

// Sizing
const iconButtonSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};
```

### Input

```typescript
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  label?: string;
  error?: string;
  disabled?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const inputStyles = {
  base: 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed'
};
```

### Slider

```typescript
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

// Implementation notes:
// - Use native <input type="range"> with custom styling
// - Show tooltip on drag
// - Support keyboard navigation
// - Fill track to show progress
```

### Select/Dropdown

```typescript
interface SelectProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
    icon?: React.ReactNode;
    description?: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Grouped options
interface SelectGroupProps<T> {
  label: string;
  options: SelectProps<T>['options'];
}
```

### Toggle/Switch

```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### Tooltip

```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}
```

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};
```

### Badge

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

// Node type badge
interface NodeTypeBadgeProps {
  type: NodeType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}
```

---

## Composite Components

### NodeCard

Displays a reference image with its configuration controls.

```typescript
interface NodeCardProps {
  image: {
    src: string;
    thumbnail: string;
    name: string;
  };
  nodeType: NodeType;
  strength: number;
  isActive: boolean;
  isSelected?: boolean;
  onTypeChange: (type: NodeType) => void;
  onStrengthChange: (strength: number) => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onClick?: () => void;
  variant?: 'compact' | 'expanded';
  className?: string;
}

// Visual structure (compact)
/*
┌─────────────────────────────────┐
│ [thumbnail] Name         ✕ │
│             🎨 Style  75%      │
└─────────────────────────────────┘
*/

// Visual structure (expanded)
/*
┌─────────────────────────────────┐
│        [Large Thumbnail]        │
│                                 │
│  Name                           │
│  [Type Selector     ▼]          │
│  Strength: ═══════▒ 75%        │
│                                 │
│  [Delete]                       │
└─────────────────────────────────┘
*/
```

### StrengthSliderWithLabel

Combined strength control with visual feedback.

```typescript
interface StrengthSliderWithLabelProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  nodeType?: NodeType;  // For color theming
  showCulinaryTerm?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Visual structure
/*
┌─────────────────────────────────┐
│ Strength                  75%   │
│ ════════════════▒▒▒▒▒▒▒▒▒▒     │
│ "A generous helping"            │
└─────────────────────────────────┘
*/
```

### ImageUploadZone

Drag-and-drop image upload area.

```typescript
interface ImageUploadZoneProps {
  onUpload: (files: File[]) => void;
  onError: (error: UploadError) => void;
  isUploading: boolean;
  progress?: number;
  accept?: string[];
  maxFiles?: number;
  maxSize?: number;
  variant?: 'default' | 'compact' | 'inline';
  children?: React.ReactNode;
  className?: string;
}

// Visual states
// - Default: Dashed border, upload icon, "Drop images here"
// - Drag over: Solid border, highlight color
// - Uploading: Progress indicator
// - Error: Error message display
```

### ImageThumbnail

Consistent image thumbnail display.

```typescript
interface ImageThumbnailProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: 'square' | '4:3' | '16:9';
  rounded?: boolean;
  border?: boolean;
  overlay?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const thumbnailSizes = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};
```

### NodeTypeSelector

Selector for choosing influence type.

```typescript
interface NodeTypeSelectorProps {
  value: NodeType;
  onChange: (type: NodeType) => void;
  variant?: 'dropdown' | 'grid' | 'radio';
  showDescriptions?: boolean;
  showIcons?: boolean;
  disabled?: boolean;
  className?: string;
}

// Dropdown variant: Standard select with icons
// Grid variant: 3x4 grid of type buttons
// Radio variant: Vertical list with descriptions
```

### GenerationPreviewPanel

Shows generation progress and result.

```typescript
interface GenerationPreviewPanelProps {
  state: GenerationState;
  mainImage?: string;
  resultImage?: string;
  onGenerate: () => void;
  onCancel?: () => void;
  onSaveResult?: () => void;
  variant?: 'inline' | 'overlay' | 'sidebar';
}

// Visual states
// - Idle: Shows main image, "Generate" button
// - Generating: Progress bar, step message, cancel option
// - Complete: Result image with compare/save options
// - Error: Error message with retry option
```

---

## Layout Components

### SplitPane

Resizable split panel layout.

```typescript
interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSize?: number | string;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
  resizable?: boolean;
  onResize?: (size: number) => void;
}
```

### Sidebar

Collapsible sidebar panel.

```typescript
interface SidebarProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  position?: 'left' | 'right';
  width?: number;
  collapsedWidth?: number;
  title?: string;
  actions?: React.ReactNode;
}
```

### Panel

Generic panel container.

```typescript
interface PanelProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}
```

### Toolbar

Horizontal toolbar container.

```typescript
interface ToolbarProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  variant?: 'default' | 'floating';
  className?: string;
}

interface ToolbarGroupProps {
  children: React.ReactNode;
  divider?: boolean;
}

interface ToolbarItemProps {
  children: React.ReactNode;
  tooltip?: string;
}
```

### CanvasContainer

Container for canvas-based paradigms with pan/zoom.

```typescript
interface CanvasContainerProps {
  children: React.ReactNode;
  transform: CanvasTransform;
  onTransformChange: (transform: CanvasTransform) => void;
  minZoom?: number;
  maxZoom?: number;
  background?: 'dots' | 'grid' | 'none';
  backgroundProps?: {
    size?: number;
    color?: string;
  };
  className?: string;
}
```

---

## Feedback Components

### Toast

Toast notification system.

```typescript
interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

// Toast manager hook
function useToast() {
  return {
    show: (props: Omit<ToastProps, 'onClose'>) => void,
    success: (message: string) => void,
    error: (message: string) => void,
    info: (message: string) => void
  };
}
```

### ProgressBar

Progress indication.

```typescript
interface ProgressBarProps {
  value: number;  // 0-100
  max?: number;
  variant?: 'default' | 'striped' | 'animated';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}
```

### Spinner

Loading spinner.

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}
```

### EmptyState

Empty state placeholder.

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## Icon System

### Icon Component

```typescript
interface IconProps {
  name: string;
  size?: number | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

// Use lucide-react for icons
import {
  Palette,        // style
  Box,            // object
  Droplet,        // color
  Grid3X3,        // texture
  PersonStanding, // pose
  Sun,            // lighting
  LayoutGrid,     // composition
  User,           // face
  Image,          // background
  Move3D,         // depth
  Ban,            // negative
  // ... other icons
} from 'lucide-react';

// Icon mapping for node types
const nodeTypeIcons: Record<NodeType, LucideIcon> = {
  style: Palette,
  object: Box,
  color: Droplet,
  texture: Grid3X3,
  pose: PersonStanding,
  lighting: Sun,
  composition: LayoutGrid,
  face: User,
  background: Image,
  depth: Move3D,
  negative: Ban
};
```

---

## Accessibility Utilities

### Focus Ring

```typescript
// Focus ring styles (Tailwind-based)
const focusRing = 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

// Focus visible only (keyboard)
const focusVisible = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
```

### Screen Reader Only

```typescript
const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0';

// Component
function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className={srOnly}>{children}</span>;
}
```

### Live Region

```typescript
interface LiveRegionProps {
  children: React.ReactNode;
  role?: 'status' | 'alert' | 'log';
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

function LiveRegion({ children, role = 'status', 'aria-live': ariaLive = 'polite' }: LiveRegionProps) {
  return (
    <div role={role} aria-live={ariaLive} className={srOnly}>
      {children}
    </div>
  );
}
```

---

## Utility Hooks

### useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### useThrottle

```typescript
function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}
```

### useClickOutside

```typescript
function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

### useLocalStorage

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
```

---

## File Structure

```
/src/components/shared/
  index.ts                    # Barrel export
  design-tokens.ts            # Design tokens

  # Base components
  Button/
    Button.tsx
    Button.test.tsx
    Button.stories.tsx
  IconButton/
  Input/
  Slider/
  Select/
  Toggle/
  Tooltip/
  Modal/
  Badge/

  # Composite components
  NodeCard/
  StrengthSlider/
  ImageUploadZone/
  ImageThumbnail/
  NodeTypeSelector/
  GenerationPreview/

  # Layout components
  SplitPane/
  Sidebar/
  Panel/
  Toolbar/
  CanvasContainer/

  # Feedback components
  Toast/
  ProgressBar/
  Spinner/
  EmptyState/

  # Icons
  icons/
    index.ts
    NodeTypeIcon.tsx

  # Utilities
  hooks/
    useDebounce.ts
    useThrottle.ts
    useClickOutside.ts
    useLocalStorage.ts

  # Accessibility
  a11y/
    ScreenReaderOnly.tsx
    LiveRegion.tsx
    FocusTrap.tsx
```

---

## Usage Example

```tsx
import {
  Button,
  Slider,
  NodeCard,
  ImageUploadZone,
  Panel,
  Toolbar,
  Toast,
  useToast
} from '@/components/shared';

function ExampleUsage() {
  const toast = useToast();

  return (
    <Panel title="References">
      <ImageUploadZone
        onUpload={(files) => {
          // Handle upload
          toast.success('Image uploaded!');
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      />

      <NodeCard
        image={image}
        nodeType={NodeType.STYLE}
        strength={75}
        isActive={true}
        onTypeChange={setType}
        onStrengthChange={setStrength}
        onToggleActive={toggleActive}
        onDelete={deleteNode}
      />

      <Toolbar>
        <Button variant="primary" onClick={generate}>
          Generate
        </Button>
      </Toolbar>
    </Panel>
  );
}
```
