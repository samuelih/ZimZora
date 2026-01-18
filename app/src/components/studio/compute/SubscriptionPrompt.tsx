import React from 'react';
import { motion } from 'framer-motion';
import { X, Cloud, Zap, Shield, Sparkles, Check } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';

interface SubscriptionPromptProps {
  onClose: () => void;
}

const features = [
  { icon: Cloud, text: 'Cloud GPU rendering' },
  { icon: Zap, text: 'Production quality outputs' },
  { icon: Shield, text: 'Priority processing' },
  { icon: Sparkles, text: 'Advanced AI models' },
];

export function SubscriptionPrompt({ onClose }: SubscriptionPromptProps) {
  const { setComputeMode } = useStudioStore();

  const handleUpgrade = () => {
    // In a real app, this would open a payment flow
    // For demo, we'll just enable cloud mode
    useStudioStore.setState({ subscriptionTier: 'premium' });
    setComputeMode('cloud');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Cloud className="w-10 h-10 text-white/90 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Unlock Cloud Power</h2>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-400 text-sm mb-6">
            Upgrade to Premium for production-quality renders powered by cloud GPUs and advanced AI models.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-white">$19</span>
              <span className="text-slate-500">/month</span>
            </div>
            <p className="text-xs text-slate-500">Cancel anytime. 7-day free trial.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              Stay on Free
            </button>
            <motion.button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial
            </motion.button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-slate-600 text-center mt-4">
            Free tier includes unlimited local NPU drafts
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
