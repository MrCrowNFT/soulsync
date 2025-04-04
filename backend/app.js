import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import dotenv from "dotenv";
import authRouter from "./routers/auth.routes";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors()); //allow all origins for now

app.use("/auth", authRouter);

const PORT = process.env.PORT || 5500;
app.liste(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
