import express from "express";
import { deleteUserAccount, updateUser } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.put("/", updateUser);
userRouter.delete("/", deleteUserAccount);

export default userRouter;
