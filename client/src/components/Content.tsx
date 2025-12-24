import React, { useState } from "react";
import { marked } from "marked";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialDark,
  materialLight,
  nightOwl,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";

const Content: React.FC = () => {
  const { selectedFilePath, fileContent, fileType, isLoading, error } =
    useAppContext();
  const [theme, setTheme] = useState<
    "nightOwl" | "materialLight" | "materialDark"
  >("nightOwl");

  const getThemeStyle = () => {
    switch (theme) {
      case "nightOwl":
        return nightOwl;
      case "materialLight":
        return materialLight;
      case "materialDark":
        return materialDark;
      default:
        return nightOwl;
    }
  };
  const formatFolderName = (name: string): string => {
    return name.replace(/-/g, " ").replace(/_/g, " ");
  };

  const getLanguageFromFile = (filePath: string): string => {
    const extension = filePath.split(".").pop()?.toLowerCase() || "";
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      sh: "bash",
      sql: "sql",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yml: "yaml",
      yaml: "yaml",
      md: "markdown",
    };
    return languageMap[extension] || "javascript";
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading px-4 py-8 text-center">
          <p className="text-sm sm:text-base">Loading content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error px-4 py-6 sm:px-6 sm:py-8">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2">
            Error loading file
          </h3>
          <p className="text-xs sm:text-sm md:text-base">{error}</p>
        </div>
      );
    }

    if (!selectedFilePath) {
      return (
        <div className="content-empty px-4 py-8 sm:py-12 md:py-16 text-center">
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
              👋 Welcome to Your Interview Prep!
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Select a file from the sidebar to start studying
            </p>
          </div>
        </div>
      );
    }

    if (!fileContent) {
      return (
        <div className="content-empty px-4 py-8 sm:py-12 text-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl">Loading file...</h3>
          </div>
        </div>
      );
    }

    // Check if it's a code file that should be syntax highlighted
    const isCodeFile =
      fileType === "javascript" ||
      selectedFilePath.file.match(
        /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|sh|sql|html|css|scss|json|xml|yml|yaml)$/i
      );

    if (isCodeFile) {
      const language = getLanguageFromFile(selectedFilePath.file);
      return (
        <div className="content-area px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="breadcrumb text-xs sm:text-sm md:text-base mb-3 sm:mb-4 px-2 sm:px-3 py-2 break-words">
            📁 {formatFolderName(selectedFilePath.folder)} &gt; 📄{" "}
            {formatFolderName(selectedFilePath.file.split("/").pop() || "")}
          </div>
          <div className="markdown-content">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 px-2 sm:px-0">
              📜 {selectedFilePath.file.split("/").pop()}
            </h2>
            <div className="code-block-wrapper rounded-lg overflow-hidden border border-gray-200 shadow-sm my-3 sm:my-4 relative">
              {/* Theme Selector */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                <select
                  className="bg-gray-800 text-white text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-lg"
                  value={theme}
                  onChange={(e) =>
                    setTheme(
                      e.target.value as
                        | "nightOwl"
                        | "materialLight"
                        | "materialDark"
                    )
                  }
                  title="Select code theme"
                >
                  <option value="nightOwl">🌙 Night Owl</option>
                  <option value="materialLight">☀️ Material Light</option>
                  <option value="materialDark">🌑 Material Dark</option>
                </select>
              </div>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="code-highlight-container">
                  <SyntaxHighlighter
                    language={language}
                    style={getThemeStyle()}
                    customStyle={{
                      margin: 0,
                      padding: "0.75rem",
                      fontSize: "0.7rem",
                      lineHeight: "1.5",
                      borderRadius: "0.5rem",
                      minHeight: "100px",
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                      minWidth: "1.75em",
                      paddingRight: "0.5em",
                      color: "#858585",
                      userSelect: "none",
                      fontSize: "0.65rem",
                    }}
                    wrapLines={false}
                    wrapLongLines={false}
                    PreTag="div"
                    codeTagProps={{
                      style: {
                        fontSize: "inherit",
                      },
                    }}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const html = marked.parse(fileContent);
    return (
      <div className="content-area px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="breadcrumb text-xs sm:text-sm md:text-base mb-3 sm:mb-4 px-2 sm:px-3 py-2 break-words">
          📁 {formatFolderName(selectedFilePath.folder)} &gt; 📄{" "}
          {formatFolderName(selectedFilePath.file.split("/").pop() || "")}
        </div>
        <div
          className="markdown-content text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="content flex-1 overflow-auto">{renderContent()}</div>
      <Footer />
    </div>
  );
};

export default Content;
