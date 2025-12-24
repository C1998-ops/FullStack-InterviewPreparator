import { useState, useEffect } from "react";
import { FolderStructure, FileData } from "@/context/AppContext";

const FOLDER_ICONS: { [key: string]: string } = {
  "Angular-Topics-Interview": "🅰️",
  React: "⚛️",
  Javascript: "📜",
  Redux: "🔄",
  "Node-Express": "🟢",
  CSS: "🎨",
  MongoDB: "🍃",
  "Promise-Async-Await-Sequential-Execution": "⏳",
  "Event-Loop-Asynchronous-setTimeout": "🔄",
  "Fundamental-Algorithms-JS": "🧮",
  "Collection-of-Popular-Problems-with-Solutions": "💡",
  "Challenges-from-Popular-Coding-Practice-sites": "🏆",
  "Collection-of-TakeHome-Exercises": "📝",
  "Git-and-Github": "🌿",
  "system-design": "🏗️",
  "Web-Development-In-General": "🌐",
  "Collections-of-Questions-NOT-drafted-Ans": "❓",
  GraphQL: "🔗",
  Heroku: "☁️",
  HTML: "📄",
  Typescript: "📘",
  webpack: "📦",
  "Common-Problem-Set": "🧩",
  "General-Soft_Getting_to_Know_Interview_Questions": "🗣️",
};

export const useFolderData = () => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBasicFolderStructure = (): FolderStructure => {
    const structure: FolderStructure = {};
    Object.keys(FOLDER_ICONS).forEach((folderName) => {
      structure[folderName] = {
        icon: FOLDER_ICONS[folderName] || "📁",
        files: [],
        isDirectory: true,
      };
    });
    return structure;
  };

  const loadFolderStructure = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch static data.json first
      const response = await fetch("/data.json");
      if (response.ok) {
        const data = await response.json();
        setFolderStructure(data.folders || {});
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log("Static data not found, trying API...");
    }

    try {
      // Fallback to API
      const response = await fetch("/api/folders");
      if (response.ok) {
        const folders = await response.json();
        setFolderStructure(folders);
      } else {
        setFolderStructure(loadBasicFolderStructure());
      }
    } catch (err) {
      console.log("Server not available, using basic structure");
      setFolderStructure(loadBasicFolderStructure());
    } finally {
      setLoading(false);
    }
  };

  const getFilesInFolder = async (folderName: string): Promise<FileData[]> => {
    // If we have static data structure, the files are already nested in it
    if (
      folderStructure[folderName] &&
      folderStructure[folderName].files &&
      folderStructure[folderName].files.length > 0
    ) {
      return folderStructure[folderName].files;
    }

    try {
      const response = await fetch(
        `/api/files/${encodeURIComponent(folderName)}`
      );
      if (response.ok) {
        const files = await response.json();
        // Update folder structure with files
        setFolderStructure((prev) => ({
          ...prev,
          [folderName]: {
            ...prev[folderName],
            files,
          },
        }));
        return files;
      }
    } catch (err) {
      console.log("Server-side file listing not available");
    }

    return folderStructure[folderName]?.files || [];
  };

  const getFileContent = async (
    folderName: string,
    filePath: string
  ): Promise<{ content: string; fileType: string } | null> => {
    // Check if we have the content in our static structure
    const foundContent = findContentInStructure(folderName, filePath);
    if (foundContent) {
      return foundContent;
    }

    try {
      const response = await fetch(
        `/api/file/${encodeURIComponent(folderName)}/${encodeURIComponent(
          filePath
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content,
          fileType: filePath.endsWith(".js") ? "javascript" : "markdown",
        };
      }
    } catch (err) {
      console.error("Error loading file:", err);
    }

    return null;
  };

  const findContentInStructure = (
    folderName: string,
    filePath: string
  ): { content: string; fileType: string } | null => {
    let foundContent: string | null = null;

    const search = (items: FileData[]): void => {
      if (!items) return;
      for (const item of items) {
        if (item.path === filePath && item.content) {
          foundContent = item.content;
          return;
        }
        if (item.children) {
          search(item.children);
          if (foundContent) return;
        }
      }
    };

    if (folderStructure[folderName]) {
      search(folderStructure[folderName].files);
    }

    if (foundContent) {
      return {
        content: foundContent,
        fileType: filePath.endsWith(".js") ? "javascript" : "markdown",
      };
    }

    return null;
  };

  useEffect(() => {
    loadFolderStructure();
  }, []);

  return {
    folderStructure,
    loading,
    error,
    loadFolderStructure,
    getFilesInFolder,
    getFileContent,
    setFolderStructure,
  };
};
