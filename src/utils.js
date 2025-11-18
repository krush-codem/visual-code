// src/utils.js
import path from "path-browserify";
import * as babelTypes from "@babel/types";
import * as csstree from "css-tree";

// --- IGNORE PATTERNS ---
const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".DS_Store",
  "dist",
  "build",
  ".env",
  "package-lock.json",
  "yarn.lock",
  "__pycache__",
  ".vscode",
];

// --- FILE PROCESSING ---

/**
 * Recursively reads all files from a selected directory handle.
 */
export async function processDirectory(directoryHandle, path = "") {
  const files = [];

  for await (const entry of directoryHandle.values()) {
    // 1. Check if this entry (file or folder) should be ignored
    if (IGNORE_PATTERNS.includes(entry.name)) {
      continue; // Skip this entry completely
    }

    const newPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === "file") {
      // Optional: Skip huge files or non-code files to save memory
      if (
        entry.name.endsWith(".lock") ||
        entry.name.endsWith(".png") ||
        entry.name.endsWith(".jpg")
      ) {
        continue;
      }

      const file = await entry.getFile();
      // Safety: Don't try to read massive files
      if (file.size > 1000000) continue; // Skip files > 1MB

      const content = await file.text();
      files.push({ path: newPath, content });
    } else if (entry.kind === "directory") {
      // RECURSION: If it's a directory, call this function again
      const subFiles = await processDirectory(entry, newPath);
      files.push(...subFiles);
    }
  }
  return files;
}

// --- PARSING & GRAPH HELPERS ---

/**
 * Resolves a relative import path (e.g., '../Button') to a full project path.
 */
export function resolveImportPath(currentFilePath, importPath, allFilePaths) {
  if (!importPath.startsWith(".")) {
    // It's an external library (e.g., 'react', 'lodash')
    return importPath;
  }

  const currentFileDir = path.dirname(currentFilePath);
  let resolvedPath = path.resolve(currentFileDir, importPath);

  // Check if the resolved path exists *without* an extension
  if (allFilePaths.includes(resolvedPath)) {
    return resolvedPath;
  }

  // Check for common extensions
  const extensions = [".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.jsx"];
  for (const ext of extensions) {
    if (allFilePaths.includes(resolvedPath + ext)) {
      return resolvedPath + ext;
    }
  }

  // Could not resolve
  return null;
}

// --- README GENERATOR HELPERS ---

/**
 * Builds a visual file tree from a list of project files,
 * while ignoring common boilerplate.
 */
export function buildFileTree(projectFiles) {
  // 1. Filter out all ignored files
  const filteredPaths = projectFiles
    .map((f) => f.path)
    .filter(
      (path) => !IGNORE_PATTERNS.some((pattern) => path.includes(pattern))
    )
    .sort();

  // 2. Build a nested object structure from the paths
  const tree = {};
  filteredPaths.forEach((path) => {
    let currentLevel = tree;
    path.split("/").forEach((part) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    });
  });

  // 3. Recursive function to "draw" the tree as a string
  function drawTree(obj, prefix = "") {
    let output = "";
    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      output += prefix + connector + key + "\n";

      if (Object.keys(value).length > 0) {
        output += drawTree(value, newPrefix); // Recurse for directories
      }
    });
    return output;
  }

  return ".\n" + drawTree(tree);
}

/**
 * Scans the project's dependencies and files to
 * generate a list of "Key Features".
 */
export function generateFeatureBullets(pkg, projectFiles) {
  const features = [];
  const allPaths = projectFiles.map((f) => f.path);
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  // --- Check Dependencies ---
  if (dependencies.react) {
    features.push("Built with a modern, component-based **React** UI.");
  }
  if (dependencies["react-router-dom"]) {
    features.push("Includes **client-side routing** for a multi-page feel.");
  }
  if (dependencies.tailwindcss) {
    features.push("Styled utility-first with **Tailwind CSS**.");
  } else if (allPaths.some((p) => p.endsWith(".scss") || p.endsWith(".sass"))) {
    features.push("Uses **Sass** for advanced, nested styling.");
  }
  if (dependencies.axios || dependencies.fetch) {
    features.push("Connects to external data sources using **API fetching**.");
  }
  if (dependencies.firebase) {
    features.push(
      "Integrated with **Firebase** for backend services (auth, database)."
    );
  }
  if (dependencies["@xyflow/react"] || dependencies.d3) {
    features.push("Renders complex **data visualizations**.");
  }

  // --- Check File Paths ---
  if (
    allPaths.some((p) => p.includes("src/api") || p.includes("src/utils/api"))
  ) {
    features.push("Features a dedicated **API layer** for data management.");
  }
  if (allPaths.some((p) => p.includes("src/components"))) {
    features.push(
      "Organized with a clean, **component-based** file structure."
    );
  }
  if (allPaths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"))) {
    features.push("Ensures code quality and type safety with **TypeScript**.");
  }

  if (features.length === 0) {
    return "*No key features detected automatically.*";
  }

  // Format as bullet points
  return features.map((f) => `- ${f}`).join("\n");
}

