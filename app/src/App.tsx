import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParadigmType } from './types';
import { useAppStore } from './store';
import { ParadigmSwitcher } from './components/shared';
import { CanvasSidebarUI } from './components/canvas-sidebar';
import { RadialOrbitalUI } from './components/radial-orbital';
import { NodeGraphUI } from './components/node-graph';
import { RecipeIngredientUI } from './components/recipe';
import { LayersPanelUI } from './components/layers';
import { KeyboardShortcutsModal } from './components/shared/KeyboardShortcutsModal';
import { Keyboard, HelpCircle } from 'lucide-react';
import './index.css';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

function App() {
  const [currentParadigm, setCurrentParadigm] = useState<ParadigmType>('recipe');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const { generation } = useAppStore();

  // Global keyboard shortcut for help modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderParadigm = () => {
    const content = (() => {
      switch (currentParadigm) {
        case 'canvas':
          return <CanvasSidebarUI />;
        case 'orbital':
          return <RadialOrbitalUI />;
        case 'node-graph':
          return <NodeGraphUI />;
        case 'recipe':
          return <RecipeIngredientUI />;
        case 'layers':
          return <LayersPanelUI />;
        default:
          return <RecipeIngredientUI />;
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentParadigm}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  // For dark-themed paradigms (orbital, node-graph, layers)
  const isDarkParadigm = ['orbital', 'node-graph', 'layers'].includes(currentParadigm);

  // Generation progress for header
  const isGenerating = generation.status === 'generating';
  const progress = generation.progress;

  return (
    <div className="h-screen flex flex-col">
      {/* Global Header with Paradigm Switcher */}
      <header className={`
        flex items-center justify-between px-4 py-2 border-b relative
        ${isDarkParadigm
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-gray-200'
        }
      `}>
        {/* Progress bar overlay during generation */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`absolute bottom-0 left-0 h-0.5 origin-left ${
                isDarkParadigm ? 'bg-primary-400' : 'bg-primary-500'
              }`}
              style={{ width: '100%' }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <motion.h1
            className={`text-xl font-bold ${isDarkParadigm ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            ZimZora
          </motion.h1>
          <span className={`text-sm ${isDarkParadigm ? 'text-slate-400' : 'text-gray-500'}`}>
            AI Image Composition Platform
          </span>

          {/* Generation status indicator */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkParadigm
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'bg-primary-50 text-primary-600'
                }`}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-current"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span>{generation.currentStep || 'Generating...'}</span>
                <span className="opacity-60">{progress}%</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <ParadigmSwitcher
            value={currentParadigm}
            onChange={setCurrentParadigm}
            className={isDarkParadigm ? '!bg-slate-800' : ''}
          />

          {/* Keyboard shortcuts help button */}
          <motion.button
            onClick={() => setShowShortcutsModal(true)}
            className={`p-2 rounded-md transition-colors ${
              isDarkParadigm
                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Keyboard shortcuts (Press ?)"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Paradigm Content */}
      <main className="flex-1 overflow-hidden">
        {renderParadigm()}
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        isDark={isDarkParadigm}
      />
    </div>
  );
}

export default App;
