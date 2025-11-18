// src/components/FileExplorer.jsx
import React from "react";
import { Button } from "@/components/ui/button"; // from shadcn
import { ScrollArea } from "@/components/ui/scroll-area"; // from shadcn
import { FolderOpen, FileText } from "lucide-react"; // icons
import { ThemeToggle } from "./ThemeToggle";

const FileExplorer = ({
  projectFiles,
  onFolderOpen,
  onReadmeGen,
  onFileClick,
  isDisabled,
}) => {
  return (
    <div className="p-2 flex flex-col flex-1 min-h-0">
      {/* 2. Add the toggle button to the header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">File Explorer</h3>
        <ThemeToggle />
      </div>

      <div className="flex flex-col gap-2 mb-2">
        <Button onClick={onFolderOpen} size="sm">
          <FolderOpen className="mr-2 h-4 w-4" /> Open Folder
        </Button>
        <Button
          onClick={onReadmeGen}
          size="sm"
          disabled={isDisabled}
          variant="secondary"
        >
          <FileText className="mr-2 h-4 w-4" /> Gen. File Stru.
        </Button>
      </div>

      {/* FIX: Use 'flex-1' to force the area to shrink and scroll */}
      <ScrollArea className="flex-1 border rounded-md h-full">
        <ul className="p-2">
          {projectFiles.map((file) => (
            <li
              key={file.path}
              onClick={() => onFileClick(file)}
              className="file-item text-sm p-1 rounded-md hover:bg-muted cursor-pointer"
            >
              {file.path}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
