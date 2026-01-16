import React from 'react';
import { GenerationState } from '../../types';
import { cn } from '../../utils/helpers';
import { Loader2, Check, X, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface GenerationOverlayProps {
  state: GenerationState;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

export function GenerationOverlay({
  state,
  onCancel,
  onClose,
  className
}: GenerationOverlayProps) {
  if (state.status === 'idle') return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-black/50 backdrop-blur-sm',
      className
    )}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {state.status === 'generating' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div
                className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating...
            </h3>
            <p className="text-gray-600 mb-6">
              {state.currentStep || 'Processing your image'}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {state.progress}% complete
            </p>

            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}

        {state.status === 'complete' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generation Complete!
            </h3>
            <p className="text-gray-600 mb-6">
              Your image has been generated successfully.
            </p>

            {state.resultImage && (
              <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={state.resultImage}
                  alt="Generated result"
                  className="w-full h-auto"
                />
              </div>
            )}

            {onClose && (
              <Button onClick={onClose}>
                View Result
              </Button>
            )}
          </div>
        )}

        {state.status === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-10 h-10 text-red-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generation Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {state.error?.message || 'An error occurred during generation.'}
            </p>

            {onClose && (
              <Button onClick={onClose}>
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function GenerationButton({
  state,
  onGenerate,
  disabled = false,
  className
}: {
  state: GenerationState;
  onGenerate: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const isGenerating = state.status === 'generating';

  return (
    <Button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      loading={isGenerating}
      size="lg"
      className={cn('gap-2', className)}
      leftIcon={!isGenerating && <Sparkles className="w-5 h-5" />}
    >
      {isGenerating ? `Generating... ${state.progress}%` : 'Generate'}
    </Button>
  );
}
