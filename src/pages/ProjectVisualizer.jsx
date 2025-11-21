// src/pages/ProjectVisualizer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as babelTypes from "@babel/types";
import * as csstree from "css-tree";
import path from "path-browserify";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

// --- Component Imports ---
import LoadingScreen from "@/components/LoadingScreen";
import ReadmeModal from "@/components/ReadmeModal";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import Visualizer from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import useAutoSaveIndexed from "@/hooks/useAutoSaveIndexed";

// --- Hook Imports ---
import { useDebounce } from "@/hooks/useDebounce";

// --- Util Imports (NOW INCLUDES WALKERS) ---
import {
  processDirectory,
  resolveImportPath,
  buildFileTree,
  generateFeatureBullets,
  walkDOM,
  walkBabelAST,
} from "@/utils";

import "@xyflow/react/dist/style.css";

function ProjectVisualizer() {
  // --- STATE MANAGEMENT ---
  const [projectFiles, setProjectFiles] = useState([]);
  const [activeFileContent, setActiveFileContent] = useState(
    '// Click "Open Folder" to start'
  );

  // State for live project editing
  const [activeFilePath, setActiveFilePath] = useState(null);
  const debouncedContent = useDebounce(activeFileContent, 500);
  const [graphableFiles, setGraphableFiles] = useState([]);

  // State for UI
  const [showReadme, setShowReadme] = useState(false);
  const [readmeContent, setReadmeContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState("javascript");

  // State for React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [showHistory, setShowHistory] = useState(false);
  const {
    saveSnapshot,
    historyEntries,
    restoreSnapshot,
    isReady: historyReady,
  } = useAutoSaveIndexed();

  // Responsive flags
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [mobileTab, setMobileTab] = useState("explorer"); // explorer | editor | visualizer

  // Effect 1: Load last session on startup
  useEffect(() => {
    if (!historyReady) return;

    // Optional: Only restore if the user hasn't opened a project yet
    if (projectFiles.length === 0 && historyEntries.length > 0) {
      const last = historyEntries[0];
      if (last) setActiveFileContent(last.code);
    }
  }, [historyReady, historyEntries, projectFiles.length]);

  // Effect 2: Auto-save every time editor changes
  useEffect(() => {
    if (
      activeFileContent &&
      activeFileContent !== '// Click "Open Folder" to start'
    ) {
      saveSnapshot(activeFileContent);
    }
  }, [activeFileContent, saveSnapshot]);

  // watch resize
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileTab("explorer");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- LOGIC HANDLERS ---
  const handleFolderOpen = async () => {
    try {
      setIsLoading(true);
      const directoryHandle = await window.showDirectoryPicker();
      const allFiles = await processDirectory(directoryHandle);
      setProjectFiles(allFiles);
      const entryFile = allFiles.find(
        (f) => f.path.endsWith("index.js") || f.path.endsWith("App.js")
      );
      let fileToOpen;
      if (entryFile) fileToOpen = entryFile;
      else if (allFiles.length > 0) fileToOpen = allFiles[0];
      if (fileToOpen) {
        setActiveFileContent(fileToOpen.content);
        setActiveFilePath(fileToOpen.path);
        if (fileToOpen.path.endsWith(".css")) setEditorLanguage("css");
        else if (fileToOpen.path.endsWith(".html")) setEditorLanguage("html");
        else setEditorLanguage("javascript");
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error opening folder (or user cancelled):", err);
      setIsLoading(false);
    }
  };

  const handleFileClick = (file) => {
    setActiveFileContent(file.content);
    setActiveFilePath(file.path);
    if (file.path.endsWith(".css")) setEditorLanguage("css");
    else if (file.path.endsWith(".html")) setEditorLanguage("html");
    else setEditorLanguage("javascript");
    // on mobile, switch to editor automatically for a smoother experience
    if (isMobile) setMobileTab("editor");
  };

  const handleGenerateReadme = () => {
    const fileTree = buildFileTree(projectFiles);
    const mdContent = `
# Project Structure

\`\`\`
${fileTree}
\`\`\`

---
*Generated by CodeFlow IDE*
`;
    setReadmeContent(mdContent);
    setShowReadme(true);
  };

  // CORE LOGIC: Build nodes/edges from project files
  useEffect(() => {
    setGraphableFiles(projectFiles);
  }, [projectFiles]);

  useEffect(() => {
    if (activeFilePath) {
      setGraphableFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.path === activeFilePath
            ? { ...file, content: debouncedContent }
            : file
        )
      );
    }
  }, [debouncedContent, activeFilePath]);

  useEffect(() => {
    if (graphableFiles.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const allFilePaths = graphableFiles.map((f) => f.path);
    const newNodes = [];
    const newEdges = [];
    graphableFiles.forEach((file, i) => {
      newNodes.push({
        id: file.path,
        data: { label: path.basename(file.path) },
        position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 100 },
      });
    });
    graphableFiles.forEach((file) => {
      if (!/\.(js|jsx|ts|tsx)$/.test(file.path)) return;
      try {
        const ast = babelParser.parse(file.content, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
          errorRecovery: true,
        });
        traverse(ast, {
          ImportDeclaration({ node }) {
            const importPath = node.source.value;
            const resolvedPath = resolveImportPath(
              file.path,
              importPath,
              allFilePaths
            );
            if (resolvedPath && allFilePaths.includes(resolvedPath)) {
              newEdges.push({
                id: `e-${file.path}-to-${resolvedPath}`,
                source: resolvedPath,
                target: file.path,
                animated: true,
              });
            } else if (resolvedPath) {
              if (!newNodes.find((n) => n.id === resolvedPath)) {
                newNodes.push({
                  id: resolvedPath,
                  data: { label: resolvedPath },
                  position: {
                    x: Math.random() * 500,
                    y: Math.random() * 500 + 400,
                  },
                  style: { background: "#fdd", borderColor: "#f00" },
                });
              }
              newEdges.push({
                id: `e-${file.path}-to-${resolvedPath}`,
                source: resolvedPath,
                target: file.path,
                label: "external",
              });
            }
          },
        });
      } catch (err) {
        console.error(`Could not parse ${file.path}: ${err.message}`);
      }
    });
    setNodes(newNodes);
    setEdges(newEdges);
  }, [graphableFiles, setNodes, setEdges]);

  // Mobile top tab component
  const MobileTabs = ({ current, onChange }) => (
    <div className="fixed top-0 left-0 right-0 z-20 bg-card px-2 py-1 flex gap-1 border-b">
      <button
        className={`flex-1 py-2 rounded ${
          current === "explorer" ? "bg-muted" : ""
        }`}
        onClick={() => onChange("explorer")}
      >
        Explorer
      </button>
      <button
        className={`flex-1 py-2 rounded ${
          current === "editor" ? "bg-muted" : ""
        }`}
        onClick={() => onChange("editor")}
      >
        Editor
      </button>
      <button
        className={`flex-1 py-2 rounded ${
          current === "visualizer" ? "bg-muted" : ""
        }`}
        onClick={() => onChange("visualizer")}
      >
        Visualizer
      </button>
    </div>
  );

  // Render
  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-background text-foreground relative">
        {isLoading && <LoadingScreen />}

        {showReadme && (
          <ReadmeModal
            content={readmeContent}
            onClose={() => setShowReadme(false)}
          />
        )}

        <MobileTabs current={mobileTab} onChange={setMobileTab} />
        <div className="h-full pt-12">
          {" "}
          {/* offset for fixed tabs */}
          {mobileTab === "explorer" && (
            <div className="h-full overflow-auto p-2">
              {/* Back to home - visible and separate on mobile */}
              <div className="mb-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" /> Back to Home
                  </Link>
                </Button>
              </div>

              {/* Hide duplicate action buttons on small screens — top header already provides them */}
              {!isMobile && (
                <div className="mb-2">
                  <Button onClick={handleFolderOpen} size="sm" className="mr-2">
                    Open Folder
                  </Button>
                  <Button
                    onClick={handleGenerateReadme}
                    size="sm"
                    disabled={projectFiles.length === 0}
                  >
                    Gen. File Stru.
                  </Button>
                </div>
              )}

              <FileExplorer
                projectFiles={projectFiles}
                onFolderOpen={handleFolderOpen}
                onReadmeGen={handleGenerateReadme}
                onFileClick={handleFileClick}
                isDisabled={projectFiles.length === 0}
              />
            </div>
          )}
          {mobileTab === "editor" && (
            <div className="h-full">
              <CodeEditor
                content={activeFileContent}
                onContentChange={setActiveFileContent}
                path={activeFilePath}
                language={editorLanguage}
              />
            </div>
          )}
          {mobileTab === "visualizer" && (
            <div className="h-full">
              <Visualizer
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop / Tablet original resizable layout
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      {isLoading && <LoadingScreen />}

      {showReadme && (
        <ReadmeModal
          content={readmeContent}
          onClose={() => setShowReadme(false)}
        />
      )}

      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="p-2 flex flex-col h-full min-h-0">
            <Button asChild variant="outline" size="sm" className="mb-2">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <FileExplorer
              projectFiles={projectFiles}
              onFolderOpen={handleFolderOpen}
              onReadmeGen={handleGenerateReadme}
              onFileClick={handleFileClick}
              isDisabled={projectFiles.length === 0}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40} minSize={30}>
          <CodeEditor
            content={activeFileContent}
            onContentChange={setActiveFileContent}
            path={activeFilePath}
            language={editorLanguage}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40} minSize={30}>
          <Visualizer
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ProjectVisualizer;
