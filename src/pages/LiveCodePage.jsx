// src/pages/LiveCodePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LiveCodePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">Live Code Editor</h1>
      <p className="text-muted-foreground mb-6">
        (This is where the new 3-panel AST visualizer will go.)
      </p>
      <Button asChild variant="outline">
        <Link to="/">Go Back Home</Link>
      </Button>
    </div>
  );
};

export default LiveCodePage;
