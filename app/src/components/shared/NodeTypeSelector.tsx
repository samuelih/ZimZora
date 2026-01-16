import React, { useState, useRef, useEffect } from 'react';
import { NodeType } from '../../types';
import { nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import { ChevronDown, Check } from 'lucide-react';
import { NodeTypeBadge } from './NodeTypeBadge';

interface NodeTypeSelectorProps {
  value: NodeType;
  onChange: (type: NodeType) => void;
  showDescriptions?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export function NodeTypeSelector({
  value,
  onChange,
  showDescriptions = false,
  disabled = false,
  className,
  variant = 'light',
}: NodeTypeSelectorProps) {
  const isDark = variant === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { key: 'appearance', label: 'Appearance' },
    { key: 'structure', label: 'Structure' },
    { key: 'subject', label: 'Subject' },
    { key: 'special', label: 'Special' },
  ];

  const typesByCategory = categories.map(cat => ({
    ...cat,
    types: Object.values(nodeTypes).filter(t => t.category === cat.key),
  }));

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2',
          'rounded-lg text-left text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          isDark
            ? 'bg-white/5 border border-white/10 hover:border-white/20'
            : 'bg-white border border-gray-300 hover:border-gray-400 focus:border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
      >
        <NodeTypeBadge type={value} />
        <ChevronDown className={cn('w-4 h-4 transition-transform', isDark ? 'text-white/40' : 'text-gray-400', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className={cn(
          'absolute z-50 w-72 mt-1 rounded-lg shadow-lg overflow-hidden',
          isDark
            ? 'bg-slate-800 border border-white/10'
            : 'bg-white border border-gray-200'
        )}>
          <div className="max-h-80 overflow-y-auto">
            {typesByCategory.map(category => (
              <div key={category.key}>
                <div className={cn(
                  'px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                  isDark ? 'bg-slate-700 text-white/50' : 'bg-gray-50 text-gray-500'
                )}>
                  {category.label}
                </div>
                {category.types.map(type => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => {
                      onChange(type.type);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left',
                      isDark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-gray-50',
                      value === type.type && (isDark ? 'bg-primary-500/10' : 'bg-primary-50')
                    )}
                  >
                    <NodeTypeBadge type={type.type} showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>{type.label}</div>
                      {showDescriptions && (
                        <div className={cn('text-xs truncate', isDark ? 'text-white/50' : 'text-gray-500')}>{type.description}</div>
                      )}
                    </div>
                    {value === type.type && (
                      <Check className={cn('w-4 h-4', isDark ? 'text-primary-400' : 'text-primary-600')} />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
