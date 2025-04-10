import { MoodEntry } from "../models/mood-entry.model";
import mongoose from "mongoose";
import { getMoodAverages } from "../helpers/mood-entry.helper";

export const newMoodEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const mood = req.body;

    if (!userId || !mood) {
      return res
        .status(400)
        .json({ success: false, error: "userId and mood are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    const moodValue = parseInt(mood, 10);
    if (isNaN(moodValue)) {
      return res
        .status(400)
        .json({ success: false, error: "Mood must be a number" });
    }
    if (moodValue < 1 || moodValue > 5) {
      return res
        .status(400)
        .json({ success: false, error: "Mood must be between 1 and 5" });
    }

    const newMoodEntry = new MoodEntry({
      userId: userId,
      mood: moodValue,
    });

    await newMoodEntry.save();
    return res.status(201).json({ success: true, data: newMoodEntry });
  } catch (error) {
    console.error("Error in newEntry:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    const type = req.params;

    if (!userId || !type) {
      return res
        .status(400)
        .json({ success: false, error: "userId and type are required" });
      
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }
    const averages = await getMoodAverages(userId, type);
    return res.status(200).json({ success: true, data: averages });
  } catch (error) {
    console.error("Error in getEntries:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteMoodEntries = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    await MoodEntry.deleteMany({ userId: userId });

    return res.status(200).json({
      success: true,
      message: "All Mood entries deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMoodEntries:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

//todo the system is design to simply add and get, there's still no need for the
//todo update function, still need t
