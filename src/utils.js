// src/utils.js
import path from "path-browserify";

// --- IGNORE PATTERNS ---
const IGNORE_PATTERNS = [
  "node_modules", ".git", ".DS_Store", "dist", "build", ".env", "package-lock.json", "yarn.lock", "__pycache__", ".vscode",
];

export async function processDirectory(directoryHandle, path = "") {
  const files = [];
  for await (const entry of directoryHandle.values()) {
    if (IGNORE_PATTERNS.includes(entry.name)) continue;
    const newPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.kind === "file") {
      const file = await entry.getFile();
      if (file.size > 1000000) continue;
      const content = await file.text();
      files.push({ path: newPath, content });
    } else if (entry.kind === "directory") {
      const subFiles = await processDirectory(entry, newPath);
      files.push(...subFiles);
    }
  }
  return files;
}

export function resolveImportPath(currentFilePath, importPath, allFilePaths) {
  if (!importPath.startsWith(".")) return importPath;
  const currentFileDir = path.dirname(currentFilePath);
  let resolvedPath = path.resolve(currentFileDir, importPath);
  if (allFilePaths.includes(resolvedPath)) return resolvedPath;
  const extensions = [".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.jsx"];
  for (const ext of extensions) {
    if (allFilePaths.includes(resolvedPath + ext)) return resolvedPath + ext;
  }
  return null;
}

export function buildFileTree(projectFiles) {
  const filteredPaths = projectFiles.map((f) => f.path).filter((path) => !IGNORE_PATTERNS.some((pattern) => path.includes(pattern))).sort();
  const tree = {};
  filteredPaths.forEach((path) => {
    let currentLevel = tree;
    path.split("/").forEach((part) => {
      if (!currentLevel[part]) currentLevel[part] = {};
      currentLevel = currentLevel[part];
    });
  });
  function drawTree(obj, prefix = "") {
    let output = "";
    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      output += prefix + connector + key + "\n";
      if (Object.keys(value).length > 0) output += drawTree(value, newPrefix);
    });
    return output;
  }
  return ".\n" + drawTree(tree);
}

// --- PYTHON AST WALKERS ---

export function walkPythonAST(pyNode, parentId, level = 0, siblingIndex = 0, nodes = [], edges = [], counter = { val: 1 }, context = { codeLines: [] }) {
  if (!pyNode || !pyNode._type) return { nodes, edges };
  const currentId = `py-${nodes.length}`;
  let label = pyNode._type;
  if (pyNode._type === "Name") label = `ID: ${pyNode.id}`;
  else if (pyNode._type === "Constant") label = `Value: ${pyNode.value}`;
  else if (pyNode.name) label = `${pyNode._type}: ${pyNode.name}`;
  const sourceSnippet = pyNode.lineno ? context.codeLines[pyNode.lineno - 1]?.trim() : null;
  nodes.push({ id: currentId, data: { label, order: counter.val++, type: pyNode._type, raw: pyNode, code: sourceSnippet, lineno: pyNode.lineno }, position: { x: siblingIndex * 220, y: level * 100 }, type: "custom" });
  if (parentId) edges.push({ id: `e-${parentId}-to-${currentId}`, source: parentId, target: currentId });
  Object.keys(pyNode).forEach((key) => {
    if (key.startsWith("_") || ["lineno", "col_offset", "end_lineno", "end_col_offset"].includes(key)) return;
    const prop = pyNode[key];
    if (Array.isArray(prop)) prop.forEach(child => child?._type && walkPythonAST(child, currentId, level + 1, siblingIndex, nodes, edges, counter, context));
    else if (prop?._type) walkPythonAST(prop, currentId, level + 1, siblingIndex, nodes, edges, counter, context);
  });
  return { nodes, edges };
}

