import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasTransform, MainImage, ReferenceConfig, Position, LibraryImage } from '../../types';
import { nodeTypes } from '../../store';
import { cn, clamp } from '../../utils/helpers';
import { NodeTypeBadge } from '../shared';
import {
  X, ZoomIn, ZoomOut, Maximize2, Grid3X3, Map, Crosshair,
  Move, Magnet, Eye, EyeOff, Ruler as RulerIcon, RotateCcw
} from 'lucide-react';

interface CanvasWorkspaceProps {
  transform: CanvasTransform;
  onTransformChange: (transform: CanvasTransform) => void;
  mainImage: MainImage | null;
  references: ReferenceConfig[];
  nodePositions: Record<string, Position>;
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeMove: (id: string, position: Position) => void;
  onNodeDrop: (image: LibraryImage, position: Position) => void;
  onNodeDelete: (id: string) => void;
  className?: string;
}

// Grid and canvas settings
const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

// Minimap component
function Minimap({
  transform,
  mainImage,
  references,
  nodePositions,
  containerSize,
  onNavigate,
}: {
  transform: CanvasTransform;
  mainImage: MainImage | null;
  references: ReferenceConfig[];
  nodePositions: Record<string, Position>;
  containerSize: { width: number; height: number };
  onNavigate: (position: Position) => void;
}) {
  const minimapWidth = 150;
  const minimapHeight = 100;
  const worldBounds = { x: -500, y: -500, width: 1000, height: 1000 };
  const scaleX = minimapWidth / worldBounds.width;
  const scaleY = minimapHeight / worldBounds.height;

  const viewportX = (-transform.x / transform.scale - worldBounds.x) * scaleX;
  const viewportY = (-transform.y / transform.scale - worldBounds.y) * scaleY;
  const viewportW = (containerSize.width / transform.scale) * scaleX;
  const viewportH = (containerSize.height / transform.scale) * scaleY;

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldX = (x / scaleX) + worldBounds.x;
    const worldY = (y / scaleY) + worldBounds.y;
    onNavigate({ x: -worldX * transform.scale, y: -worldY * transform.scale });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5">
        <Map className="w-3 h-3 text-gray-500" />
        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Minimap</span>
      </div>
      <div
        className="relative cursor-crosshair"
        style={{ width: minimapWidth, height: minimapHeight, background: '#f8f9fa' }}
        onClick={handleClick}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />

        {/* Main image indicator */}
        {mainImage && (
          <div
            className="absolute bg-primary-500 rounded-sm"
            style={{
              left: (0 - worldBounds.x) * scaleX - 5,
              top: (0 - worldBounds.y) * scaleY - 5,
              width: 10,
              height: 10,
            }}
          />
        )}

        {/* Reference nodes */}
        {references.map((node, index) => {
          const pos = nodePositions[node.id] || { x: Math.cos((index * 2 * Math.PI) / references.length) * 200, y: Math.sin((index * 2 * Math.PI) / references.length) * 200 };
          const typeMeta = nodeTypes[node.type];
          return (
            <div
              key={node.id}
              className="absolute rounded-full"
              style={{
                left: (pos.x - worldBounds.x) * scaleX - 3,
                top: (pos.y - worldBounds.y) * scaleY - 3,
                width: 6,
                height: 6,
                backgroundColor: typeMeta.color,
                opacity: node.isActive ? 1 : 0.4,
              }}
            />
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-primary-400 bg-primary-100/30 rounded"
          style={{
            left: Math.max(0, viewportX),
            top: Math.max(0, viewportY),
            width: Math.min(viewportW, minimapWidth - viewportX),
            height: Math.min(viewportH, minimapHeight - viewportY),
          }}
        />
      </div>
    </motion.div>
  );
}

// Ruler component
function Ruler({
  orientation,
  transform,
  size,
}: {
  orientation: 'horizontal' | 'vertical';
  transform: CanvasTransform;
  size: number;
}) {
  const tickSpacing = 50;
  const ticks = [];
  const start = Math.floor(-transform[orientation === 'horizontal' ? 'x' : 'y'] / transform.scale / tickSpacing) * tickSpacing;
  const count = Math.ceil(size / transform.scale / tickSpacing) + 2;

  for (let i = 0; i < count; i++) {
    const value = start + i * tickSpacing;
    const pos = value * transform.scale + transform[orientation === 'horizontal' ? 'x' : 'y'];
    if (pos >= 0 && pos <= size) {
      ticks.push({ pos, value });
    }
  }

  return (
    <div
      className={cn(
        'absolute bg-gray-100/90 backdrop-blur-sm',
        orientation === 'horizontal'
          ? 'left-6 right-0 top-0 h-6 border-b border-gray-300'
          : 'top-6 bottom-0 left-0 w-6 border-r border-gray-300'
      )}
    >
      {ticks.map(({ pos, value }) => (
        <div
          key={value}
          className={cn(
            'absolute text-[9px] text-gray-500',
            orientation === 'horizontal' ? 'border-l border-gray-300' : 'border-t border-gray-300'
          )}
          style={orientation === 'horizontal'
            ? { left: pos, height: '100%', paddingLeft: 2, paddingTop: 2 }
            : { top: pos, width: '100%', paddingLeft: 2, paddingTop: 2 }
          }
        >
          {value}
        </div>
      ))}

      {/* Origin corner */}
      {orientation === 'horizontal' && (
        <div className="absolute left-0 w-6 h-6 -ml-6 bg-gray-200/90 border-b border-r border-gray-300 flex items-center justify-center">
          <Crosshair className="w-3 h-3 text-gray-500" />
        </div>
      )}
    </div>
  );
}

export function CanvasWorkspace({
  transform,
  onTransformChange,
  mainImage,
  references,
  nodePositions,
  selectedNodeId,
  onNodeSelect,
  onNodeMove,
  onNodeDrop,
  onNodeDelete,
  className,
}: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Enhanced canvas state
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Snap position to grid
  const snapPosition = useCallback((pos: Position): Position => {
    if (!snapToGrid) return pos;
    return {
      x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
    };
  }, [snapToGrid]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = clamp(transform.scale * zoomFactor, 0.2, 3);

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    onTransformChange({
      scale: newScale,
      x: mouseX - (mouseX - transform.x) * (newScale / transform.scale),
      y: mouseY - (mouseY - transform.y) * (newScale / transform.scale),
    });
  }, [transform, onTransformChange]);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    } else if (e.button === 0 && e.target === containerRef.current) {
      onNodeSelect(null);
    }
  }, [transform, onNodeSelect]);

  // Handle pan move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      onTransformChange({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNode) {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale - dragOffset.x;
      const y = (e.clientY - rect.top - transform.y) / transform.scale - dragOffset.y;
      const snappedPos = snapPosition({ x, y });
      onNodeMove(draggingNode, snappedPos);
    }
  }, [isPanning, panStart, transform, onTransformChange, draggingNode, dragOffset, onNodeMove, snapPosition]);

  // Handle minimap navigation
  const handleMinimapNavigate = useCallback((position: Position) => {
    onTransformChange({
      ...transform,
      x: position.x + containerSize.width / 2,
      y: position.y + containerSize.height / 2,
    });
  }, [transform, onTransformChange, containerSize]);

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const image = JSON.parse(data) as LibraryImage;

      const rect = containerRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      const snappedPos = snapPosition({ x, y });

      onNodeDrop(image, snappedPos);
    } catch (error) {
      console.error('Failed to parse dropped data:', error);
    }
  }, [transform, onNodeDrop, snapPosition]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  // Get node position
  const getNodePosition = (node: ReferenceConfig, index: number): Position => {
    if (nodePositions[node.id]) {
      return nodePositions[node.id];
    }
    // Default position in a circle around center
    const angle = (index * 2 * Math.PI) / references.length;
    const radius = 200;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Zoom controls
  const handleZoomIn = () => {
    onTransformChange({ ...transform, scale: Math.min(transform.scale * 1.25, 3) });
  };

  const handleZoomOut = () => {
    onTransformChange({ ...transform, scale: Math.max(transform.scale / 1.25, 0.2) });
  };

  const handleFitToView = () => {
    onTransformChange({ x: 0, y: 0, scale: 1 });
  };

  // Calculate center guides positions
  const centerX = containerSize.width / 2;
  const centerY = containerSize.height / 2;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden cursor-default',
        isPanning && 'cursor-grabbing',
        isDraggingOver && 'ring-2 ring-inset ring-primary-400 bg-primary-50/50',
        showRulers && 'pl-6 pt-6',
        className
      )}
      style={{
        // Background with improved grid
        backgroundColor: '#f8fafc',
        backgroundImage: showGrid
          ? `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px),
            radial-gradient(circle, #cbd5e1 1px, transparent 1px)
          `
          : 'none',
        backgroundSize: showGrid
          ? `
            ${GRID_SIZE * transform.scale * 5}px ${GRID_SIZE * transform.scale * 5}px,
            ${GRID_SIZE * transform.scale * 5}px ${GRID_SIZE * transform.scale * 5}px,
            ${GRID_SIZE * transform.scale}px ${GRID_SIZE * transform.scale}px
          `
          : 'auto',
        backgroundPosition: `${transform.x}px ${transform.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Rulers */}
      <AnimatePresence>
        {showRulers && (
          <>
            <Ruler orientation="horizontal" transform={transform} size={containerSize.width} />
            <Ruler orientation="vertical" transform={transform} size={containerSize.height} />
          </>
        )}
      </AnimatePresence>

      {/* Center guides */}
      <AnimatePresence>
        {showGuides && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 bottom-0 w-px bg-primary-300/50 pointer-events-none"
              style={{ left: centerX + transform.x }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 h-px bg-primary-300/50 pointer-events-none"
              style={{ top: centerY + transform.y }}
            />
            {/* Center crosshair */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute w-3 h-3 pointer-events-none"
              style={{
                left: centerX + transform.x - 6,
                top: centerY + transform.y - 6,
              }}
            >
              <div className="w-full h-full border border-primary-400/50 rounded-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Transform Container */}
      <div
        className="absolute"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Main Image Node */}
        {mainImage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute bg-white rounded-xl shadow-xl border-3 border-primary-400 overflow-hidden group"
            style={{
              left: -100,
              top: -100,
              width: 200,
              height: 200,
            }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'radial-gradient(circle at center, rgba(var(--primary-500), 0.2), transparent 70%)',
              }}
            />

            <img
              src={mainImage.src}
              alt={mainImage.name}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <span className="text-white text-sm font-medium">Main Image</span>
              </div>
              <span className="text-white/70 text-xs">{mainImage.name}</span>
            </div>

            {/* Corner decoration */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary-400/50 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary-400/50 rounded-tr" />
            <div className="absolute bottom-10 left-2 w-4 h-4 border-l-2 border-b-2 border-primary-400/50 rounded-bl" />
            <div className="absolute bottom-10 right-2 w-4 h-4 border-r-2 border-b-2 border-primary-400/50 rounded-br" />
          </motion.div>
        )}

        {/* Reference Nodes */}
        {references.map((node, index) => {
          const pos = getNodePosition(node, index);
          const typeMeta = nodeTypes[node.type];
          const isSelected = selectedNodeId === node.id;
          const isDragging = draggingNode === node.id;

          return (
            <motion.div
              key={node.id}
              className={cn(
                'absolute bg-white rounded-lg shadow-md border-2 overflow-hidden cursor-grab active:cursor-grabbing',
                isSelected ? 'ring-2 ring-primary-400 shadow-xl z-10' : 'hover:shadow-lg',
                isDragging && 'shadow-2xl z-20',
                !node.isActive && 'opacity-50'
              )}
              style={{
                left: pos.x - 40,
                top: pos.y - 40,
                width: 80,
                height: 80,
                borderColor: typeMeta.color,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isDragging ? 1.1 : 1,
                opacity: 1,
                boxShadow: isDragging
                  ? `0 20px 40px -10px ${typeMeta.color}40`
                  : isSelected
                    ? `0 10px 20px -5px ${typeMeta.color}30`
                    : undefined,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect(node.id);
              }}
              onMouseDown={(e) => {
                if (e.button === 0 && !e.altKey) {
                  e.stopPropagation();
                  setDraggingNode(node.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDragOffset({
                    x: (e.clientX - rect.left) / transform.scale,
                    y: (e.clientY - rect.top) / transform.scale,
                  });
                }
              }}
            >
              <img
                src={node.imageThumbnail}
                alt={node.name}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Type Badge */}
              <div className="absolute bottom-1 left-1">
                <NodeTypeBadge type={node.type} showLabel={false} size="sm" />
              </div>

              {/* Strength Indicator */}
              <div
                className="absolute top-0 right-0 w-1.5 h-full transition-all"
                style={{
                  background: `linear-gradient(to top, ${typeMeta.color} ${node.strength}%, transparent ${node.strength}%)`,
                }}
              />

              {/* Node name tooltip on hover */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900/80 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {node.name}
              </div>

              {/* Snapping indicator when dragging */}
              {isDragging && snapToGrid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-medium rounded shadow"
                >
                  <Magnet className="w-2.5 h-2.5" />
                  Snap
                </motion.div>
              )}

              {/* Delete Button */}
              <AnimatePresence>
                {isSelected && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeDelete(node.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Resize handles when selected */}
              {isSelected && !isDragging && (
                <>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-primary-400 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-primary-400 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-primary-400 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-primary-400 rounded-full cursor-se-resize" />
                </>
              )}
            </motion.div>
          );
        })}

        {/* Connection Lines */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: -1000,
            top: -1000,
            width: 2000,
            height: 2000,
          }}
        >
          <defs>
            {references.map((node) => {
              const typeMeta = nodeTypes[node.type];
              return (
                <linearGradient key={`grad-${node.id}`} id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={typeMeta.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={typeMeta.color} stopOpacity={0.2} />
                </linearGradient>
              );
            })}
          </defs>

          {mainImage && references.map((node, index) => {
            const pos = getNodePosition(node, index);
            const typeMeta = nodeTypes[node.type];
            const isSelected = selectedNodeId === node.id;
            const baseWidth = 2 + (node.strength / 100) * 4;

            return (
              <g key={node.id}>
                {/* Glow effect for selected */}
                {isSelected && (
                  <line
                    x1={1000 + pos.x}
                    y1={1000 + pos.y}
                    x2={1000}
                    y2={1000}
                    stroke={typeMeta.color}
                    strokeWidth={baseWidth + 6}
                    strokeOpacity={0.15}
                    strokeLinecap="round"
                  />
                )}

                {/* Main line */}
                <line
                  x1={1000 + pos.x}
                  y1={1000 + pos.y}
                  x2={1000}
                  y2={1000}
                  stroke={`url(#gradient-${node.id})`}
                  strokeWidth={baseWidth}
                  strokeOpacity={node.isActive ? (isSelected ? 0.9 : 0.6) : 0.2}
                  strokeDasharray={node.isActive ? 'none' : '8 4'}
                  strokeLinecap="round"
                />

                {/* Animated flow particles for active connections */}
                {node.isActive && (
                  <circle r="3" fill={typeMeta.color}>
                    <animateMotion
                      dur={`${3 - (node.strength / 50)}s`}
                      repeatCount="indefinite"
                      path={`M${1000 + pos.x},${1000 + pos.y} L1000,1000`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Minimap */}
      <AnimatePresence>
        {showMinimap && (
          <Minimap
            transform={transform}
            mainImage={mainImage}
            references={references}
            nodePositions={nodePositions}
            containerSize={containerSize}
            onNavigate={handleMinimapNavigate}
          />
        )}
      </AnimatePresence>

      {/* Canvas Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200"
      >
        {/* View options */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showGrid ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            title="Toggle grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showGuides ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            title="Toggle center guides"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showRulers ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            title="Toggle rulers"
          >
            <RulerIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showMinimap ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            title="Toggle minimap"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>

        {/* Snap to grid */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={cn(
              'p-1.5 rounded-lg transition-colors flex items-center gap-1',
              snapToGrid ? 'bg-amber-100 text-amber-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            title="Snap to grid"
          >
            <Magnet className="w-4 h-4" />
            {snapToGrid && <span className="text-[10px] font-medium">ON</span>}
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-14 text-center">
            <span className="text-xs font-medium text-gray-600">{Math.round(transform.scale * 100)}%</span>
          </div>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Fit and reset */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
          <button
            onClick={handleFitToView}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitToView}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Fit to view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 text-[10px] text-gray-400 space-y-0.5">
        <div><kbd className="px-1 py-0.5 bg-gray-200/50 rounded">Alt</kbd> + drag to pan</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200/50 rounded">Scroll</kbd> to zoom</div>
      </div>

      {/* Instructions */}
      {!mainImage && references.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Drag images onto the canvas</p>
            <p className="text-sm">Or upload images using the sidebar</p>
          </div>
        </div>
      )}
    </div>
  );
}
