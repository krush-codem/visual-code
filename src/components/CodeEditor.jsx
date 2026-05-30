// src/components/CodeEditor.jsx
import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({
  content,
  onContentChange,
  path,
  language,
  editorRef,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    if (editorRef) {
      editorRef.current = editor;
    }
    // Only auto-focus on desktop to prevent unwanted keyboard popup on mobile
    if (!isMobile) {
      editor.focus();
    }
  };

  return (
    <div
      className="h-full w-full overflow-hidden bg-[#1e1e1e]"
      onClick={() => {
        if (editorRef?.current) {
          editorRef.current.focus();
        }
      }}
    >
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        key={path || "scratchpad"}
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: isMobile ? 12 : 14, // Slightly smaller on mobile
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 10, bottom: 10 },
          // Mobile specific optimizations
          scrollbar: {
            vertical: isMobile ? 'visible' : 'auto',
            horizontal: isMobile ? 'visible' : 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: isMobile ? 10 : 14,
            horizontalScrollbarSize: isMobile ? 10 : 14,
          },
          links: false, // Disable links to prevent accidental clicks
          contextmenu: !isMobile, // Disable context menu on mobile
          quickSuggestions: !isMobile, // Can be annoying on mobile keyboards
          renderLineHighlight: "none",
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          readOnly: false,
          domReadOnly: false,
          // Important for touch
          mouseWheelZoom: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
