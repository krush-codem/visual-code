// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// 1. Import your new pages
import HomePage from "./pages/HomePage";
import ProjectVisualizer from "./pages/ProjectVisualizer";
import LiveCodePage from "./pages/LiveCodePage";

function App() {
  return (
    <Routes>
      {/* This is your new "Home" page */}
      <Route path="/" element={<HomePage />} />

      {/* This is your original project tool */}
      <Route path="/project" element={<ProjectVisualizer />} />

      {/* This will be your new live editor tool */}
      <Route path="/live" element={<LiveCodePage />} />
    </Routes>
  );
}

export default App;
