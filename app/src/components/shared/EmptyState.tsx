import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import {
  Upload,
  Image,
  Sparkles,
  ChefHat,
  LayoutGrid,
  Circle,
  GitBranch,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';

type EmptyStateType = 'main-image' | 'references' | 'canvas' | 'orbital' | 'node-graph' | 'recipe' | 'layers';

interface EmptyStateProps {
  type: EmptyStateType;
  isDark?: boolean;
  onAction?: () => void;
  className?: string;
}

interface StepGuide {
  number: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

const emptyStateConfig: Record<EmptyStateType, {
  illustration: React.FC<{ isDark: boolean }>;
  title: string;
  description: string;
  steps?: StepGuide[];
  actionLabel?: string;
}> = {
  'main-image': {
    illustration: MainImageIllustration,
    title: 'Add Your Base Image',
    description: 'Upload or drag an image to start creating',
    actionLabel: 'Upload Image',
    steps: [
      { number: 1, label: 'Upload', description: 'Add your base image', icon: Upload },
      { number: 2, label: 'Add References', description: 'Style, colors, poses', icon: Plus },
      { number: 3, label: 'Generate', description: 'Create your masterpiece', icon: Sparkles },
    ],
  },
  'references': {
    illustration: ReferencesIllustration,
    title: 'No References Yet',
    description: 'Add reference images to influence your generation',
    actionLabel: 'Add Reference',
  },
  'canvas': {
    illustration: CanvasIllustration,
    title: 'Your Canvas is Empty',
    description: 'Drag images from the sidebar to position them on the canvas',
    steps: [
      { number: 1, label: 'Upload', description: 'Add images to sidebar', icon: Upload },
      { number: 2, label: 'Drag', description: 'Position on canvas', icon: LayoutGrid },
      { number: 3, label: 'Adjust', description: 'Fine-tune settings', icon: Sparkles },
    ],
  },
  'orbital': {
    illustration: OrbitalIllustration,
    title: 'Start Your Orbital Composition',
    description: 'Add a center image and arrange references around it',
    steps: [
      { number: 1, label: 'Center', description: 'Add your main image', icon: Image },
      { number: 2, label: 'Orbit', description: 'Position references', icon: Circle },
      { number: 3, label: 'Generate', description: 'Create your image', icon: Sparkles },
    ],
  },
  'node-graph': {
    illustration: NodeGraphIllustration,
    title: 'Build Your Pipeline',
    description: 'Drag nodes from the library to create your processing pipeline',
    steps: [
      { number: 1, label: 'Add Input', description: 'Add image source', icon: Image },
      { number: 2, label: 'Connect', description: 'Wire up processors', icon: GitBranch },
      { number: 3, label: 'Output', description: 'Generate result', icon: Sparkles },
    ],
  },
  'recipe': {
    illustration: RecipeIllustration,
    title: 'Start Your Recipe',
    description: 'Add a base image and mix in ingredients to create your masterpiece',
    steps: [
      { number: 1, label: 'Base', description: 'Add your main image', icon: Image },
      { number: 2, label: 'Ingredients', description: 'Mix in references', icon: ChefHat },
      { number: 3, label: 'Cook', description: 'Generate result', icon: Sparkles },
    ],
  },
  'layers': {
    illustration: LayersIllustration,
    title: 'No Layers Added',
    description: 'Start by adding a background layer and stack references on top',
    steps: [
      { number: 1, label: 'Background', description: 'Add base layer', icon: Image },
      { number: 2, label: 'Stack', description: 'Add reference layers', icon: Layers },
      { number: 3, label: 'Blend', description: 'Adjust and generate', icon: Sparkles },
    ],
  },
};

// Illustrations
function MainImageIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" className="mx-auto">
      <rect x="30" y="15" width="120" height="90" rx="8" fill={bgColor} />
      <rect x="30" y="15" width="120" height="90" rx="8" stroke={fgColor} strokeWidth="2" strokeDasharray="6 4" />
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="55" y="45" width="70" height="50" rx="4" fill={accentColor} opacity="0.2" />
        <path d="M75 75 L90 60 L105 80 L115 65 L125 85" stroke={accentColor} strokeWidth="2" fill="none" />
        <circle cx="115" cy="55" r="8" fill={accentColor} opacity="0.6" />
      </motion.g>
      <motion.g
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
      >
        <circle cx="90" cy="40" r="12" fill={accentColor} />
        <path d="M90 34 L90 46 M84 40 L96 40" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function ReferencesIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      <rect x="10" y="25" width="50" height="50" rx="6" fill={bgColor} stroke={fgColor} strokeDasharray="4 2" />
      <rect x="65" y="25" width="50" height="50" rx="6" fill={bgColor} stroke={fgColor} strokeDasharray="4 2" />
      <rect x="120" y="25" width="50" height="50" rx="6" fill={bgColor} stroke={fgColor} strokeDasharray="4 2" />
      <motion.circle
        cx="35"
        cy="50"
        r="8"
        fill={accentColor}
        opacity="0.3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="90"
        cy="50"
        r="8"
        fill={accentColor}
        opacity="0.3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="145"
        cy="50"
        r="8"
        fill={accentColor}
        opacity="0.3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
    </svg>
  );
}

function CanvasIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      {/* Sidebar */}
      <rect x="10" y="10" width="35" height="80" rx="4" fill={bgColor} />
      <rect x="15" y="18" width="25" height="18" rx="2" fill={fgColor} />
      <rect x="15" y="42" width="25" height="18" rx="2" fill={fgColor} />

      {/* Canvas */}
      <rect x="50" y="10" width="120" height="80" rx="4" fill={bgColor} />

      {/* Dotted grid */}
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          {[0, 1, 2, 3].map((j) => (
            <circle key={j} cx={70 + i * 25} cy={25 + j * 20} r="1" fill={fgColor} opacity="0.5" />
          ))}
        </React.Fragment>
      ))}

      {/* Dragging animation */}
      <motion.g
        animate={{ x: [0, 50, 50], y: [0, 10, 10], opacity: [1, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
      >
        <rect x="15" y="66" width="25" height="18" rx="2" fill={accentColor} />
      </motion.g>

      {/* Arrow */}
      <motion.path
        d="M45 75 L60 50"
        stroke={accentColor}
        strokeWidth="2"
        strokeDasharray="4 2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function OrbitalIllustration({ isDark }: { isDark: boolean }) {
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      {/* Orbital rings */}
      <circle cx="90" cy="50" r="40" stroke={fgColor} strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
      <circle cx="90" cy="50" r="28" stroke={fgColor} strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.7" />
      <circle cx="90" cy="50" r="16" stroke={fgColor} strokeWidth="1" strokeDasharray="4 4" fill="none" />

      {/* Center */}
      <motion.rect
        x="80" y="40"
        width="20" height="20"
        rx="4"
        fill={accentColor}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Orbiting nodes */}
      <motion.circle
        cx="130" cy="50"
        r="6"
        fill={fgColor}
        animate={{ rotate: 360 }}
        style={{ originX: '90px', originY: '50px' }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.circle
        cx="62" cy="50"
        r="5"
        fill={fgColor}
        animate={{ rotate: -360 }}
        style={{ originX: '90px', originY: '50px' }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}

function NodeGraphIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      {/* Input node */}
      <rect x="15" y="35" width="35" height="30" rx="4" fill={accentColor} />
      <circle cx="50" cy="50" r="4" fill="white" />

      {/* Processor nodes */}
      <rect x="72" y="15" width="35" height="25" rx="4" fill={bgColor} stroke={fgColor} />
      <circle cx="72" cy="27.5" r="3" fill={fgColor} />
      <circle cx="107" cy="27.5" r="3" fill={fgColor} />

      <rect x="72" y="60" width="35" height="25" rx="4" fill={bgColor} stroke={fgColor} />
      <circle cx="72" cy="72.5" r="3" fill={fgColor} />
      <circle cx="107" cy="72.5" r="3" fill={fgColor} />

      {/* Output node */}
      <rect x="130" y="35" width="35" height="30" rx="4" fill={bgColor} stroke={fgColor} />
      <circle cx="130" cy="50" r="3" fill={fgColor} />

      {/* Connections */}
      <motion.path
        d="M50 50 Q60 50 60 27.5 L72 27.5"
        stroke={accentColor}
        strokeWidth="2"
        fill="none"
        strokeDasharray="100"
        strokeDashoffset="0"
        animate={{ strokeDashoffset: [100, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M50 50 Q60 50 60 72.5 L72 72.5"
        stroke={accentColor}
        strokeWidth="2"
        fill="none"
        strokeDasharray="100"
        strokeDashoffset="0"
        animate={{ strokeDashoffset: [100, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.path
        d="M107 27.5 Q117 27.5 117 50 L130 50"
        stroke={fgColor}
        strokeWidth="2"
        fill="none"
        strokeDasharray="100"
        strokeDashoffset="0"
        animate={{ strokeDashoffset: [100, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
      <motion.path
        d="M107 72.5 Q117 72.5 117 50 L130 50"
        stroke={fgColor}
        strokeWidth="2"
        fill="none"
        strokeDasharray="100"
        strokeDashoffset="0"
        animate={{ strokeDashoffset: [100, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      />
    </svg>
  );
}

function RecipeIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#f59e0b' : '#d97706'; // Amber for recipe

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      {/* Bowl */}
      <ellipse cx="90" cy="75" rx="55" ry="15" fill={bgColor} />
      <path d="M35 75 Q35 55 90 55 Q145 55 145 75" fill={bgColor} stroke={fgColor} strokeWidth="2" />

      {/* Ingredients falling in */}
      <motion.g
        animate={{ y: [0, 30], opacity: [1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      >
        <rect x="60" y="15" width="15" height="15" rx="3" fill={accentColor} />
      </motion.g>
      <motion.g
        animate={{ y: [0, 30], opacity: [1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      >
        <circle cx="90" cy="20" r="8" fill="#8b5cf6" />
      </motion.g>
      <motion.g
        animate={{ y: [0, 30], opacity: [1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
      >
        <rect x="105" y="18" width="12" height="12" rx="2" fill="#3b82f6" />
      </motion.g>

      {/* Sparkles */}
      <motion.g
        animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <path d="M150 40 L153 35 L156 40 L153 45 Z" fill={accentColor} />
      </motion.g>
      <motion.g
        animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <path d="M25 50 L28 45 L31 50 L28 55 Z" fill={accentColor} />
      </motion.g>
    </svg>
  );
}

function LayersIllustration({ isDark }: { isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#e5e7eb';
  const fgColor = isDark ? '#64748b' : '#9ca3af';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="mx-auto">
      {/* Stacked layers */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      >
        <rect x="40" y="60" width="100" height="30" rx="4" fill={bgColor} stroke={fgColor} strokeWidth="2" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.15 }}
      >
        <rect x="45" y="45" width="90" height="30" rx="4" fill={fgColor} opacity="0.7" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <rect x="50" y="30" width="80" height="30" rx="4" fill={accentColor} opacity="0.5" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.45 }}
      >
        <rect x="55" y="15" width="70" height="30" rx="4" fill={accentColor} />
      </motion.g>

      {/* Plus icon */}
      <motion.g
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <circle cx="155" cy="50" r="12" fill={accentColor} opacity="0.2" />
        <path d="M155 44 L155 56 M149 50 L161 50" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

export function EmptyState({ type, isDark = false, onAction, className }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Illustration = config.illustration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {/* Illustration */}
      <div className="mb-6">
        <Illustration isDark={isDark} />
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-lg font-semibold mb-2',
        isDark ? 'text-white' : 'text-gray-900'
      )}>
        {config.title}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-sm mb-6 max-w-xs',
        isDark ? 'text-slate-400' : 'text-gray-500'
      )}>
        {config.description}
      </p>

      {/* Steps guide */}
      {config.steps && (
        <div className="flex items-center gap-2 mb-6">
          {config.steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-1',
                  isDark ? 'bg-slate-700' : 'bg-gray-100'
                )}>
                  <step.icon className={cn(
                    'w-5 h-5',
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  )} />
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  isDark ? 'text-slate-300' : 'text-gray-700'
                )}>
                  {step.label}
                </span>
                <span className={cn(
                  'text-[10px]',
                  isDark ? 'text-slate-500' : 'text-gray-400'
                )}>
                  {step.description}
                </span>
              </motion.div>

              {index < config.steps!.length - 1 && (
                <ArrowRight className={cn(
                  'w-4 h-4 mt-[-20px]',
                  isDark ? 'text-slate-600' : 'text-gray-300'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Action button */}
      {config.actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            isDark
              ? 'bg-primary-600 hover:bg-primary-500 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {config.actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
