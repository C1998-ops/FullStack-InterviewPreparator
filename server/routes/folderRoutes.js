import { Router } from "express";
import { getFolderStructure } from "../controller/File.Controller.js";

const folderRouter = Router();

/**
 * GET /api/folders
 * Get all folders from the root directory
 */
folderRouter.get("/", async (req, res, next) => {
  try {
    const folders = await getFolderStructure();
    
    if (!folders || Object.keys(folders).length === 0) {
      return res.status(404).json({ 
        error: "No folders found",
        message: "The root directory contains no valid folders" 
      });
    }
    
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

export default folderRouter;
