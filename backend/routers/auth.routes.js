import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  signup,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshAccessToken);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