// --- "ADVANCED" AST Walker Helpers ---

/**
 * Walks an HTML DOM tree and converts it to React Flow nodes/edges.
 */
export function walkDOM(
  domNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (domNode.nodeType !== Node.ELEMENT_NODE) return { nodes, edges };

  const currentId = `dom-${nodes.length}`;
  const label = domNode.tagName.toLowerCase();

  nodes.push({
    id: currentId,
    data: { label: `<${label}>` },
    position: { x: siblingIndex * 170, y: level * 100 },
    type: level === 0 ? "input" : "default",
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-to-${currentId}`,
      source: parentId,
      target: currentId,
    });
  }

  Array.from(domNode.children).forEach((child, i) => {
    walkDOM(child, currentId, level + 1, i, nodes, edges);
  });

  return { nodes, edges };
}

/**
 * Walks a Babel AST (JavaScript) and converts it to React Flow nodes/edges.
 */
export function walkBabelAST(
  babelNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (!babelNode || !babelNode.type) return { nodes, edges };

  const currentId = `js-${nodes.length}`;
  let label = babelNode.type;

  if (babelNode.type === "Identifier") {
    label = `Identifier: ${babelNode.name}`;
  } else if (
    babelNode.type === "NumericLiteral" ||
    babelNode.type === "StringLiteral"
  ) {
    label = `${babelNode.type}: ${babelNode.value}`;
  }

  nodes.push({
    id: currentId,
    data: { label: label },
    position: { x: siblingIndex * 220, y: level * 100 },
    type: level === 0 ? "input" : "default",
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-to-${currentId}`,
      source: parentId,
      target: currentId,
    });
  }

  // This uses the babelTypes import from the top of *this* file
  const visitorKeys = babelTypes.VISITOR_KEYS[babelNode.type];
  if (!visitorKeys) return { nodes, edges };

  let childIndex = 0;
  visitorKeys.forEach((key) => {
    const child = babelNode[key];
    if (Array.isArray(child)) {
      child.forEach((subChild) => {
        walkBabelAST(
          subChild,
          currentId,
          level + 1,
          childIndex++,
          nodes,
          edges
        );
      });
    } else if (typeof child === "object" && child !== null) {
      walkBabelAST(child, currentId, level + 1, childIndex++, nodes, edges);
    }
  });
  return { nodes, edges };
}

/**
 * Walks a CSS-Tree AST (CSS) and converts it to React Flow nodes/edges.
 */
export function walkCSSTree(
  cssNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  const currentId = `css-${nodes.length}`;
  let label = cssNode.type;

  try {
    // This uses the csstree import from the top of *this* file
    if (cssNode.type === "Selector") {
      label = `Selector: ${csstree.generate(cssNode)}`;
    } else if (cssNode.type === "Declaration") {
      label = `Declaration: ${cssNode.property}: ...`;
    }
  } catch (e) {
    /* ignore generator errors */
  }

  nodes.push({
    id: currentId,
    data: { label: label },
    position: { x: siblingIndex * 200, y: level * 100 },
    type: level === 0 ? "input" : "default",
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-to-${currentId}`,
      source: parentId,
      target: currentId,
    });
  }

  // This uses the csstree import from the top of *this* file
  csstree.walk(cssNode, {
    children: function (node) {
      const children = node.children || node.block?.children;
      if (!children) {
        return;
      }
      let i = 0;
      children.forEach((childNode) => {
        walkCSSTree(childNode, currentId, level + 1, i++, nodes, edges);
      });
    },
  });

  return { nodes, edges };
}

/**
 * Walks a Java CST (from java-parser) and converts it to React Flow nodes/edges.
 */
export function walkJavaAST(
  cstNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (!cstNode) return { nodes, edges };

  const currentId = `java-${nodes.length}`;
  const label = cstNode.name || "node"; // 'name' holds the type (e.g., 'compilationUnit')

  nodes.push({
    id: currentId,
    data: { label: label },
    position: { x: siblingIndex * 220, y: level * 100 },
    type: level === 0 ? "input" : "default",
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-to-${currentId}`,
      source: parentId,
      target: currentId,
    });
  }

  // Recurse into children
  if (cstNode.children) {
    let childIndex = 0;
    Object.values(cstNode.children).forEach((childArray) => {
      if (Array.isArray(childArray)) {
        childArray.forEach((child) => {
          walkJavaAST(child, currentId, level + 1, childIndex++, nodes, edges);
        });
      }
    });
  }
  return { nodes, edges };
}

