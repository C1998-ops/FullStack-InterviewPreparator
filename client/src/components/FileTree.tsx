import React, { useState } from "react";
import { FileData } from "@/context/AppContext";
import { useFolderData } from "@/hooks/useFolderData";
import { useAppContext } from "@/context/AppContext";

interface FileTreeProps {
  folderName: string;
  files: FileData[];
  level?: number;
}

const FileTree: React.FC<FileTreeProps> = ({
  folderName,
  files,
  level = 0,
}) => {
  const { getFilesInFolder, getFileContent } = useFolderData();
  const {
    setSelectedFilePath,
    setFileContent,
    setFileType,
    setIsLoading,
    setError,
  } = useAppContext();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loadedFiles, setLoadedFiles] = useState<{
    [key: string]: FileData[];
  }>({});

  const formatFolderName = (name: string): string => {
    return name.replace(/-/g, " ").replace(/_/g, " ");
  };

  const handleFolderClick = async (
    folderName: string,
    filePath: string,
    hasChildren: boolean,
    children: FileData[] = []
  ) => {
    if (!hasChildren) return;

    const key = `${folderName}-${filePath}`;
    if (expandedFolders.has(key)) {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      setExpandedFolders((prev) => new Set(prev).add(key));
      
      // Check if this is a nested folder (filePath contains path separators)
      // Nested folders have paths like "subfolder" or "subfolder/nested", not just the top-level folder name
      const isNestedFolder = filePath.includes('/') || (filePath !== folderName && filePath !== '');
      
      if (!loadedFiles[key]) {
        // For nested folders, always use the children from the parent structure
        // The server returns the full nested structure recursively, so children should already be available
        // Never make an API call for nested folders - it would return the entire parent folder structure again
        if (isNestedFolder) {
          // Use children from the structure (even if empty array - means folder has no files)
          setLoadedFiles((prev) => ({ ...prev, [key]: children }));
        } else {
          // Only make API call for top-level folders when first opened
          const files = await getFilesInFolder(folderName);
          setLoadedFiles((prev) => ({ ...prev, [key]: files }));
        }
      }
    }
  };

  const handleFileClick = async (
    folderName: string,
    filePath: string,
    fileType: string = "markdown"
  ) => {
    setSelectedFilePath({ folder: folderName, file: filePath });
    setFileType(fileType);
    setIsLoading(true);
    setError(null);

    // Load file content
    const contentData = await getFileContent(folderName, filePath);
    if (contentData) {
      setFileContent(contentData.content);
      setFileType(contentData.fileType);
    } else {
      setError("File not found");
    }
    setIsLoading(false);
  };

  if (files.length === 0) {
    return (
      <div style={{ padding: "1rem", color: "#6c757d", fontSize: "0.8rem" }}>
        No files found
      </div>
    );
  }

  return (
    <div>
      {files.map((fileData, index) => {
        const fileName = fileData.name;
        const filePath = fileData.path;
        const isDirectory = fileData.isDirectory;
        const icon = fileData.icon || "📄";
        const hasChildren = fileData.hasChildren || false;
        const children = fileData.children || [];
        const key = `${folderName}-${filePath}`;
        const isExpanded = expandedFolders.has(key);

        if (isDirectory && hasChildren) {
          const displayChildren = loadedFiles[key] || children;

          return (
            <div key={index}>
              <div
                className="file-item"
                style={{ paddingLeft: `${2 + level * 1}rem`, cursor: "pointer" }}
                onClick={() => handleFolderClick(folderName, filePath, hasChildren, children)}
              >
                <span className="file-icon">{isExpanded ? "▼" : "▶"}</span>
                <span className="file-icon">{icon}</span>
                <span>{formatFolderName(fileName)}</span>
              </div>
              {isExpanded && displayChildren.length > 0 && (
                <FileTree
                  folderName={folderName}
                  files={displayChildren}
                  level={level + 1}
                />
              )}
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className="file-item"
              style={{ paddingLeft: `${2 + level * 1}rem`, cursor: "pointer" }}
              onClick={() =>
                handleFileClick(
                  folderName,
                  filePath,
                  fileData.fileType || "markdown"
                )
              }
            >
              <span className="file-icon">{icon}</span>
              <span>{formatFolderName(fileName)}</span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default FileTree;

