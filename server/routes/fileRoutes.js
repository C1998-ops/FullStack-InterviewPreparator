import { Router } from "express";
import { getFilesInFolder, getFileContent } from "../controller/File.Controller.js";

const fileRouter = Router();

/**
 * GET /api/file/:folder/:file(*) or /api/files/:folder/:file(*)
 * Get markdown file content
 * This route must come first as it's more specific
 */
fileRouter.get("/:folder/:file(*)", (req, res, next) => {
  try {
    const folderName = decodeURIComponent(req.params.folder);
    const fileName = decodeURIComponent(req.params.file);
    const result = getFileContent(folderName, fileName);
    res.json(result);
  } catch (error) {
    if (error.message.includes("File not found")) {
      return res.status(404).json({
        error: "File not found",
        details: error.message,
      });
    }
    res.status(500).json({
      error: "Failed to read file",
      details: error.message,
    });
  }
});

/**
 * GET /api/files/:folder
 * Get files in a specific folder
 * This route comes after the more specific route above
 */
fileRouter.get("/:folder", (req, res, next) => {
  try {
    const folderName = decodeURIComponent(req.params.folder);
    const files = getFilesInFolder(folderName);
    res.json(files);
  } catch (error) {
    if (error.message === "Folder not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default fileRouter;

