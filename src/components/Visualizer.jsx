// src/components/Visualizer.jsx
import React, { memo } from "react";
import { ReactFlow, Controls, Background, Handle, Position } from "@xyflow/react";

// --- Custom Node Component ---
const CustomNode = memo(({ data }) => {
  return (
    <div 
      className="px-4 py-3 shadow-xl rounded-xl bg-white border-2 border-slate-200 min-w-[200px] relative transition-all hover:scale-105 hover:border-blue-400 group"
      style={{ backgroundColor: data.color || '#fff' }}
    >
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-slate-300 border-2 border-white -top-2" />
      
      {/* Sequence Badge */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
        #{data.order}
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-blue-600 font-black uppercase tracking-tighter opacity-70">
          {data.subLabel || 'LOGIC STEP'}
        </div>
        <div className="text-sm font-bold text-slate-800 leading-tight truncate">
          {data.label}
        </div>
        
        {/* Direct Code Snippet on Node */}
        {data.code && (
          <div className="mt-2 pt-2 border-t border-slate-100/50">
            <div className="text-[9px] font-mono bg-slate-900/5 text-slate-600 px-2 py-1 rounded italic truncate">
              {data.code}
            </div>
          </div>
        )}

        {data.lineno && (
          <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
            Source Line {data.lineno}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-slate-300 border-2 border-white -bottom-2" />
    </div>
  );
});

const nodeTypes = {
  custom: CustomNode,
};

const Visualizer = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      className="bg-slate-50"
    >
      <Controls />
      <Background color="#e2e8f0" variant="lines" gap={20} />
    </ReactFlow>
  );
};

export default Visualizer;
