import { Memory } from "../models/memory.model.js";
import { MoodEntry } from "../models/mood-entry.model.js";
import { getAssessment } from "../utils/assessment.util.js";
import mongoose from "mongoose";

/**
 * Get an assessment of the user's mental health based on recent mood entries and memories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Assessment data
 */
export const getUserAssessment = async (req, res) => {
  try {
    const userId = req.user._id;

    // get all mood entries from last 7 days
    const recentMoodEntries = await MoodEntry.find({
      userId: userId,
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    }).sort({ createdAt: -1 }); // Sort by most recent first

    // get all memories from last 7 days
    const recentMemories = await Memory.find({
      userId: userId,
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    }).sort({ createdAt: -1 }); // most recent first

    // Check if enough data for a meaningful assessment ->if not just cancel it
    if (recentMoodEntries.length < 3 || recentMemories.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough data for assessment. Please track your mood and add memories for at least 3 days.",
        requiredEntries: {
          mood: 3,
          memories: 2,
          currentMood: recentMoodEntries.length,
          currentMemories: recentMemories.length,
        },
      });
    }

    // average mood
    const moodSum = recentMoodEntries.reduce(
      (sum, entry) => sum + entry.mood,
      0
    );
    const moodAverage = moodSum / recentMoodEntries.length;

    // determine mood trend (increasing, decreasing, or stable)
    let moodTrend = "stable";
    if (recentMoodEntries.length >= 3) {
      const firstHalf = recentMoodEntries.slice(
        Math.floor(recentMoodEntries.length / 2)
      );
      const secondHalf = recentMoodEntries.slice(
        0,
        Math.floor(recentMoodEntries.length / 2)
      );

      const firstHalfAvg =
        firstHalf.reduce((sum, entry) => sum + entry.mood, 0) /
        firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, entry) => sum + entry.mood, 0) /
        secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;
      if (difference > 0.5) {
        moodTrend = "improving";
      } else if (difference < -0.5) {
        moodTrend = "declining";
      }
    }

    // get ai assessment
    const assessment = await getAssessment(
      recentMoodEntries,
      recentMemories,
      moodAverage,
      moodTrend
    );

    return res.status(200).json({
      success: true,
      data: {
        timeframe: "7 days",
        moodAverage: parseFloat(moodAverage.toFixed(2)),
        moodTrend,
        moodEntriesCount: recentMoodEntries.length,
        memoriesCount: recentMemories.length,
        assessment,
      },
    });
  } catch (error) {
    console.error("Error generating user assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate assessment",
      error: error.message,
    });
  }
};
