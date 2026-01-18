import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Link2, Pencil, Sparkles, Check } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { cn, generateThumbnail, readFileAsDataUrl } from '../../../utils/helpers';

export function IdeaDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addIdea, ideas } = useStudioStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsProcessing(true);

    try {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );

      for (const file of files) {
        const source = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(source, 128);

        addIdea({
          type: 'photo',
          source,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
        });
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error('Error processing dropped files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [addIdea]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      for (const file of files) {
        const source = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(source, 128);

        addIdea({
          type: 'photo',
          source,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
        });
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  }, [addIdea]);

  const isEmpty = ideas.length === 0;

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Animated border glow effect */}
      <motion.div
        className={cn(
          'absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity',
          isDragging ? 'opacity-100' : 'group-hover:opacity-50'
        )}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
        }}
        animate={isEmpty && !isDragging ? {
          opacity: [0.3, 0.5, 0.3],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all overflow-hidden backdrop-blur-sm',
          isDragging
            ? 'border-indigo-400 bg-indigo-500/20'
            : showSuccess
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-600 hover:border-indigo-500/50 bg-slate-800/80'
        )}
      >
        <label className="flex flex-col items-center gap-3 p-6 cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="sr-only"
          />

          {/* Icon with animations */}
          <motion.div
            animate={
              isDragging
                ? { scale: 1.2, rotate: 5 }
                : showSuccess
                ? { scale: 1.1 }
                : { scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'relative w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              isDragging
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : showSuccess
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 group-hover:from-indigo-600/50 group-hover:to-purple-600/50'
            )}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={isEmpty ? {
                boxShadow: [
                  '0 0 0 0 rgba(99, 102, 241, 0)',
                  '0 0 20px 5px rgba(99, 102, 241, 0.3)',
                  '0 0 0 0 rgba(99, 102, 241, 0)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                </motion.div>
              ) : showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
              ) : isDragging ? (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Upload className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Text */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.p
                  key="success-text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm font-medium text-emerald-400"
                >
                  Ideas added!
                </motion.p>
              ) : isDragging ? (
                <motion.p
                  key="dragging-text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm font-medium text-indigo-400"
                >
                  Release to add
                </motion.p>
              ) : (
                <motion.div
                  key="default-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    Drop your inspiration
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or click to browse files
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Idea type indicators with hover animations */}
          <motion.div
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            {[
              { icon: Image, label: 'Photos', color: 'from-blue-500 to-cyan-500' },
              { icon: Link2, label: 'Pins', color: 'from-pink-500 to-rose-500' },
              { icon: Pencil, label: 'Sketches', color: 'from-amber-500 to-orange-500' },
            ].map(({ icon: Icon, label, color }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs',
                  'bg-slate-700/50 text-slate-400 hover:text-white',
                  'border border-transparent hover:border-slate-600',
                  'transition-all cursor-default'
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </label>

        {/* Animated particles when dragging */}
        <AnimatePresence>
          {isDragging && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-indigo-400/60"
                  initial={{
                    opacity: 0,
                    x: '50%',
                    y: '50%',
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: `${20 + Math.random() * 60}%`,
                    y: `${20 + Math.random() * 60}%`,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Success ripple effect */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500"
                animate={{
                  scale: [1, 20],
                  opacity: [0.5, 0],
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
