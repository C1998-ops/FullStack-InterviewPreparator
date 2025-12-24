import { Router } from "express";
import multer from "multer";
import { analyzeResume } from "../controller/Resume.Controller.js";
import {
  resumeAnalysisLimiter,
  trackOpenAICall,
} from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";

const resumeRouter = Router();

// Configure multer for file uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (note: comment says 50MB but code uses 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * POST /api/resume-analyser
 * Analyze resume PDF file
 * Rate limited: 10 requests per 15 minutes per IP (general)
 *               3 OpenAI API calls per minute (for non-cached requests)
 */
resumeRouter.post(
  "/resume-analyser",
  resumeAnalysisLimiter,
  authMiddleware,
  trackOpenAICall,
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file type
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({
          error: "Invalid file type",
          details: "Only PDF files are supported",
        });
      }

      const analysis = await analyzeResume(
        req.file.buffer,
        req.file.originalname,
        req.recordOpenAICall // Pass the function to track actual API calls
      );

      // Send rate limit info in response headers
      res.set({
        "X-RateLimit-Remaining": req.rateLimit?.remaining?.toString() || "0",
        "X-RateLimit-Reset":
          req.rateLimit?.resetTime?.toString() || Date.now().toString(),
        "X-Cache-Hit": analysis.cached ? "true" : "false",
      });

      res.json(analysis);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.message || "Failed to analyze resume",
        details: error.message || "Unknown error occurred",
      });
    }
  }
);

export default resumeRouter;
