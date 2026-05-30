// src/pages/ProjectVisualizer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import * as babelParser from "@babel/parser";
import path from "path-browserify";
import { Link } from "react-router-dom";
import { Home, FolderOpen, FileCode, Layers, Search, Info, Zap, Loader2, FileText, ChevronDown } from "lucide-react";

// --- Component Imports ---
import CodeEditor from "@/components/CodeEditor";
import Visualizer from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// --- Hook Imports ---
import { useDebounce } from "@/hooks/useDebounce";

// --- Util Imports ---
import { processDirectory, walkJSXSimple } from "@/utils";

import "@xyflow/react/dist/style.css";

const DashboardSidebar = ({ onFolderOpen, isParsing, projectFiles, onFileClick, activeFilePath }) => {
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div className="p-4 flex flex-col h-full bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
          <Layers className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">ReactArchitect</h1>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Project Engine</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col min-h-0 space-y-4">
        <Button asChild variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
          <Link to="/">
            <Home className="mr-3 h-4 w-4" /> Home
          </Link>
        </Button>

        <div className="pt-4 border-t border-slate-800">
          <Button 
            onClick={onFolderOpen} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-5 shadow-lg shadow-indigo-900/40 active:scale-95 transition-transform"
          >
            <FolderOpen className="mr-2 h-4 w-4" /> OPEN PROJECT
          </Button>
        </div>

        {projectFiles.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 mt-4">
            <button 
              onClick={() => setShowFiles(!showFiles)}
              className="flex items-center justify-between w-full px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
            >
              Project Files ({projectFiles.length})
              <ChevronDown className={`w-3 h-3 transition-transform ${showFiles ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`mt-2 flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar ${showFiles ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
              {projectFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onFileClick(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                    activeFilePath === file.path 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{path.basename(file.path)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 p-3 bg-indigo-900/20 rounded-lg border border-indigo-800/30 text-indigo-400">
          <Zap className="w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-tight">System Ready</span>
            {isParsing && <span className="text-[8px] opacity-70 animate-pulse italic">Parsing Architecture...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

function ProjectVisualizer() {
  const [projectFiles, setProjectFiles] = useState([]);
  const [activeFileContent, setActiveFileContent] = useState('// Click "OPEN PROJECT" to begin architectural analysis');
  const [activeFilePath, setActiveFilePath] = useState(null);
  const debouncedContent = useDebounce(activeFileContent, 500);
  
  const [isParsing, setIsParsing] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);

  // --- LOGIC HANDLERS ---
  const handleFolderOpen = async () => {
    try {
      console.log("Attempting to open directory picker...");
      // Check for browser support
      if (!window.showDirectoryPicker) {
        alert("Your browser does not support folder selection. Please use Chrome, Edge, or a modern desktop browser.");
        return;
      }
      
      const directoryHandle = await window.showDirectoryPicker();
      setIsParsing(true);
      
      const allFiles = await processDirectory(directoryHandle);
      console.log(`Successfully read ${allFiles.length} files.`);
      
      setProjectFiles(allFiles);

      if (allFiles.length > 0) {
        // Find a suitable entry file
        const entryFile = allFiles.find(f => 
          f.path.toLowerCase().includes('app.jsx') || 
          f.path.toLowerCase().includes('app.js') ||
          f.path.toLowerCase().includes('main.jsx') ||
          f.path.toLowerCase().includes('index.jsx')
        ) || allFiles[0];

        setActiveFileContent(entryFile.content);
        setActiveFilePath(entryFile.path);
      }
      setIsParsing(false);
    } catch (err) {
      console.error("Error opening folder:", err);
      setIsParsing(false);
      if (err.name !== 'AbortError') {
        alert("Failed to open project: " + err.message);
      }
    }
  };

  const handleFileClick = (file) => {
    setActiveFileContent(file.content);
    setActiveFilePath(file.path);
    setSelectedNode(null); // Reset analysis on file switch
  };

  // CORE ARCHITECTURE MAPPING (EFFECT)
  useEffect(() => {
    if (!activeFileContent || !activeFilePath) return;
    
    // Only visualize JS/JSX/TS/TSX
    if (!/\.(js|jsx|ts|tsx)$/.test(activeFilePath)) {
      setNodes([{ 
        id: 'msg', 
        type: 'custom', 
        data: { label: 'System Notice', subLabel: 'Visualization is optimized for React/JSX files.', color: '#f8fafc', order: 'i' }, 
        position: { x: 100, y: 100 } 
      }]);
      setEdges([]);
      return;
    }

    setIsParsing(true);
    try {
      const ast = babelParser.parse(activeFileContent, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
        errorRecovery: true,
      });

      const codeLines = activeFileContent.split('\n');
      const { nodes: n, edges: e } = walkJSXSimple(ast.program, null, 0, 0, [], [], { val: 1 }, { codeLines, components: {} });
      
      setNodes(n);
      setEdges(e);
    } catch (err) {
      setNodes([{ 
        id: 'err', 
        type: 'custom', 
        data: { label: 'Parsing Delay', subLabel: 'Ensure valid JSX syntax for full visualization.', color: '#fee2e2', order: '!' }, 
        position: { x: 100, y: 100 } 
      }]);
    }
    setIsParsing(false);
  }, [debouncedContent, activeFilePath, setNodes, setEdges]);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans text-sm">
      {/* Sidebar with Integrated File Switcher */}
      <div className="w-72 flex-shrink-0 border-r border-slate-800">
        <DashboardSidebar 
          onFolderOpen={handleFolderOpen} 
          isParsing={isParsing} 
          projectFiles={projectFiles}
          onFileClick={handleFileClick}
          activeFilePath={activeFilePath}
        />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Source Editor */}
        <ResizablePanel defaultSize={45} minSize={30} className="bg-white">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-slate-100 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Source</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-200/50 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                {activeFilePath || 'no-file-active'}
              </span>
            </div>
            <div className="flex-1">
              <CodeEditor 
                content={activeFileContent} 
                onContentChange={setActiveFileContent} 
                path={activeFilePath || 'editor.jsx'} 
                language="javascript" 
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-200" />

        {/* Component Graph */}
        <ResizablePanel defaultSize={55} minSize={30} className="relative bg-slate-50">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-slate-100 border-b flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architecture Graph</span>
            </div>
            <div className="flex-1 relative">
              <Visualizer 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onNodeClick={onNodeClick} 
              />

              {/* Insight Panel */}
              <div className={`absolute right-4 top-4 bottom-4 w-80 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl transition-all duration-500 transform ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'} flex flex-col overflow-hidden z-50`}>
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider">Analysis Node</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-800 rounded-full transition-colors">✕</button>
                </div>
                
                {selectedNode && (
                  <div className="p-6 flex-1 overflow-auto space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archetype</h4>
                      <p className="text-base font-bold text-slate-900 leading-tight">{selectedNode.data.label}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">Seq #{selectedNode.data.order}</span>
                        {selectedNode.data.lineno && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">Line {selectedNode.data.lineno}</span>}
                      </div>
                    </div>

                    {selectedNode.data.code && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Code</h4>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-x-auto shadow-inner">
                          {selectedNode.data.code}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Architectural Role</h4>
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <p className="text-xs text-indigo-900 leading-relaxed font-medium italic">"{selectedNode.data.subLabel}"</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">
                  Ready for deep mapping
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ProjectVisualizer;
