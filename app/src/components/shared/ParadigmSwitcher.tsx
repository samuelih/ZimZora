import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParadigmType } from '../../types';
import { cn } from '../../utils/helpers';
import {
  LayoutGrid,
  Circle,
  GitBranch,
  ChefHat,
  Layers,
  Keyboard
} from 'lucide-react';

interface ParadigmSwitcherProps {
  value: ParadigmType;
  onChange: (paradigm: ParadigmType) => void;
  className?: string;
}

interface ParadigmOption {
  value: ParadigmType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  shortcut: string;
  previewDescription: string;
}

const paradigms: ParadigmOption[] = [
  {
    value: 'canvas',
    label: 'Canvas + Sidebar',
    shortLabel: 'Canvas',
    icon: LayoutGrid,
    description: 'Drag references onto an infinite canvas',
    shortcut: '1',
    previewDescription: 'Drag & drop workspace with sidebar library',
  },
  {
    value: 'orbital',
    label: 'Radial Orbital',
    shortLabel: 'Orbital',
    icon: Circle,
    description: 'Distance from center = influence strength',
    shortcut: '2',
    previewDescription: 'Circular layout where distance controls influence',
  },
  {
    value: 'node-graph',
    label: 'Node Graph',
    shortLabel: 'Nodes',
    icon: GitBranch,
    description: 'Wire up a visual pipeline',
    shortcut: '3',
    previewDescription: 'Connect nodes to build processing pipelines',
  },
  {
    value: 'recipe',
    label: 'Recipe Builder',
    shortLabel: 'Recipe',
    icon: ChefHat,
    description: 'Build a recipe with ingredients',
    shortcut: '4',
    previewDescription: 'Combine ingredients with culinary controls',
  },
  {
    value: 'layers',
    label: 'Layers Panel',
    shortLabel: 'Layers',
    icon: Layers,
    description: 'Stack layers like Photoshop',
    shortcut: '5',
    previewDescription: 'Stack and blend layers with opacity control',
  },
];

