import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
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
  }
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

export const Memory = mongoose.model("Memory", memorySchema);
