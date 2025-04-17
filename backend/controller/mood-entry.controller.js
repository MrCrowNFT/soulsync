import { MoodEntry } from "../models/mood-entry.model.js";
import mongoose from "mongoose";
import { getMoodAverages } from "../helpers/mood-entry.helper.js";

export const newMoodEntry = async (req, res) => {
  try {
    console.log(`=== Starting newMoodEntry function ===`);
    console.log(`Request body:`, JSON.stringify(req.body));
    console.log(`Request user:`, JSON.stringify(req.user));

    const userId = req.user?._id;
    console.log(`Extracted userId: ${userId}`);

    const mood = req.body.mood || req.body;
    console.log(`Extracted mood data: ${mood}`);

    // Check if required fields exist
    if (!userId || !mood) {
      console.log(`Validation failed: Missing userId or mood`);
      return res
        .status(400)
        .json({ success: false, error: "userId and mood are required" });
    }

    // Validate userId format
    console.log(`Validating userId format: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid userId format: ${userId}`);
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    // Parse and validate mood value
    console.log(`Parsing mood value: ${mood}`);
    const moodValue = parseInt(mood, 10);
    console.log(`Parsed mood value: ${moodValue}`);

    if (isNaN(moodValue)) {
      console.log(`Invalid mood value (not a number): ${mood}`);
      return res
        .status(400)
        .json({ success: false, error: "Mood must be a number" });
    }

    if (moodValue < 1 || moodValue > 5) {
      console.log(`Mood value out of range: ${moodValue}`);
      return res
        .status(400)
        .json({ success: false, error: "Mood must be between 1 and 5" });
    }

    // Create new mood entry
    console.log(
      `Creating new MoodEntry document with userId: ${userId}, mood: ${moodValue}`
    );
    const newMoodEntry = new MoodEntry({
      userId: userId,
      mood: moodValue,
    });

    console.log(`MoodEntry object created:`, JSON.stringify(newMoodEntry));

    // Save to database
    console.log(`Attempting to save mood entry to database...`);
    await newMoodEntry.save();
    console.log(
      `New mood entry saved successfully with id: ${newMoodEntry._id}`
    );

    // Send response
    return res.status(201).json({ success: true, data: newMoodEntry });
  } catch (error) {
    console.error(`=== ERROR in newMoodEntry ===`);
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

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
    console.log(`Getting mood entries for user: ${userId}`);
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
    console.log(`Calculating mood averages`);
    const averages = await getMoodAverages(userId, type);

    console.log(
      `Mood entries averages calculated successfully.\nMood entries retrieval complete `
    );
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

//todo user can not yet delete mood entries
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

//* the system is design to simply add and get, there's still no need for the update function
