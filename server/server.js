import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";

// Load environment variables from .env file
// Priority: .env file > system environment variables > auto-detection
dotenv.config();

// Set NODE_ENV if not already set
// For local development: Set NODE_ENV=development in server/.env
// For EC2 production: Set NODE_ENV=production in server/.env or it will auto-detect
if (!process.env.NODE_ENV) {
  // Auto-detect: Check if running on EC2 (common EC2 hostname patterns)
  const hostname = os.hostname();
  const isEC2 = hostname.includes("ip-") || hostname.includes("ec2");
  process.env.NODE_ENV = isEC2 ? "production" : "development";
  console.log(`⚠️  NODE_ENV not set, auto-detected as: ${process.env.NODE_ENV}`);
  console.log(`   Tip: Set NODE_ENV in server/.env for explicit control\n`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === "development";

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

app.use(cors(corsOptions));

// app.get("/test-api", (req, res) => {
//   res.json({ message: "API is working" });
// });
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
  const env = process.env.NODE_ENV || "development";
  const serverUrl = isDevelopment 
    ? `http://localhost:${port}` 
    : `http://100.52.122.71:${port}`;

  console.log(`📍 Environment: ${env.toUpperCase()}`);
  console.log(`🌐 Server URL: ${serverUrl}`);
  
  if (isDevelopment) {
    console.log(`\n💡 Development Mode:`);
    console.log(`   - Vite dev server: http://localhost:5173`);
    console.log(`   - API endpoint: http://localhost:${port}/api`);
  } else {
    console.log(`\n💡 Production Mode (EC2):`);
    console.log(`   - Server: ${serverUrl}`);
    console.log(`   - API endpoint: ${serverUrl}/api`);
  }
  console.log("=".repeat(50));
});
