import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memory: {
      //main memory as string
      type: String,
      required: true,
    },
    //All diferent topics and subject to remember
    people: {
      type: [String],
      default: [],
    },
    pets: {
      type: [String],
      default: [],
    },
    locations: {
      type: [String],
      default: [],
    },
    emotions: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    likes: {
      type: [String],
      default: [],
    },
    dislikes: {
      type: [String],
      default: [],
    },
    goals: {
      type: [String],
      default: [],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    personality: {
      type: [String],
      default: [],
    },
    // For vector search (future RAG)
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
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
