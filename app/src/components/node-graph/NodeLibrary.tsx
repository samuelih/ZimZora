import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';
import {
  Image as ImageIcon,
  Palette,
  Droplet,
  Crop,
  Layers,
  Sun,
  Move,
  Grid3X3,
  User,
  Box,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Grip,
  Plus
} from 'lucide-react';

export interface NodeTemplate {
  type: string;
  category: 'input' | 'processor' | 'output';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTemplates: NodeTemplate[] = [
  // Input
  {
    type: 'image-input',
    category: 'input',
    label: 'Image Input',
    description: 'Source image for the pipeline',
    icon: <ImageIcon className="w-5 h-5" />,
    color: '#3b82f6', // blue
  },
  // Processors
  {
    type: 'style-transfer',
    category: 'processor',
    label: 'Style Transfer',
    description: 'Apply style from reference',
    icon: <Palette className="w-5 h-5" />,
    color: '#8b5cf6', // purple
  },
  {
    type: 'color-blend',
    category: 'processor',
    label: 'Color Blend',
    description: 'Blend color palette',
    icon: <Droplet className="w-5 h-5" />,
    color: '#f59e0b', // amber
  },
  {
    type: 'mask-region',
    category: 'processor',
    label: 'Mask Region',
    description: 'Apply to specific region',
    icon: <Crop className="w-5 h-5" />,
    color: '#64748b', // slate
  },
  {
    type: 'combine',
    category: 'processor',
    label: 'Combine',
    description: 'Combine multiple influences',
    icon: <Layers className="w-5 h-5" />,
    color: '#06b6d4', // cyan
  },
  {
    type: 'lighting-match',
    category: 'processor',
    label: 'Lighting Match',
    description: 'Match lighting from reference',
    icon: <Sun className="w-5 h-5" />,
    color: '#f97316', // orange
  },
  {
    type: 'pose-match',
    category: 'processor',
    label: 'Pose Match',
    description: 'Transfer pose from reference',
    icon: <Move className="w-5 h-5" />,
    color: '#ec4899', // pink
  },
  {
    type: 'texture-apply',
    category: 'processor',
    label: 'Texture Apply',
    description: 'Apply texture pattern',
    icon: <Grid3X3 className="w-5 h-5" />,
    color: '#10b981', // emerald
  },
  {
    type: 'face-swap',
    category: 'processor',
    label: 'Face Swap',
    description: 'Swap face from reference',
    icon: <User className="w-5 h-5" />,
    color: '#ef4444', // red
  },
  {
    type: 'depth-match',
    category: 'processor',
    label: 'Depth Match',
    description: 'Match depth structure',
    icon: <Box className="w-5 h-5" />,
    color: '#6366f1', // indigo
  },
  // Output
  {
    type: 'output',
    category: 'output',
    label: 'Final Output',
    description: 'Final generated image',
    icon: <Download className="w-5 h-5" />,
    color: '#22c55e', // green
  },
];

const categories = [
  { id: 'input', label: 'Inputs', color: '#3b82f6', bgColor: 'bg-blue-500/10' },
  { id: 'processor', label: 'Processors', color: '#8b5cf6', bgColor: 'bg-purple-500/10' },
  { id: 'output', label: 'Output', color: '#22c55e', bgColor: 'bg-emerald-500/10' },
];

interface NodeLibraryProps {
  onAddNode: (template: NodeTemplate) => void;
}

export function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    input: true,
    processor: true,
    output: true,
  });
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['style-transfer', 'color-blend']);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const filteredTemplates = nodeTemplates.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAddNode = (template: NodeTemplate) => {
    onAddNode(template);
    // Add to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(t => t !== template.type);
      return [template.type, ...filtered].slice(0, 5);
    });
  };

  const toggleFavorite = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const recentTemplates = recentlyUsed
    .map(type => nodeTemplates.find(t => t.type === type))
    .filter(Boolean) as NodeTemplate[];

  const favoriteTemplates = favorites
    .map(type => nodeTemplates.find(t => t.type === type))
    .filter(Boolean) as NodeTemplate[];

  const NodeCard = ({ template, compact = false }: { template: NodeTemplate; compact?: boolean }) => (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => handleAddNode(template)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAddNode(template);
        }
      }}
      onMouseEnter={() => setHoveredNode(template.type)}
      onMouseLeave={() => setHoveredNode(null)}
      className={cn(
        'relative group rounded-lg transition-all text-left overflow-hidden cursor-pointer',
        viewMode === 'grid' && !compact
          ? 'p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600'
          : 'w-full flex items-start gap-2 px-2 py-2 hover:bg-slate-800 rounded'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Color accent bar */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-all',
          hoveredNode === template.type ? 'w-1.5' : ''
        )}
        style={{ backgroundColor: template.color }}
      />

      {viewMode === 'grid' && !compact ? (
        // Grid layout
        <div className="pl-2">
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${template.color}20` }}
            >
              <span style={{ color: template.color }}>{template.icon}</span>
            </div>
            <button
              onClick={(e) => toggleFavorite(template.type, e)}
              className={cn(
                'p-1 rounded transition-colors',
                favorites.includes(template.type)
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
              )}
            >
              <Star className="w-3.5 h-3.5" fill={favorites.includes(template.type) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-sm font-medium text-white mb-0.5">{template.label}</p>
          <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
        </div>
      ) : (
        // List layout
        <>
          <span
            className="mt-0.5 ml-2 flex-shrink-0"
            style={{ color: template.color }}
          >
            {template.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{template.label}</p>
            <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">
              {template.description}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Node Library</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
              title="List view"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
              title="Grid view"
            >
              <Grip className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto dark-scrollbar">
        {/* Favorites Section */}
        {!searchQuery && favoriteTemplates.length > 0 && (
          <div className="p-2 border-b border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-yellow-400/80">
              <Star className="w-3 h-3" fill="currentColor" />
              <span>Favorites</span>
            </div>
            <div className={cn(
              'mt-1',
              viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'
            )}>
              {favoriteTemplates.map(template => (
                <NodeCard key={template.type} template={template} compact={viewMode === 'list'} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Used Section */}
        {!searchQuery && recentTemplates.length > 0 && (
          <div className="p-2 border-b border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Recent</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {recentTemplates.map(template => (
                <button
                  key={template.type}
                  onClick={() => handleAddNode(template)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <span className="w-3.5 h-3.5" style={{ color: template.color }}>
                    {React.cloneElement(template.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                  </span>
                  <span className="text-xs text-slate-300">{template.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="p-2">
          {categories.map((category) => {
            const categoryTemplates = filteredTemplates.filter(
              (t) => t.category === category.id
            );

            if (categoryTemplates.length === 0) return null;

            return (
              <div key={category.id} className="mb-3">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-800/50 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: expandedCategories[category.id] ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </motion.div>
                  <span style={{ color: category.color }}>{category.label}</span>
                  <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {categoryTemplates.length}
                  </span>
                </button>

                <AnimatePresence>
                  {expandedCategories[category.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn(
                        'mt-2 ml-2',
                        viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'
                      )}>
                        {categoryTemplates.map((template) => (
                          <NodeCard key={template.type} template={template} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Plus className="w-3.5 h-3.5" />
          <span>Click to add nodes to canvas</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">A</kbd>
          <span>Quick add menu</span>
        </div>
      </div>
    </div>
  );
}

export { nodeTemplates };
