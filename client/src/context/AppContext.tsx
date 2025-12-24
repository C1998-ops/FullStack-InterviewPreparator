import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FileData {
  name: string;
  path: string;
  isDirectory: boolean;
  icon?: string;
  fileType?: string;
  children?: FileData[];
  hasChildren?: boolean;
  content?: string;
}

export interface FolderData {
  icon: string;
  files: FileData[];
  isDirectory: boolean;
}

export interface FolderStructure {
  [folderName: string]: FolderData;
}

interface AppContextType {
  folderStructure: FolderStructure;
  setFolderStructure: (structure: FolderStructure) => void;
  currentFolder: string | null;
  setCurrentFolder: (folder: string | null) => void;
  currentFile: string | null;
  setCurrentFile: (file: string | null) => void;
  selectedFilePath: { folder: string; file: string } | null;
  setSelectedFilePath: (path: { folder: string; file: string } | null) => void;
  fileContent: string | null;
  setFileContent: (content: string | null) => void;
  fileType: string;
  setFileType: (type: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<{
    folder: string;
    file: string;
  } | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("markdown");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        folderStructure,
        setFolderStructure,
        currentFolder,
        setCurrentFolder,
        currentFile,
        setCurrentFile,
        selectedFilePath,
        setSelectedFilePath,
        fileContent,
        setFileContent,
        fileType,
        setFileType,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

