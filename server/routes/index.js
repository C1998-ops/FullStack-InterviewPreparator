import { Router } from "express";
import folderRouter from "./folderRoutes.js";
import fileRouter from "./fileRoutes.js";
import resumeRouter from "./resumeRoutes.js";
import authRouter from "./authRoutes.js";

const apiRouter = Router();

// Mount routes
apiRouter.use("/folders", folderRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/file", fileRouter); // Also mount at /file for singular path
apiRouter.use("/", resumeRouter); // Resume routes are at root level (/api/resume-analyser)
apiRouter.use("/auth", authRouter);
export default apiRouter;
