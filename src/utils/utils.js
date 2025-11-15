// src/utils.js
import path from "path-browserify";

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
export async function processDirectory(directoryHandle, path = "") {
  const files = [];
  for await (const entry of directoryHandle.values()) {
    const newPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.kind === "file") {
      const file = await entry.getFile();
      const content = await file.text();
      files.push({ path: newPath, content });
    } else if (entry.kind === "directory") {
      const subFiles = await processDirectory(entry, newPath);
      files.push(...subFiles);
    }
  }
  return files;
}

// --- PARSING & GRAPH HELPERS ---
export function resolveImportPath(currentFilePath, importPath, allFilePaths) {
  if (!importPath.startsWith(".")) {
    return importPath;
  }
  const currentFileDir = path.dirname(currentFilePath);
  let resolvedPath = path.resolve(currentFileDir, importPath);
  if (allFilePaths.includes(resolvedPath)) {
    return resolvedPath;
  }
  const extensions = [".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.jsx"];
  for (const ext of extensions) {
    if (allFilePaths.includes(resolvedPath + ext)) {
      return resolvedPath + ext;
    }
  }
  return null;
}

// --- README GENERATOR HELPERS ---
export function buildFileTree(projectFiles) {
  const filteredPaths = projectFiles
    .map((f) => f.path)
    .filter(
      (path) => !IGNORE_PATTERNS.some((pattern) => path.includes(pattern))
    )
    .sort();

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

  function drawTree(obj, prefix = "") {
    let output = "";
    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      output += prefix + connector + key + "\n";
      if (Object.keys(value).length > 0) {
        output += drawTree(value, newPrefix);
      }
    });
    return output;
  }
  return ".\n" + drawTree(tree);
}

export function generateFeatureBullets(pkg, projectFiles) {
  const features = [];
  const allPaths = projectFiles.map((f) => f.path);
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

  if (dependencies.react)
    features.push("Built with a modern, component-based **React** UI.");
  if (dependencies["react-router-dom"])
    features.push("Includes **client-side routing** for a multi-page feel.");
  if (dependencies.tailwindcss)
    features.push("Styled utility-first with **Tailwind CSS**.");
  if (dependencies.axios)
    features.push("Connects to external data sources using **API fetching**.");
  if (dependencies.firebase)
    features.push("Integrated with **Firebase** for backend services.");
  if (allPaths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx")))
    features.push("Ensures code quality with **TypeScript**.");

  if (features.length === 0) return "*No key features detected automatically.*";
  return features.map((f) => `- ${f}`).join("\n");
}
