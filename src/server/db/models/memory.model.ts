import mongoose, { type Model } from "mongoose";
import { type IMemory } from "@/types/memory";

// Mongoose schema for memory
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
    people: {
      type: [String], // Extracted names from chat
      default: [],
    },
    pets: {
      type: [String], // Extracted pet names (if mentioned)
      default: [],
    },
    locations: {
      type: [String], // Extracted locations
      default: [],
    },
    emotions: {
      type: [String], // Extracted emotions
      default: [],
    },
    topics: {
      type: [String], // Keywords from conversation
      default: [],
    },
  },
  {
    timestamps: true, // add createdAt and updatedAt fields
  },
);

// Add an index on userId for faster queries
memorySchema.index({ userId: 1 });

// for text search
memorySchema.index({
  memory: "text",
  people: "text",
  locations: "text",
  pets: "text",
  topics: "text",
});

// Ensures that the model is reused if it already exists (for hot reloading)
export const MemoryModel: Model<IMemory> =
  mongoose.models.Memory ?? mongoose.model<IMemory>("Memory", memorySchema);
