// src/pages/LiveCodePage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Code,
  TerminalSquare,
  Home,
  Loader2,
  Database,
  Bot,
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
import {
  walkDOM,
  walkBabelAST,
  walkJavaAST,
  walkPythonAST,
  walkJavaSimple,
  walkBabelSimple,
  walkPythonSimple,
} from "@/utils";

// --- CSS Imports ---
import "@xyflow/react/dist/style.css";

// --- Language Sidebar (Internal Component) ---
const LanguageSidebar = ({
  activeLang,
  onLangChange,
  viewMode,
  onViewModeChange,
}) => {
  const languages = [
    { id: "javascript", name: "JavaScript", icon: Code },
    { id: "html", name: "HTML", icon: TerminalSquare },
    { id: "python", name: "Python", icon: Bot },
    { id: "java", name: "Java", icon: Database },
  ];

  return (
    <div className="p-2 flex flex-col h-full">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <h3 className="text-lg font-semibold mb-2">Languages</h3>
      <div className="flex flex-col gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.id}
            variant={activeLang === lang.id ? "default" : "secondary"}
            onClick={(e) => {
              e.currentTarget.blur();
              onLangChange(lang.id);
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            tabIndex={-1}
            className="justify-start"
          >
            <lang.icon className="mr-2 h-4 w-4" />
            {lang.name}
          </Button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2 mt-6 pt-4 border-t">
        <Label htmlFor="view-mode">Simple View</Label>
        <Switch
          id="view-mode"
          checked={viewMode === "simple"}
          onCheckedChange={(checked) =>
            onViewModeChange(checked ? "simple" : "advanced")
          }
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
            }
          }}
        />
        <Label htmlFor="view-mode">Advanced</Label>
      </div>
    </div>
  );
};

// --- Main Page Component ---
function LiveCodePage() {
  // --- STATE MANAGEMENT ---
  const [code, setCode] = useState("// Select a language and start coding!");
  const [activeLanguage, setActiveLanguage] = useState("javascript");
  const [isParsing, setIsParsing] = useState(false);
  const [viewMode, setViewMode] = useState("simple");

  const debouncedCode = useDebounce(code, 500);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(() => {}, []);

  const pyodide = useRef(null);
  const editorRef = useRef(null);

  // Prevent spacebar from being captured globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "BUTTON" ||
            activeElement.getAttribute("role") === "switch")
        ) {
          e.preventDefault();
          e.stopPropagation();
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // --- PARSING LOGIC (EFFECT) ---
  useEffect(() => {
    const parseCode = async () => {
      if (!debouncedCode) {
        setNodes([]);
        setEdges([]);
        return;
      }
      setIsParsing(true);

      try {
        let nodes = [],
          edges = [];

        switch (activeLanguage) {
          case "javascript":
            const parser = await import("@babel/parser");
            const jsAst = parser.parse(debouncedCode, {
              sourceType: "module",
              plugins: ["jsx", "typescript"],
              errorRecovery: true,
            });

            if (viewMode === "simple") {
              ({ nodes, edges } = walkBabelSimple(
                jsAst.program,
                null,
                0,
                0,
                [],
                []
              ));
            } else {
              ({ nodes, edges } = walkBabelAST(
                jsAst.program,
                null,
                0,
                0,
                [],
                []
              ));
            }
            setNodes(nodes);
            setEdges(edges);
            break;

          case "html":
            const domParser = new DOMParser();
            const doc = domParser.parseFromString(debouncedCode, "text/html");
            const root = doc.documentElement || doc.body.firstElementChild;
            if (root) {
              ({ nodes, edges } = walkDOM(root, null, 0, 0, [], []));
              setNodes(nodes);
              setEdges(edges);
            }
            break;

          case "python":
            if (!pyodide.current) {
              setNodes([
                {
                  id: "loading",
                  data: { label: "Loading Python Environment..." },
                  position: { x: 100, y: 100 },
                },
              ]);
              pyodide.current = await window.loadPyodide();
            }
            await pyodide.current.runPythonAsync(`
              import ast
              import json
              def node_to_dict(node):
                  if isinstance(node, list): return [node_to_dict(n) for n in node]
                  if not isinstance(node, ast.AST): return node
                  d = {"_type": node.__class__.__name__}
                  if hasattr(node, '_fields'):
                      for field in node._fields:
                          if field not in ('ctx', 'lineno', 'col_offset', 'end_lineno', 'end_col_offset'):
                              val = getattr(node, field)
                              d[field] = node_to_dict(val)
                  return d
              def get_ast_json(code):
                  try:
                      tree = ast.parse(code)
                      return json.dumps(node_to_dict(tree))
                  except Exception as e:
                      return json.dumps({"error": str(e)})
              from pyodide.ffi import create_proxy
              create_proxy(get_ast_json)
            `);
            const get_ast_json = pyodide.current.globals.get("get_ast_json");
            const astJson = get_ast_json(debouncedCode);
            const pyAst = JSON.parse(astJson);
            if (pyAst.error) throw new Error(pyAst.error);

            if (viewMode === "simple") {
              ({ nodes, edges } = walkPythonSimple(pyAst, null, 0, 0, [], []));
            } else {
              ({ nodes, edges } = walkPythonAST(pyAst, null, 0, 0, [], []));
            }
            setNodes(nodes);
            setEdges(edges);
            break;

          case "java":
            const { parse } = await import("java-parser");
            const cst = parse(debouncedCode);

            if (viewMode === "simple") {
              ({ nodes, edges } = walkJavaSimple(cst, null, 0, 0, [], []));
            } else {
              ({ nodes, edges } = walkJavaAST(cst, null, 0, 0, [], []));
            }
            setNodes(nodes);
            setEdges(edges);
            break;

          default:
            setNodes([]);
            setEdges([]);
        }
      } catch (err) {
        console.error("Parsing Error:", err);
        setNodes([
          {
            id: "error",
            type: "output",
            data: { label: `Syntax Error: ${err.message}` },
            position: { x: 100, y: 100 },
          },
        ]);
        setEdges([]);
      }
      setIsParsing(false);
    };
    parseCode();
  }, [debouncedCode, activeLanguage, viewMode, setNodes, setEdges]);

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={15} minSize={10}>
          <LanguageSidebar
            activeLang={activeLanguage}
            onLangChange={(lang) => {
              setActiveLanguage(lang);
              setTimeout(() => {
                if (editorRef.current) {
                  editorRef.current.focus();
                }
              }, 100);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <CodeEditor
            content={code}
            onContentChange={setCode}
            path={activeLanguage}
            language={activeLanguage}
            editorRef={editorRef}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={35} minSize={30}>
          {isParsing && (
            <div className="absolute top-4 right-4 z-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
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

export default LiveCodePage;
