import { MoodEntry } from "../models/mood-entry.model.js";
import { formatMoodData } from "../utils/mood-entry.util.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

//Helper functions
export const getWeeklyAverages = async (userId) => {
  const startTime = Date.now();

  logger.info("Weekly mood averages calculation started", {
    userId,
    period: "last 7 days",
  });

  try {
    if (!userId) {
      logger.warn("Weekly averages failed - no userId provided");
      throw new Error("userId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn("Weekly averages failed - invalid userId format", {
        userId,
        userIdType: typeof userId,
      });
      throw new Error("Invalid userId format");
    }

    // Had to make the id into a mongoose object, otherwise the user could not be found because of how mongo db stores the userId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dateThreshold = new Date(
      new Date().setDate(new Date().getDate() - 7)
    );

    logger.debug("Executing weekly aggregation query", {
      userId,
      userObjectId: userObjectId.toString(),
      dateThreshold,
      daysBack: 7,
    });

    const aggregationStart = Date.now();
    const weeklyAverages = await MoodEntry.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: {
            $gte: dateThreshold, // Last 7 days
          },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // group by day of the week
          averageMood: { $avg: "$mood" },
        },
      },
      {
        $project: {
          _id: 0, // exclude id on the output
          day: "$_id", // rename id to day
          averageMood: 1, // add averageMood to output
        },
      },
      {
        $sort: { day: 1 }, // sort by day of the week
      },
    ]);

    const aggregationDuration = Date.now() - aggregationStart;
    const totalDuration = Date.now() - startTime;

    // Calculate statistics
    const moodValues = weeklyAverages.map((entry) => entry.averageMood);
    const stats =
      moodValues.length > 0
        ? {
            count: weeklyAverages.length,
            minMood: Math.min(...moodValues),
            maxMood: Math.max(...moodValues),
            overallAverage:
              moodValues.reduce((a, b) => a + b, 0) / moodValues.length,
          }
        : { count: 0 };

    logger.info("Weekly mood averages calculated successfully", {
      userId,
      resultsCount: weeklyAverages.length,
      aggregationDuration: `${aggregationDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      dateRange: {
        from: dateThreshold,
        to: new Date(),
      },
      stats,
    });

    return weeklyAverages;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("Weekly mood averages calculation error", {
      error: error.message,
      stack: error.stack,
      userId,
      totalDuration: `${totalDuration}ms`,
    });

    throw error;
  }
};

export const getMonthlyAverages = async (userId) => {
  const startTime = Date.now();

  logger.info("Monthly mood averages calculation started", {
    userId,
    period: "last 30 days",
  });

  try {
    if (!userId) {
      logger.warn("Monthly averages failed - no userId provided");
      throw new Error("userId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn("Monthly averages failed - invalid userId format", {
        userId,
        userIdType: typeof userId,
      });
      throw new Error("Invalid userId format");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dateThreshold = new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    );

    logger.debug("Executing monthly aggregation query", {
      userId,
      userObjectId: userObjectId.toString(),
      dateThreshold,
      monthsBack: 1,
    });

    const aggregationStart = Date.now();
    const monthlyAverages = await MoodEntry.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: {
            $gte: dateThreshold, // Last month
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" }, // group by day of the month
          averageMood: { $avg: "$mood" },
        },
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          averageMood: 1,
        },
      },
      {
        $sort: { day: 1 }, // Sort by day of the month
      },
    ]);

    const aggregationDuration = Date.now() - aggregationStart;
    const totalDuration = Date.now() - startTime;

    // Calculate statistics
    const moodValues = monthlyAverages.map((entry) => entry.averageMood);
    const stats =
      moodValues.length > 0
        ? {
            count: monthlyAverages.length,
            minMood: Math.min(...moodValues),
            maxMood: Math.max(...moodValues),
            overallAverage:
              moodValues.reduce((a, b) => a + b, 0) / moodValues.length,
            daysWithData: monthlyAverages.length,
          }
        : { count: 0 };

    logger.info("Monthly mood averages calculated successfully", {
      userId,
      resultsCount: monthlyAverages.length,
      aggregationDuration: `${aggregationDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      dateRange: {
        from: dateThreshold,
        to: new Date(),
      },
      stats,
    });

    return monthlyAverages;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("Monthly mood averages calculation error", {
      error: error.message,
      stack: error.stack,
      userId,
      totalDuration: `${totalDuration}ms`,
    });

    throw error;
  }
};

