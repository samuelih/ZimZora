import React, { useCallback, useState } from 'react';
import { cn, readFileAsDataUrl, generateThumbnail, generateId } from '../../utils/helpers';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { LibraryImage, NodeType } from '../../types';

interface ImageUploadZoneProps {
  onUpload: (image: LibraryImage) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
  accept?: string[];
  maxSize?: number;
  className?: string;
}

export function ImageUploadZone({
  onUpload,
  onError,
  variant = 'default',
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSize = 10 * 1024 * 1024,
  className
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!accept.includes(file.type)) {
      onError?.('Invalid file type. Please upload an image.');
      return;
    }

    if (file.size > maxSize) {
      onError?.(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    setIsProcessing(true);
    try {
      const src = await readFileAsDataUrl(file);
      const thumbnail = await generateThumbnail(src, { width: 128, height: 128 });

      const image: LibraryImage = {
        id: generateId(),
        src,
        thumbnail,
        name: file.name.replace(/\.[^/.]+$/, ''),
        uploadedAt: new Date(),
        suggestedType: NodeType.STYLE,
      };

      onUpload(image);
    } catch (error) {
      onError?.('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [accept, maxSize, onUpload, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept.join(',');
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach(processFile);
    };
    input.click();
  }, [accept, processFile]);

  // Handle keyboard activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2',
          'bg-primary-50 text-primary-700 rounded-lg',
          'hover:bg-primary-100 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50',
          className
        )}
        aria-label="Upload image"
        aria-busy={isProcessing}
      >
        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
        <span className="text-sm font-medium">{isProcessing ? 'Processing...' : 'Upload Image'}</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
          'border-2 border-dashed transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
          isProcessing && 'opacity-50 cursor-wait',
          className
        )}
        aria-label="Upload image. Drag and drop or press Enter to browse files."
        aria-busy={isProcessing}
      >
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center" aria-hidden="true">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {isProcessing ? 'Processing...' : 'Add image'}
          </div>
          <div className="text-xs text-gray-500">Drop or click to upload</div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer',
        'border-2 border-dashed transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isDragging
          ? 'border-primary-500 bg-primary-50 scale-[1.02]'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
        isProcessing && 'opacity-50 cursor-wait',
        className
      )}
      aria-label="Upload images. Drag and drop files or press Enter to browse."
      aria-busy={isProcessing}
      aria-describedby="upload-instructions"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center" aria-hidden="true">
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        ) : (
          <Upload className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">
        {isProcessing ? 'Processing...' : isDragging ? 'Drop images here' : 'Upload images'}
      </p>
      <p id="upload-instructions" className="text-xs text-gray-500">
        Drag and drop or click to browse
      </p>

      {/* Screen reader only status */}
      <span className="sr-only" role="status" aria-live="polite">
        {isProcessing ? 'Processing uploaded image' : isDragging ? 'Ready to receive dropped files' : ''}
      </span>
    </div>
  );
}
