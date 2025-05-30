import { MoodEntry } from "../models/mood-entry.model.js";
import mongoose from "mongoose";
import { getMoodAverages } from "../helpers/mood-entry.helper.js";
import logger from "../utils/logger.js";

export const newMoodEntry = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user?._id;
    const mood = req.body.mood || req.body;

    requestLogger.info("New mood entry process started", {
      userId,
      moodInput: mood,
      hasUserId: !!userId,
      hasMood: !!mood,
      requestBodyKeys: Object.keys(req.body),
    });

    // Check if required fields exist
    if (!userId || !mood) {
      requestLogger.warn("New mood entry failed - missing required fields", {
        hasUserId: !!userId,
        hasMood: !!mood,
      });
      return res
        .status(400)
        .json({ success: false, error: "userId and mood are required" });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      requestLogger.warn("New mood entry failed - invalid userId format", {
        userId,
      });
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    // Parse and validate mood value
    const moodValue = parseInt(mood, 10);

    requestLogger.info("Mood value validation", {
      userId,
      originalMood: mood,
      parsedMood: moodValue,
      isValidNumber: !isNaN(moodValue),
      isInRange: moodValue >= 1 && moodValue <= 5,
    });

    if (isNaN(moodValue)) {
      requestLogger.warn(
        "New mood entry failed - invalid mood value (not a number)",
        {
          userId,
          moodInput: mood,
        }
      );
      return res
        .status(400)
        .json({ success: false, error: "Mood must be a number" });
    }

    if (moodValue < 1 || moodValue > 5) {
      requestLogger.warn("New mood entry failed - mood value out of range", {
        userId,
        moodValue,
        validRange: "1-5",
      });
      return res
        .status(400)
        .json({ success: false, error: "Mood must be between 1 and 5" });
    }

    // Create and save new mood entry
    const startTime = Date.now();
    const newMoodEntry = new MoodEntry({
      userId: userId,
      mood: moodValue,
    });

    await newMoodEntry.save();
    const saveDuration = Date.now() - startTime;

    requestLogger.info("New mood entry saved successfully", {
      userId,
      moodEntryId: newMoodEntry._id,
      moodValue,
      saveDuration: `${saveDuration}ms`,
      createdAt: newMoodEntry.createdAt,
    });

    return res.status(201).json({ success: true, data: newMoodEntry });
  } catch (error) {
    requestLogger.error("New mood entry process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      requestBody: {
        mood: req.body.mood || req.body,
        bodyKeys: Object.keys(req.body || {}),
      },
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getEntries = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;
    const type = req.params.type;

    requestLogger.info("Get mood entries process started", {
      userId,
      type,
      requestPath: req.path,
      requestMethod: req.method,
    });

    // Check if required parameters exist
    if (!userId || !type) {
      requestLogger.warn(
        "Get mood entries failed - missing required parameters",
        {
          hasUserId: !!userId,
          hasType: !!type,
          userId,
          type,
        }
      );
      return res
        .status(400)
        .json({ success: false, error: "userId and type are required" });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      requestLogger.warn("Get mood entries failed - invalid userId format", {
        userId,
        type,
      });
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    // Calculate mood averages
    const calculationStart = Date.now();
    const averages = await getMoodAverages(userId, type);
    const calculationDuration = Date.now() - calculationStart;

    const hasData = averages && averages.labels && averages.labels.length > 0;
    const datasetsInfo =
      averages?.datasets?.map((ds) => ({
        label: ds.label,
        dataLength: ds.data?.length || 0,
        hasData: ds.data && ds.data.length > 0,
      })) || [];

    requestLogger.info("Mood averages calculation completed", {
      userId,
      type,
      calculationDuration: `${calculationDuration}ms`,
      hasData,
      labelsCount: averages?.labels?.length || 0,
      datasetsCount: averages?.datasets?.length || 0,
      datasetsInfo,
    });

    return res.status(200).json({ success: true, data: averages });
  } catch (error) {
    requestLogger.error("Get mood entries process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      requestParams: req.params,
      requestPath: req.path,
      requestMethod: req.method,
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteMoodEntries = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;

    requestLogger.info("Delete mood entries process started", {
      userId,
    });

    if (!userId) {
      requestLogger.warn("Delete mood entries failed - no userId");
      return res
        .status(400)
        .json({ success: false, error: "userId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      requestLogger.warn("Delete mood entries failed - invalid userId format", {
        userId,
      });
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    const startTime = Date.now();
    const deleteResult = await MoodEntry.deleteMany({ userId: userId });
    const deleteDuration = Date.now() - startTime;

    requestLogger.info("Mood entries deleted successfully", {
      userId,
      deletedCount: deleteResult.deletedCount,
      deleteDuration: `${deleteDuration}ms`,
    });

    return res.status(200).json({
      success: true,
      message: "All Mood entries deleted successfully",
    });
  } catch (error) {
    requestLogger.error("Delete mood entries process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
