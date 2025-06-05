import express from "express";
import {
  deleteUserAccount,
  updateUser,
} from "../controller/user.controller.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  // no limits or fileFilter since the uploader handles validation
});

const userRouter = express.Router();

userRouter.put("/", upload.single("photo"), updateUser);
userRouter.delete("/", deleteUserAccount);

export default userRouter;
