import React from 'react';
import { NodeType } from '../../types';
import { nodeTypes } from '../../store';
import { cn } from '../../utils/helpers';
import {
  Palette,
  Box,
  Droplet,
  Grid3X3,
  User,
  Sun,
  LayoutGrid,
  Image,
  Move3D,
  Ban,
  Sparkles
} from 'lucide-react';

interface NodeTypeBadgeProps {
  type: NodeType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const iconMap: Record<NodeType, React.ElementType> = {
  [NodeType.STYLE]: Palette,
  [NodeType.OBJECT]: Box,
  [NodeType.COLOR]: Droplet,
  [NodeType.TEXTURE]: Grid3X3,
  [NodeType.POSE]: Sparkles,
  [NodeType.LIGHTING]: Sun,
  [NodeType.COMPOSITION]: LayoutGrid,
  [NodeType.FACE]: User,
  [NodeType.BACKGROUND]: Image,
  [NodeType.DEPTH]: Move3D,
  [NodeType.NEGATIVE]: Ban,
};

export function NodeTypeBadge({
  type,
  showLabel = true,
  size = 'md',
  className
}: NodeTypeBadgeProps) {
  const meta = nodeTypes[type];
  const Icon = iconMap[type];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{
        backgroundColor: `${meta.color}20`,
        color: meta.color,
      }}
    >
      <Icon size={iconSize} />
      {showLabel && <span>{meta.shortLabel}</span>}
    </span>
  );
}
