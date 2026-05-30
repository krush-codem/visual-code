// src/components/Visualizer.jsx
import React, { memo } from "react";
import { ReactFlow, Controls, Background, Handle, Position } from "@xyflow/react";

// --- Custom Node Component ---
const CustomNode = memo(({ data }) => {
  return (
    <div 
      className="px-4 py-3 shadow-xl rounded-xl bg-white border-2 border-slate-200 min-w-[180px] sm:min-w-[200px] relative transition-all active:scale-95 sm:hover:scale-105 hover:border-blue-400 group"
      style={{ backgroundColor: data.color || '#fff' }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 sm:!w-4 !h-3 sm:!h-4 !bg-slate-300 border-2 border-white -top-1.5 sm:-top-2" />
      
      {/* Sequence Badge */}
      <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black border-2 border-white shadow-lg rotate-12 transition-transform group-hover:rotate-0">
        #{data.order}
      </div>

      <div className="flex flex-col gap-0.5 sm:gap-1">
        <div className="text-[9px] sm:text-[10px] text-blue-600 font-black uppercase tracking-tighter opacity-70">
          {data.subLabel || 'LOGIC STEP'}
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate">
          {data.label}
        </div>
        
        {/* Direct Code Snippet on Node */}
        {data.code && (
          <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-100/50">
            <div className="text-[8px] sm:text-[9px] font-mono bg-slate-900/5 text-slate-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded italic truncate">
              {data.code}
            </div>
          </div>
        )}

        {data.lineno && (
          <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 mt-1 uppercase">
            Source Line {data.lineno}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 sm:!w-4 !h-3 sm:!h-4 !bg-slate-300 border-2 border-white -bottom-1.5 sm:-bottom-2" />
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
    <div className="h-full w-full touch-none"> {/* Prevent browser scroll while interacting with graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-50"
        panOnScroll={false} // Prevent pan while scrolling page on mobile
        selectionOnDrag={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        preventScrolling={true}
      >
        <Controls showInteractive={false} position="top-left" />
        <Background color="#e2e8f0" variant="lines" gap={20} />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
