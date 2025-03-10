import mongoose from "mongoose";

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
