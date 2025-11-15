// src/components/Visualizer.jsx
import React from "react";
import { ReactFlow, Controls, Background } from "@xyflow/react";

const Visualizer = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      className="bg-background" // Use Tailwind theme color
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default Visualizer;
