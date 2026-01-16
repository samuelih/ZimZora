import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Palette, Droplet, Crop, Layers, Sun, Move, Grid3X3, User, Image, Box } from 'lucide-react';

interface SocketConfig {
  id: string;
  label: string;
  type: 'image' | 'mask' | 'style' | 'number';
}

interface ParameterConfig {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  value: number | string | boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

interface ProcessorNodeData {
  label: string;
  processorType: string;
  inputs: SocketConfig[];
  outputs: SocketConfig[];
  parameters: ParameterConfig[];
  onParameterChange?: (key: string, value: any) => void;
}

const processorIcons: Record<string, React.ReactNode> = {
  'style-transfer': <Palette className="w-4 h-4 text-white" />,
  'color-blend': <Droplet className="w-4 h-4 text-white" />,
  'mask-region': <Crop className="w-4 h-4 text-white" />,
  'combine': <Layers className="w-4 h-4 text-white" />,
  'lighting-match': <Sun className="w-4 h-4 text-white" />,
  'pose-match': <Move className="w-4 h-4 text-white" />,
  'texture-apply': <Grid3X3 className="w-4 h-4 text-white" />,
  'face-swap': <User className="w-4 h-4 text-white" />,
  'depth-match': <Box className="w-4 h-4 text-white" />,
};

const processorColors: Record<string, string> = {
  'style-transfer': 'bg-purple-600',
  'color-blend': 'bg-pink-600',
  'mask-region': 'bg-green-600',
  'combine': 'bg-orange-600',
  'lighting-match': 'bg-yellow-600',
  'pose-match': 'bg-cyan-600',
  'texture-apply': 'bg-teal-600',
  'face-swap': 'bg-rose-600',
  'depth-match': 'bg-indigo-600',
};

const socketColors: Record<string, string> = {
  'image': '!bg-blue-500 !border-blue-300',
  'mask': '!bg-green-500 !border-green-300',
  'style': '!bg-purple-500 !border-purple-300',
  'number': '!bg-yellow-500 !border-yellow-300',
};

function ProcessorNode({ data, selected }: NodeProps<ProcessorNodeData>) {
  const headerColor = processorColors[data.processorType] || 'bg-slate-600';
  const icon = processorIcons[data.processorType] || <Layers className="w-4 h-4 text-white" />;

  const inputSpacing = data.inputs.length > 0 ? 100 / (data.inputs.length + 1) : 50;
  const outputSpacing = data.outputs.length > 0 ? 100 / (data.outputs.length + 1) : 50;

  return (
    <div
      className={`
        bg-slate-800 rounded-lg border-2 transition-all overflow-hidden min-w-[180px]
        ${selected ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-slate-600'}
      `}
    >
      {/* Header */}
      <div className={`${headerColor} px-3 py-2 flex items-center gap-2`}>
        {icon}
        <span className="text-white text-sm font-medium">{data.label}</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input/Output Labels */}
        <div className="flex justify-between text-xs">
          <div className="space-y-1">
            {data.inputs.map((input) => (
              <div key={input.id} className="text-slate-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${socketColors[input.type]?.replace('!', '') || 'bg-blue-500'}`} />
                {input.label}
              </div>
            ))}
          </div>
          <div className="space-y-1 text-right">
            {data.outputs.map((output) => (
              <div key={output.id} className="text-slate-400 flex items-center gap-1 justify-end">
                {output.label}
                <span className={`w-2 h-2 rounded-full ${socketColors[output.type]?.replace('!', '') || 'bg-blue-500'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        {data.parameters.map((param) => (
          <div key={param.key} className="space-y-1">
            <label className="text-xs text-slate-400">{param.label}</label>
            {param.type === 'number' && (
              <input
                type="range"
                min={param.min || 0}
                max={param.max || 100}
                value={param.value as number}
                onChange={(e) => data.onParameterChange?.(param.key, parseInt(e.target.value))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            )}
            {param.type === 'select' && (
              <select
                value={param.value as string}
                onChange={(e) => data.onParameterChange?.(param.key, e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white"
              >
                {param.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {param.type === 'boolean' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={param.value as boolean}
                  onChange={(e) => data.onParameterChange?.(param.key, e.target.checked)}
                  className="w-3 h-3 rounded bg-slate-700 border-slate-600 text-primary-500"
                />
                <span className="text-xs text-white">{param.value ? 'Enabled' : 'Disabled'}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Input Handles */}
      {data.inputs.map((input, index) => (
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          className={`!w-3 !h-3 !border-2 ${socketColors[input.type]}`}
          style={{ top: `${inputSpacing * (index + 1)}%` }}
        />
      ))}

      {/* Output Handles */}
      {data.outputs.map((output, index) => (
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          className={`!w-3 !h-3 !border-2 ${socketColors[output.type]}`}
          style={{ top: `${outputSpacing * (index + 1)}%` }}
        />
      ))}
    </div>
  );
}

export default memo(ProcessorNode);