export const getYearlyAverages = async (userId) => {
  const startTime = Date.now();

  logger.info("Yearly mood averages calculation started", {
    userId,
    period: "last 12 months",
  });

  try {
    if (!userId) {
      logger.warn("Yearly averages failed - no userId provided");
      throw new Error("userId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn("Yearly averages failed - invalid userId format", {
        userId,
        userIdType: typeof userId,
      });
      throw new Error("Invalid userId format");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dateThreshold = new Date(
      new Date().setFullYear(new Date().getFullYear() - 1)
    );

    logger.debug("Executing yearly aggregation query", {
      userId,
      userObjectId: userObjectId.toString(),
      dateThreshold,
      yearsBack: 1,
    });

    const aggregationStart = Date.now();
    const yearlyAverages = await MoodEntry.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: {
            $gte: dateThreshold, // last 12 months
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // group by month
          averageMood: { $avg: "$mood" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          averageMood: 1,
        },
      },
      {
        $sort: { month: 1 }, // sort by month
      },
    ]);

    const aggregationDuration = Date.now() - aggregationStart;
    const totalDuration = Date.now() - startTime;

    // Calculate statistics
    const moodValues = yearlyAverages.map((entry) => entry.averageMood);
    const stats =
      moodValues.length > 0
        ? {
            count: yearlyAverages.length,
            minMood: Math.min(...moodValues),
            maxMood: Math.max(...moodValues),
            overallAverage:
              moodValues.reduce((a, b) => a + b, 0) / moodValues.length,
            monthsWithData: yearlyAverages.length,
          }
        : { count: 0 };

    logger.info("Yearly mood averages calculated successfully", {
      userId,
      resultsCount: yearlyAverages.length,
      aggregationDuration: `${aggregationDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      dateRange: {
        from: dateThreshold,
        to: new Date(),
      },
      stats,
    });

    return yearlyAverages;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("Yearly mood averages calculation error", {
      error: error.message,
      stack: error.stack,
      userId,
      totalDuration: `${totalDuration}ms`,
    });

    throw error;
  }
};

//Getter functions
export const getMoodAverages = async (userId, type) => {
  const startTime = Date.now();

  logger.info("Mood averages retrieval started", {
    userId,
    type,
    validTypes: ["weekly", "monthly", "yearly"],
  });

  try {
    if (!userId) {
      logger.warn("Mood averages failed - no userId provided");
      throw new Error("userId is required");
    }

    if (!type || !["weekly", "monthly", "yearly"].includes(type)) {
      logger.warn("Mood averages failed - invalid type", {
        type,
        validTypes: ["weekly", "monthly", "yearly"],
      });
      throw new Error("Invalid type. Use 'weekly', 'monthly', or 'yearly'.");
    }

    let averages;
    const aggregationStart = Date.now();

    switch (type) {
      case "weekly":
        averages = await getWeeklyAverages(userId);
        break;
      case "monthly":
        averages = await getMonthlyAverages(userId);
        break;
      case "yearly":
        averages = await getYearlyAverages(userId);
        break;
      default:
        throw new Error("Invalid type. Use 'weekly', 'monthly', or 'yearly'.");
    }

    const aggregationDuration = Date.now() - aggregationStart;

    logger.info("Raw averages retrieved, formatting data", {
      userId,
      type,
      rawDataCount: averages.length,
      aggregationDuration: `${aggregationDuration}ms`,
    });

    const formattingStart = Date.now();
    const formattedData = formatMoodData(averages, type);
    const formattingDuration = Date.now() - formattingStart;
    const totalDuration = Date.now() - startTime;

    logger.info("Mood averages retrieved and formatted successfully", {
      userId,
      type,
      rawDataCount: averages.length,
      formattedLabelsCount: formattedData.labels.length,
      formattedDataCount: formattedData.datasets[0].data.length,
      aggregationDuration: `${aggregationDuration}ms`,
      formattingDuration: `${formattingDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    return formattedData;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("Mood averages retrieval error", {
      error: error.message,
      stack: error.stack,
      userId,
      type,
      totalDuration: `${totalDuration}ms`,
    });

    throw error;
  }
};
