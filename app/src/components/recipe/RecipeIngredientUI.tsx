import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { cn, getCulinaryTerm } from '../../utils/helpers';
import { Button, ImageUploadZone, GenerationOverlay } from '../shared';
import { RecipeCard } from './RecipeCard';
import { AddIngredientModal } from './AddIngredientModal';
import { Download, Upload, RotateCcw, Sparkles } from 'lucide-react';

export function RecipeIngredientUI() {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    mainImage,
    references,
    generation,
    setMainImage,
    addToLibrary,
    addReference,
    startGeneration,
    cancelGeneration,
    resetGeneration,
    exportConfiguration,
    reset
  } = useAppStore();

  const handleExport = () => {
    const json = exportConfiguration();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeIngredients = references.filter(r => r.isActive);
  const canGenerate = mainImage && activeIngredients.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Builder</h1>
            <p className="text-sm text-gray-600">Combine ingredients to create your image</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Recipe Card */}
        <RecipeCard
          mainImage={mainImage}
          ingredients={references}
          onSetMainImage={(image) => {
            setMainImage({
              id: image.id,
              src: image.src,
              thumbnail: image.thumbnail,
              name: image.name,
            });
          }}
          onAddIngredient={() => setShowAddModal(true)}
        />

        {/* Generate Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to Cook?</h3>
              <p className="text-sm text-gray-600">
                {activeIngredients.length} ingredient{activeIngredients.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <Button
            onClick={startGeneration}
            disabled={!canGenerate}
            fullWidth
            size="lg"
            className={cn(
              'bg-gradient-to-r from-orange-500 to-amber-500',
              'hover:from-orange-600 hover:to-amber-600',
              'shadow-lg shadow-orange-200'
            )}
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            Cook This Recipe
          </Button>

          {!mainImage && (
            <p className="text-sm text-center text-gray-500 mt-3">
              Add a base image to get started
            </p>
          )}
          {mainImage && activeIngredients.length === 0 && (
            <p className="text-sm text-center text-gray-500 mt-3">
              Add at least one ingredient
            </p>
          )}
        </div>

        {/* Recipe Summary */}
        {activeIngredients.length > 0 && (
          <div className="mt-4 p-4 bg-white/50 rounded-xl border border-orange-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recipe Summary</h4>
            <ul className="space-y-1">
              {activeIngredients.map(ingredient => (
                <li key={ingredient.id} className="text-sm text-gray-600 flex justify-between">
                  <span>{ingredient.name}</span>
                  <span className="text-gray-400 italic">{getCulinaryTerm(ingredient.strength)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Ingredient Modal */}
      <AddIngredientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(image, type) => {
          addToLibrary(image);
          addReference({
            imageId: image.id,
            imageSrc: image.src,
            imageThumbnail: image.thumbnail,
            name: image.name,
            type,
            strength: 50,
            isActive: true,
          });
          setShowAddModal(false);
        }}
      />

      {/* Generation Overlay */}
      <GenerationOverlay
        state={generation}
        onCancel={cancelGeneration}
        onClose={resetGeneration}
      />
    </div>
  );
}
