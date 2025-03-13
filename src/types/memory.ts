import { type Document } from "mongoose";
import type mongoose from "mongoose";

// Define the interface for TypeScript
export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId | string;
  memory: string;
  people?: string[];
  pets?: string[];
  locations?: string[];
  emotions?: string[];
  topics?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
