import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { ProductCard } from './ProductCard';

export function ProductRecommendations() {
  const { productRecommendations, showProducts, toggleProductsPanel, synthesisMode } =
    useStudioStore();

  const hasProducts = productRecommendations.length > 0;
  const isComplete = synthesisMode === 'complete';

  if (!isComplete || !hasProducts) {
    return null;
  }

  return (
    <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
      {/* Toggle Header */}
      <button
        onClick={toggleProductsPanel}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Shop the Look</h3>
            <p className="text-xs text-slate-500">
              {productRecommendations.length} matching product{productRecommendations.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">From Pixels to Purchases</span>
          {showProducts ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Products Panel */}
      <AnimatePresence>
        {showProducts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              {/* Products Grid */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {productRecommendations.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Intent Capture Notice */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500">
                  Products matched based on your synthesized style DNA
                </p>
                <a
                  href="#"
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View all recommendations</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
