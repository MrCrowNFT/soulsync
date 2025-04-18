import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRouter from "./routers/auth.routes.js";
import moodEntryRouter from "./routers/mood-entry.routes.js";
import { authenticate } from "./middleware/auth.js";
import chatEntryRouter from "./routers/chat-entry.routes.js";
import userRouter from "./routers/user.routes.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", //only accept from here where frontend is running
    credentials: true, //need this for the cookies to work cross origin
  })
);

app.use("/auth", authRouter);
app.use("/mood", authenticate, moodEntryRouter);
app.use("/chat", authenticate, chatEntryRouter);
app.use("/user", authenticate, userRouter);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
