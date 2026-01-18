import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Star, Check, Heart, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { ProductRecommendation } from '../../../types/studio';
import { cn } from '../../../utils/helpers';

interface ProductCardProps {
  product: ProductRecommendation;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleClick = () => {
    // In a real app, this would capture intent and open the product URL
    window.open(product.purchaseUrl, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Color based on match score
  const getMatchColor = () => {
    if (product.matchScore >= 90) return 'from-emerald-500 to-teal-500';
    if (product.matchScore >= 75) return 'from-indigo-500 to-purple-500';
    return 'from-amber-500 to-orange-500';
  };

  return (
    <motion.div
      className="relative w-56 rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition-all group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.3)'
      }}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn('absolute -inset-0.5 rounded-xl bg-gradient-to-br opacity-30 blur-md -z-10', getMatchColor())}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <motion.img
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Gradient overlay on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Match Score Badge - Animated */}
        <motion.div
          className={cn(
            'absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm',
            'bg-gradient-to-r', getMatchColor()
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </motion.div>
          <span className="text-xs font-bold text-white">{product.matchScore}%</span>
        </motion.div>

        {/* In Stock Badge */}
        {product.inStock && (
          <motion.div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">In Stock</span>
          </motion.div>
        )}

        {/* Quick Actions on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                className={cn(
                  'p-2.5 rounded-full backdrop-blur-sm transition-colors',
                  isWishlisted
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
              </motion.button>
              <motion.button
                className="p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 backdrop-blur-sm transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Vendor with icon */}
        <div className="flex items-center gap-1 mb-1">
          <ShoppingBag className="w-3 h-3 text-slate-500" />
          <p className="text-xs text-slate-500">{product.vendor}</p>
        </div>

        {/* Name */}
        <h4 className="text-sm font-medium text-white truncate mb-1.5 group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h4>

        {/* Matched Styles */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.matchedStyles.slice(0, 3).map((style, i) => (
            <motion.span
              key={style}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
            >
              <Sparkles className="w-2 h-2" />
              {style}
            </motion.span>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <motion.span
              className="text-lg font-bold text-white"
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            >
              {formatPrice(product.price, product.currency)}
            </motion.span>
          </div>

          <motion.button
            onClick={handleClick}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs overflow-hidden',
              'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
              'shadow-lg shadow-indigo-500/25'
            )}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '100%' } : { x: '-100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative">Shop Now</span>
            <ExternalLink className="w-3 h-3 relative" />
          </motion.button>
        </div>
      </div>

      {/* Match quality indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <motion.div
          className={cn('h-full bg-gradient-to-r', getMatchColor())}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: product.matchScore / 100 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
}
