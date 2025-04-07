import mongoose from "mongoose";

//todo check the preferences in previus versions
//todo check if we are actually using this one, or move back to preferences since
//todo now we can use better ai tools since no ts restrictions
//todo maybe combine preferences with memories?
//todo add likes and dislikes, goals, hobbies, personality (of the user, need to make the distintion)
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