// Mini preview SVG illustrations for each paradigm
function ParadigmPreview({ paradigm, isDark }: { paradigm: ParadigmType; isDark: boolean }) {
  const bgColor = isDark ? '#334155' : '#f3f4f6';
  const fgColor = isDark ? '#94a3b8' : '#6b7280';
  const accentColor = isDark ? '#818cf8' : '#6366f1';

  switch (paradigm) {
    case 'canvas':
      return (
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <rect x="2" y="2" width="25" height="66" rx="3" fill={bgColor} />
          <rect x="6" y="8" width="17" height="12" rx="2" fill={fgColor} />
          <rect x="6" y="24" width="17" height="12" rx="2" fill={fgColor} />
          <rect x="32" y="2" width="86" height="66" rx="3" fill={bgColor} />
          <rect x="45" y="20" width="30" height="30" rx="3" fill={accentColor} stroke={fgColor} strokeWidth="2" />
          <rect x="85" y="35" width="20" height="20" rx="3" fill={fgColor} />
          <circle cx="100" cy="15" r="8" fill={fgColor} opacity="0.5" />
        </svg>
      );
    case 'orbital':
      return (
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <circle cx="60" cy="35" r="30" stroke={fgColor} strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx="60" cy="35" r="20" stroke={fgColor} strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx="60" cy="35" r="10" stroke={fgColor} strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <rect x="52" y="27" width="16" height="16" rx="3" fill={accentColor} />
          <circle cx="85" cy="25" r="6" fill={fgColor} />
          <circle cx="40" cy="45" r="5" fill={fgColor} />
          <circle cx="70" cy="55" r="4" fill={fgColor} opacity="0.6" />
        </svg>
      );
    case 'node-graph':
      return (
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <rect x="10" y="25" width="25" height="20" rx="4" fill={accentColor} />
          <rect x="48" y="10" width="25" height="20" rx="4" fill={fgColor} />
          <rect x="48" y="40" width="25" height="20" rx="4" fill={fgColor} />
          <rect x="86" y="25" width="25" height="20" rx="4" fill={fgColor} />
          <line x1="35" y1="35" x2="48" y2="20" stroke={fgColor} strokeWidth="2" />
          <line x1="35" y1="35" x2="48" y2="50" stroke={fgColor} strokeWidth="2" />
          <line x1="73" y1="20" x2="86" y2="35" stroke={fgColor} strokeWidth="2" />
          <line x1="73" y1="50" x2="86" y2="35" stroke={fgColor} strokeWidth="2" />
        </svg>
      );
    case 'recipe':
      return (
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <rect x="15" y="5" width="90" height="60" rx="6" fill={bgColor} />
          <rect x="25" y="12" width="35" height="35" rx="4" fill={accentColor} />
          <rect x="68" y="12" width="28" height="8" rx="2" fill={fgColor} />
          <rect x="68" y="24" width="22" height="6" rx="2" fill={fgColor} opacity="0.7" />
          <rect x="68" y="34" width="28" height="8" rx="2" fill={fgColor} />
          <rect x="68" y="46" width="18" height="6" rx="2" fill={fgColor} opacity="0.7" />
          <circle cx="30" cy="55" r="4" fill={fgColor} />
          <text x="36" y="58" fill={fgColor} fontSize="8" fontFamily="sans-serif">+3</text>
        </svg>
      );
    case 'layers':
      return (
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <rect x="10" y="5" width="70" height="60" rx="3" fill={bgColor}>
            <pattern id="checker" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill={fgColor} opacity="0.2" />
              <rect x="5" y="5" width="5" height="5" fill={fgColor} opacity="0.2" />
            </pattern>
          </rect>
          <rect x="15" y="10" width="60" height="50" fill="url(#checker)" />
          <rect x="25" y="20" width="40" height="30" rx="2" fill={accentColor} opacity="0.8" />
          <rect x="85" y="5" width="28" height="60" rx="3" fill={bgColor} />
          <rect x="88" y="10" width="22" height="12" rx="2" fill={fgColor} />
          <rect x="88" y="26" width="22" height="12" rx="2" fill={accentColor} />
          <rect x="88" y="42" width="22" height="12" rx="2" fill={fgColor} opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}

export function ParadigmSwitcher({ value, onChange, className }: ParadigmSwitcherProps) {
  const [hoveredParadigm, setHoveredParadigm] = useState<ParadigmType | null>(null);
  const isDark = className?.includes('bg-slate');

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') return;

      const keyToParadigm: Record<string, ParadigmType> = {
        '1': 'canvas',
        '2': 'orbital',
        '3': 'node-graph',
        '4': 'recipe',
        '5': 'layers',
      };

      if (keyToParadigm[e.key]) {
        e.preventDefault();
        onChange(keyToParadigm[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <nav
      className={cn('flex gap-1 p-1 rounded-lg relative', isDark ? 'bg-slate-800' : 'bg-gray-100', className)}
      role="tablist"
      aria-label="Workspace paradigm selector"
    >
      {paradigms.map((paradigm, index) => {
        const Icon = paradigm.icon;
        const isActive = value === paradigm.value;
        const isHovered = hoveredParadigm === paradigm.value;

        return (
          <div key={paradigm.value} className="relative">
            <motion.button
              onClick={() => onChange(paradigm.value)}
              onMouseEnter={() => setHoveredParadigm(paradigm.value)}
              onMouseLeave={() => setHoveredParadigm(null)}
              onFocus={() => setHoveredParadigm(paradigm.value)}
              onBlur={() => setHoveredParadigm(null)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                isActive
                  ? isDark
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="tab"
              id={`paradigm-tab-${paradigm.value}`}
              aria-selected={isActive}
              aria-controls={`paradigm-panel-${paradigm.value}`}
              aria-label={`${paradigm.label}. ${paradigm.description}. Press ${paradigm.shortcut} to switch.`}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{paradigm.shortLabel}</span>
              <span className={cn(
                'hidden lg:inline-flex items-center justify-center w-4 h-4 text-[10px] rounded',
                isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-500'
              )}>
                {paradigm.shortcut}
              </span>
            </motion.button>

            {/* Tooltip with preview */}
            <AnimatePresence>
              {isHovered && !isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50',
                    'p-3 rounded-lg shadow-xl border',
                    isDark
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-white border-gray-200'
                  )}
                  style={{ minWidth: '160px' }}
                >
                  {/* Preview illustration */}
                  <div className={cn(
                    'rounded-md overflow-hidden mb-2',
                    isDark ? 'bg-slate-900' : 'bg-gray-50'
                  )}>
                    <ParadigmPreview paradigm={paradigm.value} isDark={isDark || false} />
                  </div>

                  {/* Title */}
                  <div className={cn(
                    'font-medium text-sm',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {paradigm.label}
                  </div>

                  {/* Description */}
                  <div className={cn(
                    'text-xs mt-0.5',
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  )}>
                    {paradigm.previewDescription}
                  </div>

                  {/* Keyboard shortcut hint */}
                  <div className={cn(
                    'flex items-center gap-1 mt-2 text-xs',
                    isDark ? 'text-slate-500' : 'text-gray-400'
                  )}>
                    <Keyboard className="w-3 h-3" />
                    <span>Press {paradigm.shortcut}</span>
                  </div>

                  {/* Arrow pointer */}
                  <div className={cn(
                    'absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45',
                    isDark ? 'bg-slate-800 border-l border-t border-slate-600' : 'bg-white border-l border-t border-gray-200'
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

export function ParadigmInfo({ paradigm }: { paradigm: ParadigmType }) {
  const info = paradigms.find(p => p.value === paradigm);
  if (!info) return null;

  const Icon = info.icon;

  return (
    <div className="flex items-center gap-3 text-gray-600">
      <Icon className="w-5 h-5" />
      <div>
        <div className="font-medium text-gray-900">{info.label}</div>
        <div className="text-sm">{info.description}</div>
      </div>
    </div>
  );
}
