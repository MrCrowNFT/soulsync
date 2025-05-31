import { Memory } from "../models/memory.model.js";
import { MoodEntry } from "../models/mood-entry.model.js";
import { getAssessment } from "../utils/assessment.util.js";
import logger from "../utils/logger.js";

/**
 * Get an assessment of the user's mental health based on recent mood entries and memories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Assessment data
 */
export const getUserAssessment = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    requestLogger.info("User assessment process started", {
      userId,
      timeframe: "7 days",
      cutoffDate: sevenDaysAgo,
    });

    // Get all mood entries from last 7 days
    const moodQueryStart = Date.now();
    const recentMoodEntries = await MoodEntry.find({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });
    const moodQueryDuration = Date.now() - moodQueryStart;

    // Get all memories from last 7 days
    const memoryQueryStart = Date.now();
    const recentMemories = await Memory.find({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });
    const memoryQueryDuration = Date.now() - memoryQueryStart;

    requestLogger.info("Data retrieval completed", {
      userId,
      moodEntriesCount: recentMoodEntries.length,
      memoriesCount: recentMemories.length,
      moodQueryDuration: `${moodQueryDuration}ms`,
      memoryQueryDuration: `${memoryQueryDuration}ms`,
      dateRange: {
        from: sevenDaysAgo,
        to: new Date(),
      },
    });

    // Check if enough data for a meaningful assessment
    const hasEnoughMoodData = recentMoodEntries.length >= 3;
    const hasEnoughMemoryData = recentMemories.length >= 2;

    if (!hasEnoughMoodData || !hasEnoughMemoryData) {
      requestLogger.warn("Assessment failed - insufficient data", {
        userId,
        moodEntriesCount: recentMoodEntries.length,
        memoriesCount: recentMemories.length,
        hasEnoughMoodData,
        hasEnoughMemoryData,
        requiredMood: 3,
        requiredMemories: 2,
      });

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

    // Calculate average mood
    const moodSum = recentMoodEntries.reduce(
      (sum, entry) => sum + entry.mood,
      0
    );
    const moodAverage = moodSum / recentMoodEntries.length;

    // Calculate mood trend (improving, declining, or stable)
    let moodTrend = "stable";
    let trendAnalysis = null;

    if (recentMoodEntries.length >= 3) {
      const midPoint = Math.floor(recentMoodEntries.length / 2);
      const firstHalf = recentMoodEntries.slice(midPoint); // older entries
      const secondHalf = recentMoodEntries.slice(0, midPoint); // newer entries

      const firstHalfAvg =
        firstHalf.reduce((sum, entry) => sum + entry.mood, 0) /
        firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, entry) => sum + entry.mood, 0) /
        secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;

      trendAnalysis = {
        olderPeriodAvg: parseFloat(firstHalfAvg.toFixed(2)),
        newerPeriodAvg: parseFloat(secondHalfAvg.toFixed(2)),
        difference: parseFloat(difference.toFixed(2)),
        threshold: 0.5,
      };

      if (difference > 0.5) {
        moodTrend = "improving";
      } else if (difference < -0.5) {
        moodTrend = "declining";
      }
    }

    requestLogger.info("Mood analysis completed", {
      userId,
      moodAverage: parseFloat(moodAverage.toFixed(2)),
      moodTrend,
      trendAnalysis,
      moodEntriesAnalyzed: recentMoodEntries.length,
    });

    // Get AI assessment
    const assessmentStart = Date.now();
    const assessment = await getAssessment(
      recentMoodEntries,
      recentMemories,
      moodAverage,
      moodTrend
    );
    const assessmentDuration = Date.now() - assessmentStart;

    const responseData = {
      timeframe: "7 days",
      moodAverage: parseFloat(moodAverage.toFixed(2)),
      moodTrend,
      moodEntriesCount: recentMoodEntries.length,
      memoriesCount: recentMemories.length,
      assessment,
    };

    requestLogger.info("User assessment completed successfully", {
      userId,
      assessmentDuration: `${assessmentDuration}ms`,
      totalProcessDuration: `${Date.now() - moodQueryStart}ms`,
      moodAverage: responseData.moodAverage,
      moodTrend: responseData.moodTrend,
      dataPoints: {
        moodEntries: responseData.moodEntriesCount,
        memories: responseData.memoriesCount,
      },
      hasAssessment: !!assessment,
      assessmentLength: assessment ? assessment.length : 0,
    });

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    requestLogger.error("User assessment process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      errorName: error.name,
      timeframe: "7 days",
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate assessment",
      error: error.message,
    });
  }
};
