// src/pages/LiveCodePage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  Loader2,
  Bot,
  Layers,
  Search,
  ChevronRight,
  Info,
  Zap,
} from "lucide-react";

// --- Component Imports ---
import CodeEditor from "@/components/CodeEditor";
import Visualizer from "@/components/Visualizer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// --- Hook Imports ---
import { useDebounce } from "@/hooks/useDebounce";

// --- Util Imports ---
import { walkPythonAST, walkPythonSimple } from "@/utils";

// --- CSS Imports ---
import "@xyflow/react/dist/style.css";

const DashboardSidebar = ({ viewMode, onViewModeChange, isParsing }) => {
  return (
    <div className="p-4 flex flex-col h-full bg-slate-900 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">PyViz</h1>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Logic Engine
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Link to="/">
            <Home className="mr-3 h-4 w-4" /> Home
          </Link>
        </Button>
        <div className="pt-4 pb-2 px-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Visualization
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Python</span>
            {isParsing && (
              <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewModeChange("simple")}
              className={`text-[10px] py-2 rounded-md font-bold transition-all ${viewMode === "simple" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}
            >
              CONCEPTUAL
            </button>
            <button
              onClick={() => onViewModeChange("advanced")}
              className={`text-[10px] py-2 rounded-md font-bold transition-all ${viewMode === "advanced" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}
            >
              RAW AST
            </button>
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30 text-blue-400">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            Real-time sync active
          </span>
        </div>
      </div>
    </div>
  );
};

function LiveCodePage() {
  const [code, setCode] = useState(
    "# Visualize DSA logic here\n\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(5))",
  );
  const [activeLanguage] = useState("python");
  const [isParsing, setIsParsing] = useState(false);
  const [viewMode, setViewMode] = useState("simple");
  const [selectedNode, setSelectedNode] = useState(null);

  const debouncedCode = useDebounce(code, 500);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);

  const pyodide = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const parseCode = async () => {
      if (!debouncedCode) {
        setNodes([]);
        setEdges([]);
        return;
      }
      setIsParsing(true);
      try {
        let n = [],
          e = [];
        if (!pyodide.current) {
          pyodide.current = await window.loadPyodide();
        }
        await pyodide.current.runPythonAsync(`
              import ast, json
              def node_to_dict(node):
                  if isinstance(node, list): return [node_to_dict(n) for n in node]
                  if not isinstance(node, ast.AST): return node
                  d = {"_type": node.__class__.__name__}
                  # Include coordinates for source mapping
                  for attr in ('lineno', 'col_offset', 'end_lineno', 'end_col_offset'):
                      if hasattr(node, attr):
                          d[attr] = getattr(node, attr)
                  for field in node._fields:
                      if field not in ('ctx', 'lineno', 'col_offset', 'end_lineno', 'end_col_offset'):
                          d[field] = node_to_dict(getattr(node, field))
                  return d
              def get_ast_json(code):
                  try: return json.dumps(node_to_dict(ast.parse(code)))
                  except Exception as ex: return json.dumps({"error": str(ex)})
            `);
        const get_ast_json = pyodide.current.globals.get("get_ast_json");
        const pyAst = JSON.parse(get_ast_json(debouncedCode));
        if (pyAst.error) throw new Error(pyAst.error);

        const codeLines = debouncedCode.split('\n');

        if (viewMode === "simple") {
          ({ nodes: n, edges: e } = walkPythonSimple(
            pyAst,
            null,
            0,
            0,
            [],
            [],
            { val: 1 },
            { funcName: null, classes: {}, codeLines }
          ));
        } else {
          ({ nodes: n, edges: e } = walkPythonAST(pyAst, null, 0, 0, [], [], {
            val: 1,
          }));
        }
        setNodes(n);
        setEdges(e);
      } catch (err) {
        setNodes([
          {
            id: "error",
            type: "custom",
            data: {
              label: "Syntax Error",
              subLabel: err.message,
              color: "#fee2e2",
              order: "!",
            },
            position: { x: 100, y: 100 },
          },
        ]);
        setEdges([]);
      }
      setIsParsing(false);
    };
    parseCode();
  }, [debouncedCode, viewMode, setNodes, setEdges]);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <DashboardSidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isParsing={isParsing}
        />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={45} minSize={30} className="bg-white">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-slate-100 border-b flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> Logic Editor
              </span>
            </div>
            <div className="flex-1">
              <CodeEditor
                content={code}
                onContentChange={setCode}
                path="logic.py"
                language="python"
                editorRef={editorRef}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-200" />

        <ResizablePanel defaultSize={55} minSize={30} className="relative">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-slate-100 border-b flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Search className="w-3 h-3" /> Visualization Graph
              </span>
            </div>
            <div className="flex-1 relative">
              <Visualizer
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
              />

              {/* Enhanced Insight Panel */}
              <div
                className={`absolute right-4 top-4 bottom-4 w-72 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl transition-all duration-300 transform ${selectedNode ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"} flex flex-col overflow-hidden z-50`}
              >
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Node Insights
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {selectedNode && (
                  <div className="p-5 flex-1 overflow-auto space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Concept
                      </h4>
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {selectedNode.data.label}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold uppercase">
                          Sequence #{selectedNode.data.order}
                        </span>
                        {selectedNode.data.lineno && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase">
                            Line {selectedNode.data.lineno}
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedNode.data.lineno && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Source Snippet
                        </h4>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[10px] text-slate-700 overflow-x-auto">
                          <span className="text-slate-400 mr-2">
                            {selectedNode.data.lineno} |
                          </span>
                          {code
                            .split("\n")
                            [selectedNode.data.lineno - 1]?.trim() ||
                            "No source found"}
                        </div>
                      </div>
                    )}

                    {selectedNode.data.subLabel && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Execution Role
                        </h4>
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          {selectedNode.data.subLabel}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Technical Data
                      </h4>
                      <div className="space-y-2">
                        {selectedNode.data.raw ? (
                          Object.entries(selectedNode.data.raw).map(
                            ([key, val]) =>
                              key !== "_type" &&
                              ![
                                "lineno",
                                "col_offset",
                                "end_lineno",
                                "end_col_offset",
                              ].includes(key) &&
                              typeof val !== "object" &&
                              val !== null && (
                                <div
                                  key={key}
                                  className="flex justify-between items-center py-1.5 border-b border-slate-50"
                                >
                                  <span className="text-[10px] text-slate-400 font-mono lowercase">
                                    {key}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                                    {String(val)}
                                  </span>
                                </div>
                              ),
                          )
                        ) : (
                          <div className="text-[10px] text-red-500 font-bold italic">
                            No raw AST data available.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <p className="text-[9px] text-slate-400 text-center font-medium">
                    Click outside this panel or use the ✕ to close.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default LiveCodePage;
