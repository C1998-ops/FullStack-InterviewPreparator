import { Router } from "express";
import { googlePKCEAuth } from "../controller/Auth.Controller.js";
const authRouter = Router();
authRouter.post("/pkce-token", googlePKCEAuth);
export default authRouter;
