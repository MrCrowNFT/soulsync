import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import dotenv from "dotenv";
import authRouter from "./routers/auth.routes";
import moodEntryRouter from "./routers/mood-entry.routes";
import { authenticate } from "./middleware/auth";
import chatEntryRouter from "./routers/chat-entry.routes";
import userRouter from "./routers/user.routes";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors()); //allow all origins for now

app.use("/auth", authRouter);
app.use("/mood", authenticate, moodEntryRouter);
app.use("/chat", authenticate, chatEntryRouter);
app.use("/user", authenticatem, userRouter);

const PORT = process.env.PORT || 5500;
app.liste(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
