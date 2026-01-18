import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/studioStore';
import { useAppStore } from '../../store';
import { MixingDeskPanel } from './mixing-desk/MixingDeskPanel';
import { SynthesisZone } from './synthesis/SynthesisZone';
import { AgentFeedbackLoop } from './agents/AgentFeedbackLoop';
import { ProductRecommendations } from './commerce/ProductRecommendations';
import { ComputeModeToggle } from './compute/ComputeModeToggle';
import { QualityTierBadge } from './compute/QualityTierBadge';
import { SubscriptionPrompt } from './compute/SubscriptionPrompt';
import { CriticPersonaSelector } from './agents/CriticPersonaSelector';
import { GenerateButton } from '../shared';
import { Wand2, RotateCcw, Download } from 'lucide-react';
import { cn } from '../../utils/helpers';

export function StudioUI() {
  const {
    ideas,
    synthesisMode,
    startSynthesis,
    cancelSynthesis,
    resetStudio,
    showUpgradePrompt,
    hideUpgrade,
    qualityGate,
    iteration,
  } = useStudioStore();

  const { generation } = useAppStore();

  const canGenerate = ideas.length > 0;
  const isGenerating = synthesisMode === 'generating';
  const isComplete = synthesisMode === 'complete';

  const handleGenerate = async () => {
    if (canGenerate && !isGenerating) {
      await startSynthesis();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
      {/* Top Bar with Compute Controls */}
      <div className="flex-shrink-0 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">Creative Studio</h2>
            <span className="text-xs text-slate-500">Agentic Commerce Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <ComputeModeToggle />
            <QualityTierBadge />
          </div>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Mixing Desk */}
        <div className="w-80 flex-shrink-0 border-r border-slate-700/50 overflow-y-auto">
          <MixingDeskPanel />
        </div>

        {/* Center: Synthesis Zone */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SynthesisZone />
        </div>

        {/* Right: Agent Feedback Loop */}
        <div className="w-80 flex-shrink-0 border-l border-slate-700/50 overflow-y-auto">
          <AgentFeedbackLoop />
        </div>
      </div>

      {/* Product Recommendations Bar */}
      <ProductRecommendations />

      {/* Bottom Action Bar */}
      <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Critic Persona Selector */}
          <CriticPersonaSelector />

          {/* Center: Status */}
          <div className="flex items-center gap-4">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                />
                <span className="capitalize">{iteration.phase.replace('-', ' ')}...</span>
              </motion.div>
            )}
            {isComplete && qualityGate.passed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-emerald-400"
              >
                <span>Quality Gate Passed ({Math.round(qualityGate.overallScore)}%)</span>
              </motion.div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={resetStudio}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </motion.button>

            {/* Generate button with pulsing glow */}
            <div className="relative">
              {/* Animated glow effect when ready */}
              <AnimatePresence>
                {canGenerate && !isGenerating && !isComplete && (
                  <motion.div
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-75 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.4, 0.7, 0.4],
                      scale: [0.98, 1.02, 0.98],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Sparkle ring when ready */}
              <AnimatePresence>
                {canGenerate && !isGenerating && !isComplete && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: [0, (i === 0 ? -50 : i === 1 ? 50 : 0)],
                          y: [0, (i === 0 ? -15 : i === 1 ? -15 : -25)],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.5,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className={cn(
                  'relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
                  canGenerate && !isGenerating
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                )}
                whileHover={canGenerate && !isGenerating ? { scale: 1.05 } : {}}
                whileTap={canGenerate && !isGenerating ? { scale: 0.95 } : {}}
              >
                {/* Shimmer effect on button */}
                {canGenerate && !isGenerating && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                )}

                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Generating...</span>
                  </>
                ) : isComplete ? (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export Result</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={canGenerate ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Wand2 className="w-5 h-5" />
                    </motion.div>
                    <span>Generate</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upgrade Modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <SubscriptionPrompt onClose={hideUpgrade} />
        )}
      </AnimatePresence>
    </div>
  );
}
