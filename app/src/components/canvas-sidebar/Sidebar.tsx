import React from 'react';
import { LibraryImage, MainImage } from '../../types';
import { cn, readFileAsDataUrl, generateThumbnail, generateId } from '../../utils/helpers';
import { ImageUploadZone, ImageThumbnail } from '../shared';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  images: LibraryImage[];
  onUpload: (image: LibraryImage) => void;
  onImageDragStart: (image: LibraryImage) => void;
  onSetMainImage: (image: LibraryImage) => void;
  mainImage: MainImage | null;
}

export function Sidebar({
  isCollapsed,
  images,
  onUpload,
  onImageDragStart,
  onSetMainImage,
  mainImage,
}: SidebarProps) {
  const handleDragStart = (e: React.DragEvent, image: LibraryImage) => {
    e.dataTransfer.setData('application/json', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
    onImageDragStart(image);
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      for (const file of files) {
        const src = await readFileAsDataUrl(file);
        const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });
        onUpload({
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

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
        <button
          onClick={handleFileUpload}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Upload images"
        >
          <Upload className="w-5 h-5" />
        </button>
        <div className="w-8 h-px bg-gray-200 my-2" />
        {images.slice(0, 5).map(image => (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
            className="w-8 h-8 rounded bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <img src={image.thumbnail} alt={image.name} className="w-full h-full object-cover" />
          </div>
        ))}
        {images.length > 5 && (
          <span className="text-xs text-gray-500">+{images.length - 5}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Main Image Section */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Main Image
        </h3>
        {mainImage ? (
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={mainImage.thumbnail}
              alt={mainImage.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60">
              <p className="text-white text-xs truncate">{mainImage.name}</p>
            </div>
          </div>
        ) : (
          <div
            onClick={handleFileUpload}
            className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500">Set main image</span>
          </div>
        )}
      </div>

      {/* Reference Library */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Reference Images
          </h3>
          <button
            onClick={handleFileUpload}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Upload images"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map(image => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, image)}
                  onDoubleClick={() => onSetMainImage(image)}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing',
                    'border-2 border-transparent hover:border-primary-400 transition-colors'
                  )}
                  title="Drag to canvas or double-click to set as main"
                >
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag to canvas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No images yet</p>
              <button
                onClick={handleFileUpload}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Upload images
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Drag images from the library onto the canvas to add them as references.
        </p>
      </div>
    </div>
  );
}