export function walkPythonSimple(pyNode, parentId, level = 0, siblingIndex = 0, nodes = [], edges = [], counter = { val: 1 }, context = { funcName: null, classes: {}, codeLines: [] }) {
  if (!pyNode || !pyNode._type) return { nodes, edges };
  let currentId = `simple-py-${nodes.length}`;
  let label = null, subLabel = "", color = "#ffffff";
  if (pyNode._type === "ClassDef") { context.classes[pyNode.name] = currentId; label = `Blueprint: ${pyNode.name}`; subLabel = "Class Structure"; color = "#eff6ff"; }
  switch (pyNode._type) {
    case "FunctionDef": label = `Define: ${pyNode.name}()`; context.funcName = pyNode.name; subLabel = "Function Scope"; color = "#f0fdf4"; break;
    case "Assign": label = `Initialize: ${pyNode.targets[0]?.id || "object"}`; subLabel = "Memory Slot"; break;
    case "Return": label = "Result: Output"; color = "#fef2f2"; break;
    case "Call":
      const callName = pyNode.func.id || pyNode.func.attr || "...";
      label = `Action: ${callName}()`;
      if (callName === context.funcName) { label = `⚠️ Recursion: ${callName}()`; color = "#fee2e2"; }
      if (context.classes[callName]) edges.push({ id: `ref-${currentId}-to-${context.classes[callName]}`, source: currentId, target: context.classes[callName], label: "archetype", animated: true });
      break;
  }
  const sourceSnippet = pyNode.lineno ? context.codeLines[pyNode.lineno - 1]?.trim() : null;
  if (label) {
    nodes.push({ id: currentId, data: { label, subLabel, order: counter.val++, color, code: sourceSnippet, lineno: pyNode.lineno, raw: pyNode }, position: { x: siblingIndex * 350, y: level * 180 }, type: "custom" });
    if (parentId) edges.push({ id: `e-${parentId}-to-${currentId}`, source: parentId, target: currentId, animated: true });
  } else { currentId = parentId; }
  const children = Array.isArray(pyNode.body) ? pyNode.body : (pyNode.value ? [pyNode.value] : []);
  children.forEach((child, i) => child?._type && walkPythonSimple(child, currentId, label ? level + 1 : level, i, nodes, edges, counter, context));
  return { nodes, edges };
}

// --- JSX / REACT AST WALKERS ---

/**
 * Hardened walker for React/JSX with Archetype Linking.
 */
export function walkJSXSimple(babelNode, parentId, level = 0, siblingIndex = 0, nodes = [], edges = [], counter = { val: 1 }, context = { codeLines: [], components: {} }) {
  if (!babelNode || !babelNode.type) return { nodes, edges };

  let currentId = `jsx-${nodes.length}`;
  let label = null, subLabel = "", color = "#ffffff";

  // 1. Map Component Definitions (Archetypes)
  if (babelNode.type === "FunctionDeclaration" || (babelNode.type === "VariableDeclarator" && babelNode.id?.name)) {
    const name = babelNode.id?.name || "";
    if (name && /^[A-Z]/.test(name)) {
      context.components[name] = currentId;
      label = `React Component: ${name}`;
      subLabel = "UI Blueprint";
      color = "#eef2ff"; // indigo 50
    }
  }

  // 2. Identify Usage and Logic
  switch (babelNode.type) {
    case "JSXElement":
      const tagName = babelNode.openingElement.name.name;
      label = `<${tagName} />`;
      subLabel = "Rendered UI";
      color = "#f0fdf4"; // green 50
      
      // Link back to definition if it's a local component usage
      if (context.components[tagName]) {
        edges.push({
          id: `ref-${currentId}-to-${context.components[tagName]}`,
          source: currentId,
          target: context.components[tagName],
          label: "usage",
          animated: true,
          style: { stroke: "#6366f1", strokeDasharray: "5,5" }
        });
      }
      break;
    case "CallExpression":
      const callee = babelNode.callee.name || "";
      if (callee.startsWith("use")) {
        label = `Hook: ${callee}()`;
        subLabel = "State Logic";
        color = "#fffbeb"; // yellow 50
      }
      break;
    case "ArrowFunctionExpression":
      if (parentId && nodes.find(n => n.id === parentId)?.data.label.startsWith("Hook")) {
        label = "Callback Logic";
        subLabel = "Effect/Event Handler";
      }
      break;
  }

  const startLine = babelNode.loc?.start.line;
  const sourceSnippet = startLine ? context.codeLines[startLine - 1]?.trim() : null;

  if (label) {
    nodes.push({
      id: currentId,
      data: { label, subLabel, order: counter.val++, color, code: sourceSnippet, lineno: startLine, raw: babelNode },
      position: { x: siblingIndex * 380, y: level * 200 },
      type: "custom",
    });
    if (parentId) {
      edges.push({ id: `e-${parentId}-to-${currentId}`, source: parentId, target: currentId, animated: true });
    }
  } else {
    currentId = parentId;
  }

  // Exhaustive traversal of child paths
  const traverseKeys = [
    "body", "declarations", "init", "argument", "arguments", "children", 
    "expression", "openingElement", "attributes", "value", "callee", "program"
  ];
  
  traverseKeys.forEach(key => {
    const prop = babelNode[key];
    if (Array.isArray(prop)) {
      prop.forEach((child, i) => {
        if (child?.type) walkJSXSimple(child, currentId, label ? level + 1 : level, i, nodes, edges, counter, context);
      });
    } else if (prop?.type) {
      walkJSXSimple(prop, currentId, label ? level + 1 : level, 0, nodes, edges, counter, context);
    }
  });

  return { nodes, edges };
}
