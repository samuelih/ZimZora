import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Plus, Sparkles, Trash2, ZoomIn, RotateCcw, Wand2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { useAgentStore, agentDefinitions } from '../../store/agentStore';
import { Button } from '../shared';
import { AgentInsightCard } from './AgentInsightCard';
import { AgentAvatar } from './AgentAvatar';
import { cn, generateId, generateThumbnail, readFileAsDataUrl } from '../../utils/helpers';
import { NodeType } from '../../types';

interface AgentWorkspaceProps {
  className?: string;
}

export function AgentWorkspace({ className }: AgentWorkspaceProps) {
  const { mainImage, references, setMainImage, addToLibrary, removeReference } = useAppStore();
  const { analyzeImage, agents, setFocusedAgent } = useAgentStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analystInstance = agents.analyst;
  const recentInsights = analystInstance.insights
    .filter((i) => !i.dismissed)
    .slice(-3);

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const src = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });
        const id = generateId();

        const libraryImage = {
          id,
          src,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date(),
          suggestedType: NodeType.STYLE,
        };

        addToLibrary(libraryImage);
        setMainImage({
          id,
          src,
          thumbnail,
          name: libraryImage.name,
        });

        // Trigger analysis with visual feedback
        setIsAnalyzing(true);
        await analyzeImage(id, src);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Failed to upload image:', error);
        setIsAnalyzing(false);
      }
    },
    [addToLibrary, setMainImage, analyzeImage]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    // Reset the input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-hidden">
        {!mainImage ? (
          // Empty state - upload prompt
          <div className="h-full flex items-center justify-center">
            <motion.div
              className="max-w-lg w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(99, 102, 241, 0)',
                      '0 0 0 20px rgba(99, 102, 241, 0.1)',
                      '0 0 0 0 rgba(99, 102, 241, 0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wand2 className="w-10 h-10 text-indigo-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Start with an Image
                </h2>
                <p className="text-slate-400 text-lg">
                  Upload your base image and our AI agents will help you create something amazing
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload zone */}
              <motion.div
                onClick={openFilePicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  'relative border-2 border-dashed rounded-3xl p-12 text-center transition-all overflow-hidden cursor-pointer',
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-600 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                )}
                animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                whileHover={{ borderColor: 'rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <motion.div
                  className="relative z-10 pointer-events-none"
                  animate={isDragging ? { y: -5 } : { y: 0 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6"
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Upload className="w-10 h-10 text-indigo-400" />
                  </motion.div>
                  <p className="text-white font-semibold text-lg mb-2">
                    {isDragging ? 'Drop your image here' : 'Drop your image here'}
                  </p>
                  <p className="text-sm text-slate-500">
                    or click to browse
                  </p>
                </motion.div>
              </motion.div>

              {/* Agent hints */}
              <motion.div
                className="mt-10 grid grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  { icon: Image, label: 'Analyze', color: agentDefinitions.analyst.color, agent: 'analyst' },
                  { icon: Sparkles, label: 'Enhance', color: agentDefinitions.composer.color, agent: 'composer' },
                  { icon: Plus, label: 'Generate', color: agentDefinitions.generator.color, agent: 'generator' },
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    className="p-5 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl text-center transition-colors border border-slate-700/50 hover:border-slate-600/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setFocusedAgent(item.agent as any)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">{item.label}</p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        ) : (
          // Image loaded state
          <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Image display */}
            <div className="flex-1 flex flex-col min-w-0">
              <motion.div
                className="relative flex-1 rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Image */}
                <img
                  src={mainImage.src}
                  alt={mainImage.name}
                  className="w-full h-full object-contain"
                />

                {/* Analysis overlay */}
                <AnimatePresence>
                  {(isAnalyzing || analystInstance.status === 'analyzing') && (
                    <motion.div
                      className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center">
                        {/* Scanning animation */}
                        <motion.div className="relative w-32 h-32 mx-auto mb-6">
                          {/* Outer ring */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-4 border-indigo-500/30"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          />
                          {/* Inner ring */}
                          <motion.div
                            className="absolute inset-4 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                          {/* Center icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <AgentAvatar
                              agentId="analyst"
                              status="analyzing"
                              color={agentDefinitions.analyst.color}
                              size="lg"
                              showStatus={false}
                            />
                          </div>
                          {/* Scanning line */}
                          <motion.div
                            className="absolute left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent"
                            style={{ marginLeft: '-1px' }}
                            animate={{
                              x: [-40, 40, -40],
                              opacity: [0, 1, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>

                        <motion.p
                          className="text-white font-semibold text-lg mb-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {analystInstance.currentTask?.description || 'Analyzing image...'}
                        </motion.p>

                        {/* Progress bar */}
                        {analystInstance.currentTask && (
                          <div className="w-64 mx-auto">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${analystInstance.currentTask.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              {analystInstance.currentTask.progress}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Zoom"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={openFilePicker}
                    className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Replace image"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Filename badge */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-lg">
                  <p className="text-sm text-white font-medium truncate max-w-[200px]">
                    {mainImage.name}
                  </p>
                </div>
              </motion.div>

              {/* Action bar */}
              <motion.div
                className="mt-4 flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMainImage(null)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      setIsAnalyzing(true);
                      analyzeImage(mainImage.id, mainImage.src).then(() => setIsAnalyzing(false));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnalyzing || analystInstance.status === 'analyzing'}
                  >
                    <Wand2 className="w-4 h-4" />
                    Re-analyze
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Insights sidebar */}
            <AnimatePresence>
              {recentInsights.length > 0 && (
                <motion.div
                  className="lg:w-80 space-y-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">
                      Analysis Results
                    </h4>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                      {recentInsights.length} insights
                    </span>
                  </div>
                  {recentInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <AgentInsightCard
                        insight={insight}
                        variant="compact"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* References bar */}
      <AnimatePresence>
        {mainImage && references.length > 0 && (
          <motion.div
            className="border-t border-slate-700/50 p-4 bg-slate-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <span className="text-sm text-slate-400 whitespace-nowrap flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                References ({references.length})
              </span>
              {references.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  className="relative group flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <img
                    src={ref.imageThumbnail}
                    alt={ref.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-600 group-hover:border-slate-500 transition-colors"
                  />
                  <motion.button
                    onClick={() => removeReference(ref.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </motion.button>
                  {/* Type badge */}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-900/80 text-slate-300 capitalize"
                  >
                    {ref.type}
                  </div>
                </motion.div>
              ))}
              <motion.button
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 hover:border-slate-500 flex items-center justify-center text-slate-500 hover:text-slate-400 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
