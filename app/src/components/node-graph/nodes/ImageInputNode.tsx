import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageInputNodeData {
  label: string;
  imageSrc?: string;
  imageThumbnail?: string;
  onImageSelect?: () => void;
}

function ImageInputNode({ data, selected }: NodeProps<ImageInputNodeData>) {
  return (
    <div
      className={`
        bg-slate-800 rounded-lg border-2 transition-all overflow-hidden min-w-[160px]
        ${selected ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-slate-600'}
      `}
    >
      {/* Header */}
      <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">{data.label}</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {data.imageThumbnail ? (
          <div className="relative">
            <img
              src={data.imageThumbnail}
              alt={data.label}
              className="w-full h-24 object-cover rounded"
            />
            <button
              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
              onClick={data.onImageSelect}
            >
              Change Image
            </button>
          </div>
        ) : (
          <button
            className="w-full h-24 border-2 border-dashed border-slate-500 rounded flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
            onClick={data.onImageSelect}
          >
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs">Select Image</span>
          </button>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
        style={{ top: '50%' }}
      />
    </div>
  );
}

export default memo(ImageInputNode);
