import { type Document } from "mongoose";
import type mongoose from "mongoose";

// Define the interface for TypeScript
export interface IMoodEntry extends Document {
  userId: mongoose.Types.ObjectId;
  mood: number;
  createdAt?: Date;
  updatedAt?: Date;
}
