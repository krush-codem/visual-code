// src/pages/ProjectVisualizer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import * as babelParser from "@babel/parser";
import path from "path-browserify";
import { Link } from "react-router-dom";
import { Home, FolderOpen, FileCode, Layers, Search, Info, Zap, Loader2, FileText, ChevronDown, X } from "lucide-react";

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

const DashboardSidebar = ({ onFolderOpen, isParsing, projectFiles, onFileClick, activeFilePath, isMobile }) => {
  const [showFiles, setShowFiles] = useState(true);

  return (
    <div className={`p-4 flex flex-col h-full bg-slate-900 text-slate-100 shadow-xl overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
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
            <div className="flex items-center justify-between px-2 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Project Files
              <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full">{projectFiles.length}</span>
            </div>
            
            <div className="mt-2 flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {projectFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onFileClick(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all ${
                    activeFilePath === file.path 
                      ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${activeFilePath === file.path ? 'text-white' : 'text-indigo-500/50'}`} />
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
            <span className="text-[10px] font-bold uppercase tracking-tight">Active Sync</span>
            {isParsing && <span className="text-[8px] opacity-70 animate-pulse italic">Mapping Components...</span>}
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

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);
  const [mobileTab, setMobileTab] = useState("editor"); // options | editor | visualizer

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- LOGIC HANDLERS ---
  const handleFolderOpen = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert("Please use Chrome or Edge for folder access.");
        return;
      }
      const directoryHandle = await window.showDirectoryPicker();
      setIsParsing(true);
      const allFiles = await processDirectory(directoryHandle);
      setProjectFiles(allFiles);

      if (allFiles.length > 0) {
        const entryFile = allFiles.find(f => /\b(app|main|index)\.(jsx|js)$/i.test(f.path)) || allFiles[0];
        setActiveFileContent(entryFile.content);
        setActiveFilePath(entryFile.path);
      }
      setIsParsing(false);
    } catch (err) {
      setIsParsing(false);
      if (err.name !== 'AbortError') alert("Error: " + err.message);
    }
  };

  const handleFileClick = (file) => {
    setActiveFileContent(file.content);
    setActiveFilePath(file.path);
    setSelectedNode(null);
    if (isMobile) setMobileTab("editor");
  };

  useEffect(() => {
    if (!activeFileContent || !activeFilePath) return;
    if (!/\.(js|jsx|ts|tsx)$/.test(activeFilePath)) {
      setNodes([{ id: 'msg', type: 'custom', data: { label: 'System Notice', subLabel: 'JSX Optimization Active', color: '#f8fafc', order: 'i' }, position: { x: 100, y: 100 } }]);
      setEdges([]);
      return;
    }

    setIsParsing(true);
    try {
      const ast = babelParser.parse(activeFileContent, { sourceType: "module", plugins: ["jsx", "typescript"], errorRecovery: true });
      const codeLines = activeFileContent.split('\n');
      const { nodes: n, edges: e } = walkJSXSimple(ast.program, null, 0, 0, [], [], { val: 1 }, { codeLines, components: {} });
      setNodes(n);
      setEdges(e);
    } catch (err) {
      setNodes([{ id: 'err', type: 'custom', data: { label: 'Parsing Delay', subLabel: 'Validating JSX...', color: '#fee2e2', order: '!' }, position: { x: 100, y: 100 } }]);
    }
    setIsParsing(false);
  }, [debouncedContent, activeFilePath, setNodes, setEdges]);

  const MobileTabs = ({ current, onChange }) => (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900 px-2 py-1 flex gap-1 border-b border-slate-800 shadow-2xl">
      {["options", "editor", "visualizer"].map(tab => (
        <button
          key={tab}
          className={`flex-1 py-3 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${current === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-500 hover:text-slate-300"}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-slate-50 text-slate-900 relative overflow-hidden">
        <MobileTabs current={mobileTab} onChange={setMobileTab} />
        <div className="h-full pt-14">
          {mobileTab === "options" && <DashboardSidebar onFolderOpen={handleFolderOpen} isParsing={isParsing} projectFiles={projectFiles} onFileClick={handleFileClick} activeFilePath={activeFilePath} isMobile />}
          {mobileTab === "editor" && <div className="h-full"><CodeEditor content={activeFileContent} onContentChange={setActiveFileContent} path={activeFilePath || 'editor.jsx'} language="javascript" /></div>}
          {mobileTab === "visualizer" && (
            <div className="h-full relative">
              <Visualizer nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} />
              <div className={`absolute inset-x-4 bottom-4 h-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-[70] transition-all duration-500 transform ${selectedNode ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} flex flex-col overflow-hidden`}>
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2"><Info className="w-4 h-4 text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-widest">Component Analysis</span></div>
                  <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
                {selectedNode && (
                  <div className="p-6 overflow-auto flex-1 space-y-6">
                    <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archetype</h4><p className="text-base font-bold text-slate-900 leading-tight">{selectedNode.data.label}</p></div>
                    {selectedNode.data.code && <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Source</h4><div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-x-auto shadow-inner">{selectedNode.data.code}</div></div>}
                    <div className="pt-4 border-t border-slate-100"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logical Role</h4><div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100"><p className="text-xs text-indigo-900 font-medium italic">"{selectedNode.data.subLabel || 'React Logic Node'}"</p></div></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      <div className="w-72 flex-shrink-0 border-r border-slate-800">
        <DashboardSidebar onFolderOpen={handleFolderOpen} isParsing={isParsing} projectFiles={projectFiles} onFileClick={handleFileClick} activeFilePath={activeFilePath} />
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={45} minSize={30} className="bg-white">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-slate-100 border-b flex items-center justify-between">
              <div className="flex items-center gap-2"><FileCode className="w-4 h-4 text-indigo-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Source</span></div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-200/50 px-2 py-0.5 rounded-full truncate max-w-[200px]">{activeFilePath || 'no-file-active'}</span>
            </div>
            <div className="flex-1"><CodeEditor content={activeFileContent} onContentChange={setActiveFileContent} path={activeFilePath || 'editor.jsx'} language="javascript" /></div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-slate-200" />
        <ResizablePanel defaultSize={55} minSize={30} className="relative">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-slate-100 border-b flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architecture Graph</span></div>
            <div className="flex-1 relative">
              <Visualizer nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} />
              <div className={`absolute right-4 top-4 bottom-4 w-80 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl transition-all duration-500 transform ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'} flex flex-col overflow-hidden z-50`}>
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2"><Info className="w-4 h-4 text-indigo-400" /><span className="text-xs font-black uppercase tracking-wider">Analysis Node</span></div>
                  <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
                {selectedNode && (
                  <div className="p-6 flex-1 overflow-auto space-y-6">
                    <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archetype</h4><p className="text-base font-bold text-slate-900 leading-tight">{selectedNode.data.label}</p><div className="flex gap-2 mt-3"><span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">Seq #{selectedNode.data.order}</span>{selectedNode.data.lineno && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">Line {selectedNode.data.lineno}</span>}</div></div>
                    {selectedNode.data.code && <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Code</h4><div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-x-auto shadow-inner">{selectedNode.data.code}</div></div>}
                    <div className="pt-4 border-t border-slate-100"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Architectural Role</h4><div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100"><p className="text-xs text-indigo-900 font-medium italic">"{selectedNode.data.subLabel}"</p></div></div>
                  </div>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">ReactArchitect Ready</div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ProjectVisualizer;
