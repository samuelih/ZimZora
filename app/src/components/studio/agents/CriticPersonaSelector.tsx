import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Minus, Ruler, Palette, Check } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { CriticPersona, criticPersonaDefinitions } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

const iconMap = {
  Minus,
  Ruler,
  Palette,
};

export function CriticPersonaSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { criticPersona, setCriticPersona } = useStudioStore();

  const currentPersona = criticPersonaDefinitions[criticPersona];
  const CurrentIcon = iconMap[currentPersona.icon as keyof typeof iconMap] || Minus;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${currentPersona.color}20` }}
        >
          <CurrentIcon className="w-4 h-4" style={{ color: currentPersona.color }} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">{currentPersona.name}</p>
          <p className="text-xs text-slate-500">Critic Persona</p>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-500 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-slate-500 px-2 py-1 mb-1">Select a critic persona</p>
                {Object.values(criticPersonaDefinitions).map((persona) => {
                  const Icon = iconMap[persona.icon as keyof typeof iconMap] || Minus;
                  const isSelected = criticPersona === persona.id;

                  return (
                    <motion.button
                      key={persona.id}
                      onClick={() => {
                        setCriticPersona(persona.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-lg transition-colors',
                        isSelected
                          ? 'bg-slate-700/50'
                          : 'hover:bg-slate-700/30'
                      )}
                      whileHover={{ x: 2 }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${persona.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: persona.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{persona.name}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {persona.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {persona.focusAreas.map((area) => (
                            <span
                              key={area}
                              className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
