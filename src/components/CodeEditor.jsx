// src/components/CodeEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ content, onContentChange }) => {
  return (
    <Editor
      height="100%"
      language="javascript"
      theme="vs-dark"
      key={content.substring(0, 10)} // Your trick to reset state
      value={content}
      onChange={(value) => onContentChange(value || "")}
    />
  );
};

export default CodeEditor;
