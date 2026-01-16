import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainImage, ReferenceConfig, PolarPosition, LibraryImage } from '../../types';
import { nodeTypes } from '../../store';
import { cn, polarToCartesian } from '../../utils/helpers';
import { NodeTypeBadge, EmptyState } from '../shared';
import { Upload, Target, Zap } from 'lucide-react';

interface OrbitalCanvasProps {
  mainImage: MainImage | null;
  references: ReferenceConfig[];
  nodePositions: Record<string, PolarPosition>;
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeMove: (id: string, position: PolarPosition) => void;
  onSetMainImage: (image: LibraryImage) => void;
  className?: string;
}

// Zone configuration
const zones = [
  { radius: 0.33, color: 'rgba(34, 197, 94, 0.2)', label: 'High', influence: '67-100%', glowColor: '#22c55e' },
  { radius: 0.66, color: 'rgba(234, 179, 8, 0.12)', label: 'Medium', influence: '34-66%', glowColor: '#eab308' },
  { radius: 1, color: 'rgba(107, 114, 128, 0.08)', label: 'Low', influence: '0-33%', glowColor: '#6b7280' },
];

export function OrbitalCanvas({
  mainImage,
  references,
  nodePositions,
  selectedNodeId,
  onNodeSelect,
  onNodeMove,
  onSetMainImage,
  className,
}: OrbitalCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showZoneLabels, setShowZoneLabels] = useState(true);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const center = {
    x: containerSize.width / 2,
    y: containerSize.height / 2,
  };

  const maxRadius = Math.min(containerSize.width, containerSize.height) * 0.4;

  // Convert polar to screen coordinates
  const polarToScreen = (polar: PolarPosition) => {
    const cartesian = polarToCartesian(polar.angle, polar.distance * maxRadius);
    return {
      x: center.x + cartesian.x,
      y: center.y + cartesian.y,
    };
  };

  // Convert screen to polar coordinates
  const screenToPolar = (screenX: number, screenY: number): PolarPosition => {
    const dx = screenX - center.x;
    const dy = screenY - center.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / maxRadius, 1);
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return { angle, distance };
  };

  // Get the zone a node is in based on distance
  const getZoneForDistance = (distance: number) => {
    for (const zone of zones) {
      if (distance <= zone.radius) return zone;
    }
    return zones[zones.length - 1];
  };

  // Handle node drag
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    onNodeSelect(nodeId);
  }, [onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const polar = screenToPolar(x, y);
      onNodeMove(draggingNode, polar);
    }
  }, [draggingNode, onNodeMove]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('orbital-zone')) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Handle drop for main image
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const image = JSON.parse(data) as LibraryImage;

      // Check if dropped near center
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );

      if (distanceFromCenter < 80) {
        onSetMainImage(image);
      }
    } catch (error) {
      console.error('Failed to parse dropped data:', error);
    }
  }, [center, onSetMainImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        isDraggingOver && 'ring-2 ring-inset ring-primary-400',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Influence Zones SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Glow filters for zones */}
          {zones.map((zone, i) => (
            <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Zone circles (drawn from outer to inner) */}
        {[...zones].reverse().map((zone, index) => (
          <g key={index}>
            <motion.circle
              cx={center.x}
              cy={center.y}
              r={zone.radius * maxRadius}
              fill={zone.color}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              className="orbital-zone"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
            {/* Dashed ring for visual separation */}
            <circle
              cx={center.x}
              cy={center.y}
              r={zone.radius * maxRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
          </g>
        ))}

        {/* Zone labels */}
        <AnimatePresence>
          {showZoneLabels && zones.map((zone, index) => {
            const labelRadius = zone.radius * maxRadius - 20;
            const labelAngle = -45; // Top-left position
            const pos = polarToCartesian(labelAngle, labelRadius);

            return (
              <motion.g
                key={`label-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <rect
                  x={center.x + pos.x - 35}
                  y={center.y + pos.y - 12}
                  width="70"
                  height="24"
                  rx="12"
                  fill="rgba(0, 0, 0, 0.6)"
                  stroke={zone.glowColor}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={center.x + pos.x}
                  y={center.y + pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="500"
                >
                  {zone.label}
                </text>
                <text
                  x={center.x + pos.x}
                  y={center.y + pos.y + 11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="8"
                >
                  {zone.influence}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Radial grid lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const end = polarToCartesian(angle, maxRadius);
          return (
            <motion.line
              key={angle}
              x1={center.x}
              y1={center.y}
              x2={center.x + end.x}
              y2={center.y + end.y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: angle / 720 }}
            />
          );
        })}

        {/* Connection lines from nodes to center */}
        {references.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          const screenPos = polarToScreen(pos);
          const typeMeta = nodeTypes[node.type];
          const isHovered = hoveredNode === node.id || selectedNodeId === node.id;

          return (
            <motion.line
              key={`line-${node.id}`}
              x1={screenPos.x}
              y1={screenPos.y}
              x2={center.x}
              y2={center.y}
              stroke={typeMeta.color}
              strokeWidth={isHovered ? 3 : 1 + (node.strength / 100) * 2}
              strokeOpacity={node.isActive ? (isHovered ? 0.8 : 0.4 + (node.strength / 100) * 0.3) : 0.15}
              strokeDasharray={node.isActive ? 'none' : '4 4'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* Main Image Node */}
      <motion.div
        className={cn(
          'absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-4 shadow-2xl transition-all',
          isDraggingOver ? 'border-primary-400 ring-4 ring-primary-400/50' : 'border-white/80',
          mainImage && 'cursor-pointer hover:ring-2 hover:ring-white/50'
        )}
        style={{
          left: center.x,
          top: center.y,
          width: 140,
          height: 140,
          zIndex: 10,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: isDraggingOver ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={mainImage ? { scale: 1.05 } : {}}
      >
        {mainImage ? (
          <>
            <img
              src={mainImage.src}
              alt={mainImage.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Center indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors">
              <Target className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-white/60">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="w-8 h-8 mb-2" />
            </motion.div>
            <span className="text-xs text-center px-2">Drop main image here</span>
          </div>
        )}
      </motion.div>

      {/* Reference Nodes */}
      <AnimatePresence>
        {references.map((node, index) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          const screenPos = polarToScreen(pos);
          const typeMeta = nodeTypes[node.type];
          const isSelected = selectedNodeId === node.id;
          const isDragging = draggingNode === node.id;
          const isHovered = hoveredNode === node.id;
          const zone = getZoneForDistance(pos.distance);

          // Size based on strength and distance
          const baseSize = 50;
          const strengthBonus = (node.strength / 100) * 25;
          const distanceBonus = (1 - pos.distance) * 15;
          const size = baseSize + strengthBonus + distanceBonus;

          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-3 cursor-grab active:cursor-grabbing',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent',
                isDragging && 'shadow-2xl',
                !node.isActive && 'opacity-40'
              )}
              style={{
                left: screenPos.x,
                top: screenPos.y,
                width: size,
                height: size,
                borderColor: typeMeta.color,
                zIndex: isSelected || isDragging ? 20 : 5,
                boxShadow: isHovered || isSelected
                  ? `0 0 20px ${typeMeta.color}40, 0 0 40px ${typeMeta.color}20`
                  : `0 4px 15px rgba(0,0,0,0.3)`,
              }}
              whileHover={{ scale: 1.1 }}
              drag={false}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <img
                src={node.imageThumbnail}
                alt={node.name}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Type indicator bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: typeMeta.color }}
              />

              {/* Strength glow effect */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 ${node.strength / 4}px ${typeMeta.color}60`,
                }}
              />

              {/* Hover info badge */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                  >
                    {node.name} · {Math.round((1 - pos.distance) * 100)}%
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Dragging indicator */}
      <AnimatePresence>
        {draggingNode && nodePositions[draggingNode] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bg-black/90 text-white text-sm px-4 py-2 rounded-lg pointer-events-none shadow-lg"
            style={{
              left: polarToScreen(nodePositions[draggingNode]).x + 50,
              top: polarToScreen(nodePositions[draggingNode]).y - 20,
              zIndex: 30,
            }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">
                {Math.round((1 - nodePositions[draggingNode].distance) * 100)}%
              </span>
              <span className="text-white/60">influence</span>
            </div>
            <div className="text-xs text-white/50 mt-1">
              {getZoneForDistance(nodePositions[draggingNode].distance).label} zone
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay when empty */}
      {!mainImage && references.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <EmptyState type="orbital" isDark={true} />
        </div>
      )}

      {/* Toggle zone labels button */}
      <button
        onClick={() => setShowZoneLabels(!showZoneLabels)}
        className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white text-xs rounded-lg transition-colors"
      >
        {showZoneLabels ? 'Hide' : 'Show'} zones
      </button>
    </div>
  );
}
