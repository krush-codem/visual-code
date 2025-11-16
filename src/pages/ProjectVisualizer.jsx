// src/pages/ProjectVisualizer.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";

// --- Core Parsers ---
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as babelTypes from "@babel/types";
import * as csstree from "css-tree";
import path from "path-browserify";

// --- CORRECTED IMPORTS (using @ alias) ---
import LoadingScreen from "@/components/LoadingScreen";
import ReadmeModal from "@/components/ReadmeModal";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import Visualizer from "@/components/Visualizer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  processDirectory,
  resolveImportPath,
  buildFileTree,
  generateFeatureBullets,
} from "@/utils/utils";
// ----------------------------------------

// --- CSS Imports ---
import "@xyflow/react/dist/style.css";

// ... (rest of your file)

function ProjectVisualizer() {
  // --- STATE MANAGEMENT ---
  const [projectFiles, setProjectFiles] = useState([]);
  const [activeFileContent, setActiveFileContent] = useState(
    "// Type JS to see dependencies, or type HTML/CSS to see the AST."
  );

  // State for live project editing
  const [activeFilePath, setActiveFilePath] = useState(null);
  const debouncedContent = useDebounce(activeFileContent, 500);
  const [graphableFiles, setGraphableFiles] = useState([]);

  // State for UI
  const [showReadme, setShowReadme] = useState(false);
  const [readmeContent, setReadmeContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState("javascript"); // <-- NEW STATE

  // State for React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // --- LOGIC HANDLERS ---

  const handleFolderOpen = async () => {
    try {
      setIsLoading(true);
      const directoryHandle = await window.showDirectoryPicker();
      const allFiles = await processDirectory(directoryHandle); // from utils

      setProjectFiles(allFiles);

      const entryFile = allFiles.find(
        (f) => f.path.endsWith("index.js") || f.path.endsWith("App.js")
      );
      let fileToOpen;

      if (entryFile) {
        fileToOpen = entryFile;
      } else if (allFiles.length > 0) {
        fileToOpen = allFiles[0];
      }

      if (fileToOpen) {
        setActiveFileContent(fileToOpen.content);
        setActiveFilePath(fileToOpen.path); // Set active file
        // Set language based on file
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
    setActiveFilePath(file.path); // Set active file

    // Set language based on file
    if (file.path.endsWith(".css")) {
      setEditorLanguage("css");
    } else if (file.path.endsWith(".html")) {
      setEditorLanguage("html");
    } else {
      setEditorLanguage("javascript");
    }
  };

  const handleGenerateReadme = () => {
    const pkgFile = projectFiles.find((f) => f.path.endsWith("package.json"));
    if (!pkgFile) {
      alert("Could not find package.json in the project.");
      return;
    }
    try {
      const pkg = JSON.parse(pkgFile.content);
      let projectName = pkg.name || "My Project";
      let description =
        pkg.description ||
        "A description of the project. (Update this in your package.json!)";

      let installation = `\`\`\`bash\nnpm install\n\`\`\``;
      const scripts = pkg.scripts
        ? Object.entries(pkg.scripts)
            .map(
              ([name, command]) => `- \`npm run ${name}\`: Runs \`${command}\``
            )
            .join("\n")
        : "*No scripts found.*";
      let usage = `To run this project, use the following scripts:\n\n${scripts}`;
      const deps = pkg.dependencies
        ? Object.keys(pkg.dependencies)
            .map((d) => `- \`${d}\``)
            .join("\n")
        : "*None*";
      let dependencies = `### Dependencies\n${deps}\n\n`;
      const devDeps = pkg.devDependencies
        ? Object.keys(pkg.devDependencies)
            .map((d) => `- \`${d}\``)
            .join("\n")
        : "";
      if (devDeps) {
        dependencies += `### Dev Dependencies\n${devDeps}`;
      }

      const featureBullets = generateFeatureBullets(pkg, projectFiles); // from utils
      const fileTree = buildFileTree(projectFiles); // from utils

      const mdContent = `
# ${projectName}
${description}
## ✨ Key Features
${featureBullets}
## 🚀 Installation
${installation}
## Usage
${usage}
## 📂 Project Structure
\`\`\`
${fileTree}
\`\`\`
## External Dependencies
${dependencies}
## 🤝 Contributing
Contributions are welcome!
## 📄 License
*This project is not licensed.*
## 📞 Contact
*your-email@example.com*
---
*This README was auto-generated by CodeFlow IDE.*
`;

      setReadmeContent(mdContent);
      setShowReadme(true);
    } catch (err) {
      alert("Failed to parse package.json: " + err.message);
    }
  };

  // --- CORE LOGIC (EFFECTS) ---

  // EFFECT 1: (Project Mode) When a new folder is opened, set the base graph state
  useEffect(() => {
    setGraphableFiles(projectFiles);
  }, [projectFiles]);

  // EFFECT 2: (Live Editing Mode) When the user stops typing, update the *one* file
  // they are editing in the graphable state.
  useEffect(() => {
    if (activeFilePath) {
      setGraphableFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.path === activeFilePath
            ? { ...file, content: debouncedContent } // Use the new debounced content
            : file
        )
      );
    }
  }, [debouncedContent, activeFilePath]);

  // EFFECT 3: (Project Graph Builder) This runs whenever 'graphableFiles' changes
  // (either from opening a folder OR live-editing)
  useEffect(() => {
    // If no project is open, clear the graph and stop.
    // This lets Effect 4 (Scratchpad) take over.
    if (graphableFiles.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // --- This is the full Project Parsing Logic ---
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
      // We only build the dependency graph for JS files
      if (!/\.(js|jsx|ts|tsx)$/.test(file.path)) {
        return;
      }
      try {
        const ast = babelParser.parse(file.content, {
          // Reads live or static content
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
  }, [graphableFiles, setNodes, setEdges]); // Runs when graphableFiles changes

  // EFFECT 4: (Scratchpad Mode) This runs ONLY when no folder is open.
  useEffect(() => {
    // If a project IS open, do nothing.
    if (projectFiles.length > 0) {
      return;
    }

    // --- Define helpers for this effect ---
    let nodeIdCounter = 0;
    const newNodes = [];
    const newEdges = [];

    // HELPER 1: Walk HTML DOM Tree
    function walkDOM(domNode, parentId, level = 0, siblingIndex = 0) {
      if (domNode.nodeType !== Node.ELEMENT_NODE) return;
      const currentId = `dom-${nodeIdCounter++}`;
      const label = domNode.tagName.toLowerCase();
      newNodes.push({
        id: currentId,
        data: { label: `<${label}>` },
        position: { x: siblingIndex * 170, y: level * 100 },
        type: level === 0 ? "input" : "default",
      });
      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-to-${currentId}`,
          source: parentId,
          target: currentId,
        });
      }
      Array.from(domNode.children).forEach((child, i) => {
        walkDOM(child, currentId, level + 1, i);
      });
    }

    // HELPER 2: Walk CSS AST
    function walkCSSTree(cssNode, parentId, level = 0, siblingIndex = 0) {
      const currentId = `css-${nodeIdCounter++}`;
      let label = cssNode.type;

      try {
        if (cssNode.type === "Selector") {
          label = `Selector: ${csstree.generate(cssNode)}`;
        } else if (cssNode.type === "Declaration") {
          label = `Declaration: ${cssNode.property}: ...`;
        }
      } catch (e) {
        /* ignore generator errors for incomplete code */
      }

      newNodes.push({
        id: currentId,
        data: { label: label },
        position: { x: siblingIndex * 200, y: level * 100 },
        type: level === 0 ? "input" : "default",
      });
      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-to-${currentId}`,
          source: parentId,
          target: currentId,
        });
      }

      csstree.walk(cssNode, {
        enter: (childNode, item, list) => {
          if (childNode === cssNode) return;
          const i = list ? list.indexOf(item) : 0;
          walkCSSTree(childNode, currentId, level + 1, i);
          return csstree.walk.skip; // Stop this walker, recurse manually
        },
      });
    }

    // HELPER 3: Walk JavaScript AST
    function walkBabelAST(babelNode, parentId, level = 0, siblingIndex = 0) {
      if (!babelNode || !babelNode.type) return;

      const currentId = `js-${nodeIdCounter++}`;
      let label = babelNode.type;

      if (babelNode.type === "Identifier") {
        label = `Identifier: ${babelNode.name}`;
      } else if (
        babelNode.type === "NumericLiteral" ||
        babelNode.type === "StringLiteral"
      ) {
        label = `${babelNode.type}: ${babelNode.value}`;
      }

      newNodes.push({
        id: currentId,
        data: { label: label },
        position: { x: siblingIndex * 220, y: level * 100 },
        type: level === 0 ? "input" : "default",
      });
      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-to-${currentId}`,
          source: parentId,
          target: currentId,
        });
      }

      const visitorKeys = babelTypes.VISITOR_KEYS[babelNode.type];
      if (!visitorKeys) return;

      let childIndex = 0;
      visitorKeys.forEach((key) => {
        const child = babelNode[key];
        if (Array.isArray(child)) {
          child.forEach((subChild) => {
            walkBabelAST(subChild, currentId, level + 1, childIndex++);
          });
        } else if (typeof child === "object" && child !== null) {
          walkBabelAST(child, currentId, level + 1, childIndex++);
        }
      });
    }

    // --- Main Parsing Logic for Scratchpad ---
    try {
      const trimmedCode = debouncedContent.trim();

      if (trimmedCode.length === 0) {
        // --- 1. EMPTY CODE ---
        setNodes([]);
        setEdges([]);
        setEditorLanguage("javascript"); // Default
      } else if (trimmedCode.startsWith("<") && trimmedCode.endsWith(">")) {
        // --- 2. HTML MODE ---
        setEditorLanguage("html"); // <-- SET LANGUAGE
        const parser = new DOMParser();
        const doc = parser.parseFromString(debouncedContent, "text/html");
        const rootElement = doc.documentElement || doc.body.firstElementChild;
        if (rootElement) {
          walkDOM(rootElement, null, 0, 0);
        }
        setNodes(newNodes);
        setEdges(newEdges);
      } else {
        // --- 3. JS or CSS MODE ---
        try {
          // --- TRY JAVASCRIPT ---
          setEditorLanguage("javascript"); // <-- SET LANGUAGE
          const ast = babelParser.parse(debouncedContent, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
            errorRecovery: true, // Be tolerant of syntax errors
          });
          walkBabelAST(ast.program, null, 0, 0); // Walk the full JS tree
          setNodes(newNodes);
          setEdges(newEdges);
        } catch (jsError) {
          // It's not valid JS, so let's try CSS
          try {
            // --- TRY CSS ---
            setEditorLanguage("css"); // <-- SET LANGUAGE
            const ast = csstree.parse(debouncedContent, {
              onParseError: (error) => {
                /* Suppress console errors */
              },
            });
            walkCSSTree(ast, null, 0, 0); // Walk the full CSS tree
            setNodes(newNodes);
            setEdges(newEdges);
          } catch (cssError) {
            // It's not valid JS or CSS. Show an error.
            console.error("Syntax Error:", cssError.message);
            setEditorLanguage("plaintext");
            setNodes([
              {
                id: "error",
                type: "output",
                data: { label: `Syntax Error` },
                position: { x: 100, y: 100 },
              },
            ]);
            setEdges([]);
          }
        }
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error("Parser Error:", error.message);
      setEditorLanguage("plaintext");
      setNodes([
        {
          id: "error",
          type: "output",
          data: { label: "Syntax Error" },
          position: { x: 100, y: 100 },
        },
      ]);
      setEdges([]);
    }
  }, [debouncedContent, projectFiles, setNodes, setEdges]); // Runs when you type in scratchpad mode

  // --- RENDER (JSX) ---
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
        {/* Panel 1: File Explorer */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileExplorer
            projectFiles={projectFiles}
            onFolderOpen={handleFolderOpen}
            onReadmeGen={handleGenerateReadme}
            onFileClick={handleFileClick}
            isDisabled={projectFiles.length === 0}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Panel 2: Code Editor */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <CodeEditor
            content={activeFileContent}
            onContentChange={setActiveFileContent}
            path={activeFilePath}
            language={editorLanguage} // <-- Pass the dynamic language
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Panel 3: Visualizer */}
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