/**
 * Walks a Python AST (as JSON) and converts it to React Flow nodes/edges.
 * This is a generic walker that looks for known list-of-nodes keys.
 */
export function walkPythonAST(
  pyNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (!pyNode || !pyNode._type) return { nodes, edges };

  const currentId = `py-${nodes.length}`;
  const label = pyNode._type; // e.g., 'Module', 'FunctionDef'

  nodes.push({
    id: currentId,
    data: { label: label },
    position: { x: siblingIndex * 220, y: level * 100 },
    type: level === 0 ? "input" : "default",
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-to-${currentId}`,
      source: parentId,
      target: currentId,
    });
  }

  // Python AST nodes have fields like 'body', 'orelse', etc.
  // We'll just iterate over all properties to find lists of child nodes.
  let childIndex = 0;
  Object.values(pyNode).forEach((prop) => {
    if (Array.isArray(prop)) {
      // It's a list of children (like the 'body' of a function)
      prop.forEach((child) => {
        if (typeof child === "object" && child !== null && child._type) {
          walkPythonAST(
            child,
            currentId,
            level + 1,
            childIndex++,
            nodes,
            edges
          );
        }
      });
    } else if (typeof prop === "object" && prop !== null && prop._type) {
      // It's a single child node
      walkPythonAST(prop, currentId, level + 1, childIndex++, nodes, edges);
    }
  });

  return { nodes, edges };
}

// --- "SIMPLE" AST Walker Helpers ---

/**
 * Creates a simple, conceptual graph for JavaScript.
 */
export function walkBabelSimple(
  babelNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (!babelNode || !babelNode.type) return { nodes, edges };

  let currentId = `simple-js-${nodes.length}`;
  let label = null;
  let nodeType = "default";

  // Find high-level concepts
  switch (babelNode.type) {
    case "FunctionDeclaration":
      label = `[Function: ${babelNode.id.name}]`;
      nodeType = "output";
      break;
    case "VariableDeclaration":
      // We only care about the declaration itself, not the 'kind' (let/const/var)
      // Recurse into its declarations
      babelNode.declarations.forEach((dec, i) => {
        walkBabelSimple(dec, parentId, level, siblingIndex + i, nodes, edges);
      });
      return { nodes, edges }; // Stop here, we don't want a "VariableDeclaration" node
    case "VariableDeclarator":
      label = `[Variable: ${babelNode.id.name}]`;
      break;
    case "ClassDeclaration":
      label = `[Class: ${babelNode.id.name}]`;
      nodeType = "output";
      break;
    case "CallExpression":
      label = `[Call: ${babelNode.callee.name || "..."}]`;
      break;
  }

  // If we found a label, create a node
  if (label) {
    nodes.push({
      id: currentId,
      data: { label: label },
      position: { x: siblingIndex * 250, y: level * 100 },
      type: nodeType,
    });
    if (parentId) {
      edges.push({
        id: `e-${parentId}-to-${currentId}`,
        source: parentId,
        target: currentId,
      });
    }
  } else {
    // If no label, this is a "wrapper" node. We don't create a node for it,
    // but we update the parentId to link its children to its parent.
    currentId = parentId;
    currentLevel = level; // Stay on the same level
  }

  // --- Recurse into children ---
  const visitorKeys = babelTypes.VISITOR_KEYS[babelNode.type];
  if (!visitorKeys) return { nodes, edges };

  let childIndex = 0;
  visitorKeys.forEach((key) => {
    // Skip noisy keys
    if (key === "id" || key === "callee") return;

    const child = babelNode[key];
    if (Array.isArray(child)) {
      child.forEach((subChild) => {
        walkBabelSimple(
          subChild,
          currentId,
          level + 1,
          childIndex++,
          nodes,
          edges
        );
      });
    } else if (typeof child === "object" && child !== null) {
      walkBabelSimple(
        subChild,
        currentId,
        level + 1,
        childIndex++,
        nodes,
        edges
      );
    }
  });

  return { nodes, edges };
}

/**
 * Creates a simple, conceptual graph for Java.
 * (This is the new, corrected version)
 */
// src/utils.js

// ... (keep all your other functions)

/**
 * Creates a simple, conceptual graph for Java.
 * (This is the new, smarter version)
 */
export function walkJavaSimple(
  cstNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = [],
  context = { currentClassId: null, classIndex: 0 }
) {
  if (!cstNode) return { nodes, edges };

  const nodeName = cstNode.name;
  let newNodeId = null;
  let shouldRecurse = true;

  try {
    switch (nodeName) {
      case "normalClassDeclaration": {
        const className =
          cstNode.children?.typeIdentifier?.[0]?.children?.Identifier?.[0]
            ?.image;

        if (!className) break;

        let label = `[Class: ${className}]`;

        // Check for inheritance
        if (cstNode.children.superclass) {
          const parentClass =
            cstNode.children.superclass[0]?.children?.classOrInterfaceType?.[0]
              ?.children?.Identifier?.[0]?.image;
          if (parentClass) {
            label += ` extends ${parentClass}`;
          }
        }

        newNodeId = `class-${className}-${nodes.length}`;

        // Create node with explicit type and make sure it's a valid React Flow node
        const newNode = {
          id: newNodeId,
          data: { label, className },
          position: { x: context.classIndex * 350, y: 0 },
          type: "input", // Changed from "output" - input nodes have bottom handles by default
        };

        nodes.push(newNode);
        console.log(`Created class node:`, newNode);

        context.classIndex++;
        context.currentClassId = newNodeId;
        parentId = newNodeId;
        level = 1;
        break;
      }

      case "fieldDeclaration": {
        const fieldName =
          cstNode.children?.variableDeclaratorList?.[0]?.children
            ?.variableDeclarator?.[0]?.children?.variableDeclaratorId?.[0]
            ?.children?.Identifier?.[0]?.image;

        if (fieldName && context.currentClassId) {
          newNodeId = `field-${fieldName}-${nodes.length}`;

          const newNode = {
            id: newNodeId,
            data: { label: `[Field: ${fieldName}]` },
            position: { x: siblingIndex * 300, y: level * 120 },
            type: "default",
          };

          nodes.push(newNode);

          const newEdge = {
            id: `e-${context.currentClassId}-to-${newNodeId}`,
            source: context.currentClassId,
            target: newNodeId,
            type: "default",
          };

          edges.push(newEdge);

          console.log(`Created field:`, newNode);
          console.log(`Created edge:`, newEdge);
        }
        shouldRecurse = false;
        break;
      }

      case "methodDeclaration": {
        const methodName =
          cstNode.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0]
            ?.children?.Identifier?.[0]?.image;

        if (methodName && context.currentClassId) {
          newNodeId = `method-${methodName}-${nodes.length}`;

          const newNode = {
            id: newNodeId,
            data: { label: `[Method: ${methodName}]` },
            position: { x: siblingIndex * 300, y: level * 120 },
            type: "default",
          };

          nodes.push(newNode);

          const newEdge = {
            id: `e-${context.currentClassId}-to-${newNodeId}`,
            source: context.currentClassId,
            target: newNodeId,
            type: "default",
          };

          edges.push(newEdge);

          console.log(`Created method:`, newNode);
          console.log(`Created edge:`, newEdge);
          console.log(
            `All nodes so far:`,
            nodes.map((n) => n.id)
          );

          parentId = newNodeId;
          level = level + 1;
        }
        break;
      }

      case "localVariableDeclarationStatement": {
        const varName =
          cstNode.children?.localVariableDeclaration?.[0]?.children
            ?.variableDeclaratorList?.[0]?.children?.variableDeclarator?.[0]
            ?.children?.variableDeclaratorId?.[0]?.children?.Identifier?.[0]
            ?.image;

        if (varName && parentId) {
          newNodeId = `var-${varName}-${nodes.length}`;

          const newNode = {
            id: newNodeId,
            data: { label: `[Variable: ${varName}]` },
            position: { x: siblingIndex * 300, y: level * 120 },
            type: "default",
          };

          nodes.push(newNode);

          const newEdge = {
            id: `e-${parentId}-to-${newNodeId}`,
            source: parentId,
            target: newNodeId,
            type: "default",
          };

          edges.push(newEdge);

          console.log(`Created variable:`, newNode);
          console.log(`Created edge:`, newEdge);
        }
        shouldRecurse = false;
        break;
      }

      case "methodInvocation": {
        let methodName;
        if (cstNode.children?.methodName) {
          methodName =
            cstNode.children.methodName[0]?.children?.Identifier?.[0]?.image;
        } else if (cstNode.children?.Identifier) {
          methodName = cstNode.children.Identifier[0]?.image;
        }

        if (methodName && parentId) {
          newNodeId = `call-${methodName}-${nodes.length}`;

          const newNode = {
            id: newNodeId,
            data: { label: `[Call: ${methodName}]` },
            position: { x: siblingIndex * 300, y: level * 120 },
            type: "default",
          };

          nodes.push(newNode);

          const newEdge = {
            id: `e-${parentId}-to-${newNodeId}`,
            source: parentId,
            target: newNodeId,
            type: "default",
          };

          edges.push(newEdge);

          console.log(`Created call:`, newNode);
          console.log(`Created edge:`, newEdge);
        }
        shouldRecurse = false;
        break;
      }
    }
  } catch (error) {
    console.error("Error processing node:", nodeName, error);
  }

  // Recurse into children
  if (shouldRecurse && cstNode.children) {
    let childIndex = 0;

    for (const childArray of Object.values(cstNode.children)) {
      if (Array.isArray(childArray)) {
        for (const child of childArray) {
          walkJavaSimple(
            child,
            newNodeId || parentId,
            newNodeId ? level + 1 : level,
            childIndex++,
            nodes,
            edges,
            context
          );
        }
      }
    }
  }

  return { nodes, edges };
}
/**
 * Creates a simple, conceptual graph for Python.
 */
export function walkPythonSimple(
  pyNode,
  parentId,
  level = 0,
  siblingIndex = 0,
  nodes = [],
  edges = []
) {
  if (!pyNode || !pyNode._type) return { nodes, edges };

  let currentId = `simple-py-${nodes.length}`;
  let label = null;
  let nodeType = "default";

  // Find high-level concepts
  switch (pyNode._type) {
    case "FunctionDef":
      label = `[Function: ${pyNode.name}]`;
      nodeType = "output";
      break;
    case "Assign":
      // pyNode.targets is an array, get the first one's id
      label = `[Variable: ${pyNode.targets[0].id}]`;
      break;
    case "Call":
      // pyNode.func is an object, get its id
      label = `[Call: ${pyNode.func.id}]`;
      break;
  }

  if (label) {
    nodes.push({
      id: currentId,
      data: { label: label },
      position: { x: siblingIndex * 250, y: level * 100 },
      type: nodeType,
    });
    if (parentId) {
      edges.push({
        id: `e-${parentId}-to-${currentId}`,
        source: parentId,
        target: currentId,
      });
    }
  } else {
    currentId = parentId;
    level--;
  }

  // Recurse into children
  let childIndex = 0;
  Object.values(pyNode).forEach((prop) => {
    // Skip noisy props
    if (typeof prop === "string") return;

    if (Array.isArray(prop)) {
      prop.forEach((child) => {
        if (typeof child === "object" && child !== null && child._type) {
          walkPythonSimple(
            child,
            currentId,
            level + 1,
            childIndex++,
            nodes,
            edges
          );
        }
      });
    } else if (typeof prop === "object" && prop !== null && prop._type) {
      walkPythonSimple(prop, currentId, level + 1, childIndex++, nodes, edges);
    }
  });

  return { nodes, edges };
}
