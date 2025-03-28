import mongoose, { type Model } from "mongoose";
import { type IMoodEntry } from "@/types/moodEntry";

//mongoose schema
const moodEntrySchema = new mongoose.Schema<IMoodEntry>(
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
  },
);

// add an index on userId for faster queries
moodEntrySchema.index({ userId: 1 });

//to  ensures that the model is reused if it already exists (for hot reloading).
export const MoodEntryModel: Model<IMoodEntry> =
  mongoose.models.MoodEntry ??
  mongoose.model<IMoodEntry>("MoodEntry", moodEntrySchema);
