// src/components/CodeEditor.jsx
import React from 'react';
import Editor from '@monaco-editor/react';

// 1. Accept the new 'language' prop
const CodeEditor = ({ content, onContentChange, path, language }) => {
  return (
    <Editor
      height="100%"
      language={language} // 2. Use the prop here
      theme="vs-dark"
      key={path || 'scratchpad'} 
      value={content}
      onChange={(value) => onContentChange(value || '')}
    />
  );
};

export default CodeEditor;