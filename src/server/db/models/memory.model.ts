import mongoose from "mongoose";
import { z } from "zod";

//zod schema validation
export const MemorySchema = z.object({
  userId: z.string().min(1),
  memory: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

//type
export type Memory = z.infer<typeof MemorySchema>;

//mongoose schema
const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
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
export const MemoryModel =
  mongoose.models.MemoryModel ?? mongoose.model("Memory", memorySchema);
