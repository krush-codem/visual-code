// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutGrid, CodeSquare } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">CodeFlow IDE</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Choose your tool to get started.
      </p>
      <div className="flex gap-6">
        <Button asChild size="lg">
          <Link to="/project">
            <LayoutGrid className="mr-2 h-5 w-5" />
            Project Visualizer
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/live">
            <CodeSquare className="mr-2 h-5 w-5" />
            Live Code Editor
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
