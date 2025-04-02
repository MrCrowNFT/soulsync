import mongoose from "mongoose";

//mongoose schema
const moodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Mood must be an integer between 1 and 5",
      },
    }, // scale: 1 (Very Sad) to 5 (Very Happy)->need to set this up in the front end
  },
  {
    timestamps: true, // add createdAt and updatedAt fields -> useful for dashboard
  }
);

// add an index on userId for faster queries
moodEntrySchema.index({ userId: 1 });

export const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);
