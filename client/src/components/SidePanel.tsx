import React, { useState, useMemo } from "react";
import { useFolderData } from "@/hooks/useFolderData";
import FolderItem from "./FolderItem";

export const Sidebar: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
}> = () => {
  const { folderStructure, loading } = useFolderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folderStructure;

    const query = searchQuery.toLowerCase();
    const filtered: typeof folderStructure = {};

    Object.entries(folderStructure).forEach(([folderName, folderData]) => {
      const formattedName = folderName.replace(/-/g, " ").replace(/_/g, " ");
      if (formattedName.toLowerCase().includes(query)) {
        filtered[folderName] = folderData;
      }
    });

    return filtered;
  }, [folderStructure, searchQuery]);

  const visibleFolders = Object.keys(filteredFolders);
  const hasResults = visibleFolders.length > 0;
  const hasFolders = Object.keys(folderStructure).length > 0;

  return (
    <div className="sidebar h-full flex flex-col overflow-hidden" style={{ height: "100%", maxHeight: "100vh" }}>
      <div className="search-box relative shrink-0">
        <input
          type="text"
          id="search-input"
          placeholder="🔍 Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        {searchQuery && (
          <button
            className="absolute top-0 outline-none bg-transparent border-none cursor-pointer bottom-1 right-2 p-1"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            <span className="text-xs md:text-lg text-gray-500 hover:text-gray-700">×</span>
          </button>
        )}
      </div>
      <div className="folder-tree flex-1 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="loading p-4 text-center text-gray-600">Loading folders...</div>
        ) : !hasFolders ? (
          <div className="empty-tree p-4 text-center text-gray-500">
            No folders available
          </div>
        ) : !hasResults && searchQuery ? (
          <div className="empty-tree p-4 text-center text-gray-500">
            No folders found. Try searching with different keywords.
          </div>
        ) : (
          visibleFolders.map((folderName) => (
            <FolderItem
              key={folderName}
              folderName={folderName}
              folderData={filteredFolders[folderName]}
              isVisible={true}
            />
          ))
        )}
      </div>
    </div>
  );
};
