// src/components/CodeEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({
  content,
  onContentChange,
  path,
  language,
  editorRef,
}) => {
  // Helper to store editor instance and force focus when the editor loads
  const handleEditorDidMount = (editor, monaco) => {
    // Store the editor instance in the ref
    if (editorRef) {
      editorRef.current = editor;
    }
    // Focus on mount
    editor.focus();
  };

  return (
    <div
      className="h-full w-full overflow-hidden"
      onClick={() => {
        // Force focus when clicking anywhere in the editor container
        if (editorRef?.current) {
          editorRef.current.focus();
        }
      }}
      onKeyDown={(e) => {
        // Ensure spacebar events reach the editor
        if (e.key === " " || e.key === "Spacebar") {
          if (editorRef?.current) {
            editorRef.current.focus();
          }
        }
      }}
    >
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        // Use the path as the key to reset the editor when switching files/languages
        key={path || "scratchpad"}
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        // Essential options for a smooth experience
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 10 },
          // Ensure the editor can receive keyboard input
          readOnly: false,
          domReadOnly: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
