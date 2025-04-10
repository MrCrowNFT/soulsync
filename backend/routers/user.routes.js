import express from "express";
import { deleteUserAccount, updateUser } from "../controller/user.controller";

const userRouter = express.Router();

userRouter.put("/", updateUser);
userRouter.delete("/", deleteUserAccount);

export default userRouter;
