import React from 'react';
import { Node } from 'reactflow';
import { Button, Slider } from '../shared';
import { X, Trash2, Copy, Settings } from 'lucide-react';

interface GraphPropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onClose: () => void;
}

export function GraphPropertiesPanel({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose,
}: GraphPropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col items-center justify-center p-6 text-center">
        <Settings className="w-8 h-8 text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">Select a node to view its properties</p>
      </div>
    );
  }

  const { data } = selectedNode;

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="font-semibold text-white text-sm">Properties</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Info */}
        <div>
          <label className="text-xs text-slate-500 uppercase">Node Type</label>
          <p className="text-white text-sm mt-1">{selectedNode.type}</p>
        </div>

        <div>
          <label className="text-xs text-slate-500 uppercase">Label</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdateNode(selectedNode.id, { ...data, label: e.target.value })}
            className="w-full mt-1 px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Position */}
        <div>
          <label className="text-xs text-slate-500 uppercase">Position</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-xs text-slate-400">X</span>
              <p className="text-white text-sm font-mono">{Math.round(selectedNode.position.x)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Y</span>
              <p className="text-white text-sm font-mono">{Math.round(selectedNode.position.y)}</p>
            </div>
          </div>
        </div>

        {/* Parameters (if processor node) */}
        {data.parameters && data.parameters.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs text-slate-500 uppercase">Parameters</label>
            {data.parameters.map((param: any) => (
              <div key={param.key}>
                {param.type === 'number' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-300">{param.label}</span>
                      <span className="text-xs text-slate-500">{param.value}</span>
                    </div>
                    <input
                      type="range"
                      min={param.min || 0}
                      max={param.max || 100}
                      value={param.value}
                      onChange={(e) => {
                        const newParams = data.parameters.map((p: any) =>
                          p.key === param.key ? { ...p, value: parseInt(e.target.value) } : p
                        );
                        onUpdateNode(selectedNode.id, { ...data, parameters: newParams });
                      }}
                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                )}
                {param.type === 'select' && (
                  <div>
                    <span className="text-sm text-slate-300 block mb-1">{param.label}</span>
                    <select
                      value={param.value}
                      onChange={(e) => {
                        const newParams = data.parameters.map((p: any) =>
                          p.key === param.key ? { ...p, value: e.target.value } : p
                        );
                        onUpdateNode(selectedNode.id, { ...data, parameters: newParams });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                    >
                      {param.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {param.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={param.value}
                      onChange={(e) => {
                        const newParams = data.parameters.map((p: any) =>
                          p.key === param.key ? { ...p, value: e.target.checked } : p
                        );
                        onUpdateNode(selectedNode.id, { ...data, parameters: newParams });
                      }}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-primary-500"
                    />
                    <span className="text-sm text-slate-300">{param.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <button
          onClick={() => onDuplicateNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
