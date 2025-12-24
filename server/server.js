import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const clientDistPath = path.join(__dirname, "../client/dist");
const clientSrcPath = path.join(__dirname, "../client");
const staticDir = fs.existsSync(clientDistPath)
  ? clientDistPath
  : clientSrcPath;

// Serve static files (prefer built assets when available)
app.use(express.static(staticDir));

// Middleware for parsing JSON and handling file uploads
// Increase body size limits for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use("/api", apiRouter);

// Catch-all handler: send back React app for client-side routing
// This must be after all API routes
app.get("*", (req, res) => {
  // Only handle non-API routes
  if (!req.path.startsWith("/api")) {
    const indexPath = path.join(staticDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res
        .status(404)
        .send('Client build not found. Run "npm run build" first.');
    }
  }
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Interview Prep Server running at http://localhost:${port}`);
  console.log(`Serving static files from: ${staticDir}`);
});
