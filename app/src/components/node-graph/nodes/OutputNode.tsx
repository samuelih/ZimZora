import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Download, Sparkles, Loader } from 'lucide-react';

interface OutputNodeData {
  label: string;
  previewSrc?: string;
  isGenerating?: boolean;
  progress?: number;
  onGenerate?: () => void;
}

function OutputNode({ data, selected }: NodeProps<OutputNodeData>) {
  return (
    <div
      className={`
        bg-slate-800 rounded-lg border-2 transition-all overflow-hidden min-w-[200px]
        ${selected ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-slate-600'}
      `}
    >
      {/* Header */}
      <div className="bg-emerald-600 px-3 py-2 flex items-center gap-2">
        <Download className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">{data.label}</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Preview Area */}
        <div className="relative mb-3">
          {data.previewSrc ? (
            <img
              src={data.previewSrc}
              alt="Output Preview"
              className="w-full h-32 object-cover rounded"
            />
          ) : (
            <div className="w-full h-32 bg-slate-700 rounded flex flex-col items-center justify-center text-slate-400">
              {data.isGenerating ? (
                <>
                  <Loader className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs">Generating...</span>
                  {data.progress !== undefined && (
                    <div className="w-3/4 h-1 bg-slate-600 rounded-full mt-2">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${data.progress}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Download className="w-8 h-8 mb-1" />
                  <span className="text-xs">Output Preview</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={data.onGenerate}
          disabled={data.isGenerating}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
            ${data.isGenerating
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
            }
          `}
        >
          {data.isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
        style={{ top: '50%' }}
      />
    </div>
  );
}

export default memo(OutputNode);
