import express from "express";
import cors from "cors";
import connectDB from "./config/db";

const app = express();

app.use(express.json());
app.use(cors()); //allow all origins for now
