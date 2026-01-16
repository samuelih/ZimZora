import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '../../store';
import { MainImage, ReferenceConfig, LibraryImage } from '../../types';
import { cn } from '../../utils/helpers';
import { ImageUploadZone, EmptyState } from '../shared';
import { IngredientRow } from './IngredientRow';
import { Plus, ChefHat, Image as ImageIcon, Edit3, Check, Upload, Crop, RotateCw, Share2, Download } from 'lucide-react';

interface RecipeCardProps {
  mainImage: MainImage | null;
  ingredients: ReferenceConfig[];
  onSetMainImage: (image: LibraryImage) => void;
  onAddIngredient: () => void;
}

const RECIPE_STAGES = [
  { min: 0, label: 'Empty pantry', emoji: '🥄' },
  { min: 1, label: 'Getting started', emoji: '🥣' },
  { min: 2, label: 'Mixing it up', emoji: '🍲' },
  { min: 3, label: 'Looking good', emoji: '🍳' },
  { min: 5, label: 'Master chef!', emoji: '👨‍🍳' },
];

function getRecipeStage(ingredientCount: number) {
  for (let i = RECIPE_STAGES.length - 1; i >= 0; i--) {
    if (ingredientCount >= RECIPE_STAGES[i].min) {
      return RECIPE_STAGES[i];
    }
  }
  return RECIPE_STAGES[0];
}

export function RecipeCard({
  mainImage,
  ingredients,
  onSetMainImage,
  onAddIngredient,
}: RecipeCardProps) {
  const { reorderReferences } = useAppStore();
  const [recipeName, setRecipeName] = useState('My Recipe');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = ingredients.findIndex(i => i.id === active.id);
      const newIndex = ingredients.findIndex(i => i.id === over.id);
      reorderReferences(oldIndex, newIndex);
    }
  };

  const stage = getRecipeStage(ingredients.length);
  const activeIngredients = ingredients.filter(i => i.isActive);
  const progress = Math.min((activeIngredients.length / 5) * 100, 100);

  // Recipe status message
  const getStatusMessage = () => {
    if (!mainImage) return 'Add a base image to start';
    if (activeIngredients.length === 0) return 'Add ingredients to flavor your creation';
    if (activeIngredients.length < 2) return 'Almost there! Add more variety';
    return 'Ready to cook!';
  };

  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const { readFileAsDataUrl, generateThumbnail, generateId } = await import('../../utils/helpers');
        const src = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });
        onSetMainImage({
          id: generateId(),
          src,
          thumbnail,
          name: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date(),
        });
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
      {/* Recipe Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              animate={{ rotate: activeIngredients.length > 0 ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: activeIngredients.length > 0 ? Infinity : 0, repeatDelay: 3 }}
            >
              <ChefHat className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              {/* Editable Recipe Name */}
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-xl font-bold text-white bg-white/20 rounded px-2 py-0.5 outline-none
                               placeholder-white/50 w-48"
                    placeholder="Recipe name..."
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 rounded bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-2 group"
                >
                  <h2 className="text-xl font-bold text-white">{recipeName}</h2>
                  <Edit3 className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              {/* Status Message */}
              <p className="text-orange-100 text-sm flex items-center gap-2">
                <span>{stage.emoji}</span>
                <span>{getStatusMessage()}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Share recipe"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Export recipe"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-orange-100 mb-1">
            <span>{activeIngredients.length} ingredient{activeIngredients.length !== 1 ? 's' : ''}</span>
            <span>{stage.label}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Base Image Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Base Image
          </div>
          {mainImage && (
            <button
              onClick={handleImageChange}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Change
            </button>
          )}
        </div>

        {mainImage ? (
          <motion.div
            className="relative rounded-xl overflow-hidden bg-gray-100 group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setShowImageActions(true)}
            onMouseLeave={() => setShowImageActions(false)}
          >
            <img
              src={mainImage.src}
              alt={mainImage.name}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-medium">{mainImage.name}</p>
              {mainImage.dimensions && (
                <p className="text-white/70 text-xs">
                  {mainImage.dimensions.width} x {mainImage.dimensions.height}
                </p>
              )}
            </div>

            {/* Hover actions */}
            <AnimatePresence>
              {showImageActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex gap-2"
                >
                  <button
                    className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title="Crop image"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title="Rotate image"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkmark indicator */}
            <motion.div
              className="absolute top-3 left-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        ) : (
          <ImageUploadZone
            onUpload={onSetMainImage}
            variant="default"
            className="bg-orange-50 border-orange-200 hover:border-orange-300"
          />
        )}
      </div>

      {/* Ingredients Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Ingredients
          </div>
          {ingredients.length > 0 && (
            <span className="text-xs text-gray-400">Drag to reorder</span>
          )}
        </div>

        {ingredients.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={ingredients.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <motion.div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IngredientRow
                      ingredient={ingredient}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState
            type="references"
            onAction={onAddIngredient}
            className="py-4"
          />
        )}

        {/* Add Ingredient Button */}
        <motion.button
          onClick={onAddIngredient}
          className={cn(
            'w-full mt-4 py-3 px-4 rounded-xl',
            'border-2 border-dashed border-orange-200',
            'text-orange-600 font-medium text-sm',
            'hover:border-orange-300 hover:bg-orange-50',
            'transition-colors flex items-center justify-center gap-2'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-5 h-5" />
          Add Ingredient
        </motion.button>

        {/* Quick add buttons for common types */}
        {ingredients.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs text-gray-400 mr-1">Quick add:</span>
            {['Style', 'Color', 'Lighting'].map((type) => (
              <button
                key={type}
                onClick={onAddIngredient}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                + {type}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
