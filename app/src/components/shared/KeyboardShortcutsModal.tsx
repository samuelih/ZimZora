import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Paradigm Navigation',
    shortcuts: [
      { keys: ['1'], description: 'Switch to Canvas mode' },
      { keys: ['2'], description: 'Switch to Orbital mode' },
      { keys: ['3'], description: 'Switch to Node Graph mode' },
      { keys: ['4'], description: 'Switch to Recipe Builder' },
      { keys: ['5'], description: 'Switch to Layers Panel' },
    ],
  },
  {
    title: 'Generation',
    shortcuts: [
      { keys: ['Cmd', 'Enter'], description: 'Generate image' },
      { keys: ['Escape'], description: 'Cancel generation' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Cmd', 'Z'], description: 'Undo' },
      { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Cmd', 'S'], description: 'Export configuration' },
    ],
  },
  {
    title: 'Canvas Mode',
    shortcuts: [
      { keys: ['+'], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
      { keys: ['0'], description: 'Reset zoom to 100%' },
      { keys: ['Space', 'Drag'], description: 'Pan canvas' },
      { keys: ['Delete'], description: 'Remove selected item' },
    ],
  },
  {
    title: 'Node Graph Mode',
    shortcuts: [
      { keys: ['A'], description: 'Add new node' },
      { keys: ['Delete'], description: 'Delete selected node' },
      { keys: ['Cmd', 'A'], description: 'Select all nodes' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose, isDark = false }: KeyboardShortcutsModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close on Escape and trap focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

      // Trap focus within modal
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus close button when modal opens
  React.useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl shadow-2xl',
              isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            aria-describedby="keyboard-shortcuts-description"
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between px-6 py-4 border-b',
              isDark ? 'border-slate-700' : 'border-gray-200'
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isDark ? 'bg-slate-700' : 'bg-gray-100'
                )} aria-hidden="true">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
                  <p id="keyboard-shortcuts-description" className={cn(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  )}>
                    Quick reference for all available shortcuts
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isDark
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                )}
                aria-label="Close keyboard shortcuts modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shortcutGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className={cn(
                      'text-sm font-semibold mb-3',
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    )}>
                      {group.title}
                    </h3>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-center justify-between py-1.5 px-2 rounded',
                            isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                          )}
                        >
                          <span className={cn(
                            'text-sm',
                            isDark ? 'text-slate-300' : 'text-gray-600'
                          )}>
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                {keyIndex > 0 && (
                                  <span className={cn(
                                    'text-xs',
                                    isDark ? 'text-slate-500' : 'text-gray-400'
                                  )}>
                                    +
                                  </span>
                                )}
                                <kbd className={cn(
                                  'px-2 py-1 text-xs font-medium rounded border',
                                  isDark
                                    ? 'bg-slate-700 border-slate-600 text-slate-200'
                                    : 'bg-gray-100 border-gray-200 text-gray-700'
                                )}>
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={cn(
              'px-6 py-3 border-t text-center',
              isDark ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'
            )}>
              <span className="text-xs">
                Press <kbd className={cn(
                  'px-1.5 py-0.5 text-xs rounded border mx-1',
                  isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'
                )}>?</kbd> to toggle this modal
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
