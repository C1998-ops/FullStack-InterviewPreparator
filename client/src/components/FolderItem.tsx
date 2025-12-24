import React, { useState } from "react";
import { FolderData, FileData } from "@/context/AppContext";
import { useFolderData } from "@/hooks/useFolderData";
import FileTree from "./FileTree";

interface FolderItemProps {
  folderName: string;
  folderData: FolderData;
  isVisible: boolean;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folderName,
  folderData,
  isVisible,
}) => {
  const { getFilesInFolder } = useFolderData();
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>(folderData.files || []);
  const [loading, setLoading] = useState(false);

  const formatFolderName = (name: string): string => {
    return name.replace(/-/g, " ").replace(/_/g, " ");
  };

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      if (files.length === 0) {
        setLoading(true);
        try {
          const folderFiles = await getFilesInFolder(folderName);
          setFiles(folderFiles);
        } catch (error) {
          console.error("Error loading files:", error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="folder">
      <div
        className={`folder-header ${isOpen ? "active" : ""}`}
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
      >
        <span className="folder-icon">{folderData.icon}</span>
        <span className="folder-name">{formatFolderName(folderName)}</span>
      </div>
      {isOpen && (
        <div className="file-list open">
          {loading ? (
            <div className="loading">Loading files...</div>
          ) : (
            <FileTree folderName={folderName} files={files} />
          )}
        </div>
      )}
    </div>
  );
};

export default FolderItem;

