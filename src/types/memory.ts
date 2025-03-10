import mongoose, { Document } from "mongoose";

// Define the interface for TypeScript
export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  memory: string;
  createdAt?: Date;
  updatedAt?: Date;
}
