import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  signup,
} from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshAccessToken);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
