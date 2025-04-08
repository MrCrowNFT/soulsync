import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import dotenv from "dotenv";
import authRouter from "./routers/auth.routes";
import moodEntryRouter from "./routers/mood-entry.routes";
import { authenticate } from "./middleware/auth";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors()); //allow all origins for now

app.use("/auth", authRouter);
app.use("/mood", authenticate, moodEntryRouter);

const PORT = process.env.PORT || 5500;
app.liste(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
