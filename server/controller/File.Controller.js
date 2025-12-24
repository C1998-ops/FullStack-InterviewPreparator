import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.join(__dirname, "../../");

// Folder icon mapping
const FOLDER_ICONS = {
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
  "Nest.js": "😼",
};

// Directories to exclude
const EXCLUDED_DIRS = new Set([
  "node_modules",
  "client",
  "server",
  ".git",
  "dist",
  "build",
]);

/**
 * Get icon for a folder
 * @param {string} folderName - Name of the folder
 * @returns {string} Icon emoji
 */
const getFolderIcon = (folderName) => FOLDER_ICONS[folderName] || "📁";

/**
 * Check if directory should be included
 * @param {fs.Dirent} item - Directory entry
 * @returns {boolean} True if directory should be included
 */
const shouldIncludeDirectory = (item) => {
  return (
    item?.isDirectory() &&
    !item.name.startsWith(".") &&
    !EXCLUDED_DIRS.has(item.name)
  );
};

/**
 * Helper function to get files recursively with nested structure
 * @param {string} dirPath - Directory path
 * @param {string} relativePath - Relative path from root
 * @returns {Array} Array of file objects
 */
const getFilesRecursively = (dirPath, relativePath = "") => {
  const files = [];

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach((item) => {
      if (item?.isDirectory()) {
        // Add directory with its children
        const subPath = path.join(dirPath, item.name);
        const children = getFilesRecursively(
          subPath,
          path.join(relativePath, item.name)
        );

        files.push({
          name: item.name,
          path: path.join(relativePath, item.name),
          isDirectory: true,
          icon: "📁",
          children: children,
          hasChildren: children.length > 0,
        });
      } else if (item.name.endsWith(".md")) {
        // Add markdown files
        files.push({
          name: item.name.replace(".md", ""),
          path: path.join(relativePath, item.name),
          isDirectory: false,
          icon: "📄",
          fileType: "markdown",
        });
      } else if (item.name.endsWith(".js")) {
        // Add JavaScript files
        files.push({
          name: item.name,
          path: path.join(relativePath, item.name),
          isDirectory: false,
          icon: "📜",
          fileType: "javascript",
        });
      }
    });
  } catch (error) {
    console.error("Error reading directory:", dirPath, error);
  }

  return files.sort((a, b) => {
    // Directories first, then files
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
};

/**
 * Get folder structure from root directory
 * @returns {Promise<Object>} Folder structure object
 */
export const getFolderStructure = async () => {
  try {
    const items = await fs.promises.readdir(rootDirectory, {
      withFileTypes: true,
    });

    const folders = items.filter(shouldIncludeDirectory).reduce((acc, item) => {
      acc[item.name] = {
        icon: getFolderIcon(item.name),
        files: [],
        isDirectory: true,
      };
      return acc;
    }, {});

    return folders;
  } catch (error) {
    console.error("Error reading folder structure:", error.message);
    throw new Error("Failed to fetch folder structure");
  }
};

/**
 * Get files in a specific folder
 * @param {string} folderName - Name of the folder
 * @returns {Array} Array of files in the folder
 */
export const getFilesInFolder = (folderName) => {
  try {
    const folderPath = path.join(rootDirectory, folderName);

    if (!fs.existsSync(folderPath)) {
      throw new Error("Folder not found");
    }

    // Pass empty string as relative path to avoid duplicating folder name
    const files = getFilesRecursively(folderPath, "");
    return files;
  } catch (error) {
    console.error("Error reading files:", error.message);
    throw new Error("Failed to read files");
  }
};

/**
 * Get markdown file content
 * @param {string} folderName - Name of the folder
 * @param {string} fileName - Name of the file
 * @returns {Object} Object containing content and filePath
 */
export const getFileContent = (folderName, fileName) => {
  try {
    // Try different possible file paths
    const possiblePaths = [
      path.join(rootDirectory, folderName, fileName),
      path.join(rootDirectory, folderName, fileName + ".md"),
      path.join(rootDirectory, folderName, fileName, "README.md"),
    ];

    let filePath = null;
    let content = "";

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        break;
      }
    }

    if (!filePath) {
      // If no direct file found, look for any .md files in the subfolder
      const subFolderPath = path.join(rootDirectory, folderName, fileName);
      if (
        fs.existsSync(subFolderPath) &&
        fs.statSync(subFolderPath).isDirectory()
      ) {
        const mdFiles = fs
          .readdirSync(subFolderPath)
          .filter((f) => f.endsWith(".md"));
        if (mdFiles.length > 0) {
          filePath = path.join(subFolderPath, mdFiles[0]);
        }
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "utf8");
      // Return path relative to root
      return {
        content,
        filePath: filePath.replace(rootDirectory, ""),
      };
    } else {
      throw new Error(
        `File not found. Searched: ${possiblePaths
          .map((p) => p.replace(rootDirectory, ""))
          .join(", ")}`
      );
    }
  } catch (error) {
    console.error("Error reading file:", error.message);
    throw new Error(`Failed to read file: ${error.message}`);
  }
};
