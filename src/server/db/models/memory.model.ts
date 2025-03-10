import mongoose, { type Model } from "mongoose";
import { type IMemory } from "@/types/memory";

//mongoose schema
const memorySchema = new mongoose.Schema<IMemory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memory: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // add createdAt and updatedAt fields -> useful for dashboard
  },
);

// add an index on userId for faster queries
memorySchema.index({ userId: 1 });

//to  ensures that the model is reused if it already exists (for hot reloading).
export const MemoryModel: Model<IMemory> =
  mongoose.models.Memory ?? mongoose.model<IMemory>("Memory", memorySchema);
