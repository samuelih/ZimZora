import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AgentInsight, InsightType, ColorAnalysis } from '../../types/agents';
import { agentDefinitions } from '../../store/agentStore';
import { cn } from '../../utils/helpers';

interface AgentInsightCardProps {
  insight: AgentInsight;
  onDismiss?: () => void;
  onAction?: (actionId: string) => void;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
}

const insightIcons: Record<InsightType, React.ElementType> = {
  analysis: TrendingUp,
  suggestion: Lightbulb,
  warning: AlertTriangle,
  tip: Sparkles,
  comparison: Eye,
  discovery: Sparkles,
};

const insightColors: Record<InsightType, string> = {
  analysis: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  suggestion: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  warning: 'text-red-400 bg-red-500/10 border-red-500/20',
  tip: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  comparison: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  discovery: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

function ColorPaletteDisplay({ colors }: { colors: ColorAnalysis['palette'] }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* Color bars */}
      <div className="relative h-12 rounded-xl overflow-hidden flex shadow-inner">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: color.hex,
              flex: color.percentage,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileHover={{ flex: color.percentage * 1.5 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

            {/* Hover tooltip */}
            {hoveredIndex === index && (
              <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-slate-800 rounded-lg px-3 py-2 shadow-xl border border-slate-600 whitespace-nowrap">
                  <div
                    className="w-4 h-4 rounded mx-auto mb-1"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-xs font-medium text-white text-center">{color.name}</p>
                  <p className="text-xs text-slate-400 text-center">{color.hex}</p>
                  <p className="text-xs text-emerald-400 text-center font-semibold">{color.percentage}%</p>
                </div>
                <div className="w-3 h-3 bg-slate-800 border-r border-b border-slate-600 rotate-45 mx-auto -mt-1.5" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Color swatches with labels */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-700/50"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <div
              className="w-3 h-3 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-xs text-slate-300">{color.name}</span>
            <span className="text-xs text-slate-500">{color.percentage}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AgentInsightCard({
  insight,
  onDismiss,
  onAction,
  variant = 'default',
  className,
}: AgentInsightCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(variant === 'expanded');
  const Icon = insightIcons[insight.type];
  const agent = agentDefinitions[insight.agentId];
  const colorAnalysis = insight.data?.colorAnalysis as ColorAnalysis | undefined;

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex items-start gap-3 p-3 rounded-xl border',
          insightColors[insight.type],
          className
        )}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
      >
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{insight.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{insight.summary}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/10 text-slate-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'rounded-xl border overflow-hidden',
        insightColors[insight.type],
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">{insight.title}</h4>
              <span
                className="px-1.5 py-0.5 text-xs rounded bg-white/10"
                style={{ color: agent.color }}
              >
                {insight.confidence}%
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{insight.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {insight.details && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Color palette visualization */}
      {colorAnalysis && (
        <div className="px-4 pb-4">
          <ColorPaletteDisplay colors={colorAnalysis.palette} />
          <div className="flex gap-4 mt-4 text-xs text-slate-400">
            <span>
              <span className="text-slate-500">Harmony:</span>{' '}
              <span className="text-white capitalize">{colorAnalysis.harmony}</span>
            </span>
            <span>
              <span className="text-slate-500">Temperature:</span>{' '}
              <span className="text-white capitalize">{colorAnalysis.temperature}</span>
            </span>
            <span>
              <span className="text-slate-500">Saturation:</span>{' '}
              <span className="text-white capitalize">{colorAnalysis.saturation}</span>
            </span>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && insight.details && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 border-t border-white/5"
        >
          <p className="text-sm text-slate-300 pt-3">{insight.details}</p>
        </motion.div>
      )}

      {/* Actions */}
      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
        <div className="px-4 pb-4 flex gap-2">
          {insight.suggestedActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction?.(action.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                action.variant === 'primary' &&
                  'bg-white/10 text-white hover:bg-white/20',
                action.variant === 'secondary' &&
                  'text-slate-400 hover:text-white hover:bg-white/5',
                action.variant === 'ghost' && 'text-slate-500 hover:text-slate-300'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
