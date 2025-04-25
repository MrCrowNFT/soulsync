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

//since vercel deploy different URLs, we add them all on the .env separated by ","
const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || [];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/mood", authenticate, moodEntryRouter);
app.use("/chat", authenticate, chatEntryRouter);
app.use("/user", authenticate, userRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server starting on port ${PORT}...`);
});
