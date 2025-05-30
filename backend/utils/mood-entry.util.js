import logger from "./logger.js";

export const formatMoodData = (averages, type) => {
  const startTime = Date.now();

  logger.info("Mood data formatting started", {
    type,
    dataPointsCount: averages?.length || 0,
    validType: ["weekly", "monthly", "yearly"].includes(type),
  });

  try {
    if (!averages || !Array.isArray(averages)) {
      logger.warn("Invalid averages data provided", {
        type,
        averagesType: typeof averages,
        isArray: Array.isArray(averages),
      });
      return {
        labels: [],
        datasets: [
          {
            label: "Mood",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          },
        ],
      };
    }

    if (averages.length === 0) {
      logger.info("Empty averages array provided", { type });
      return {
        labels: [],
        datasets: [
          {
            label: "Mood",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          },
        ],
      };
    }

    // Generate labels based on type
    const labels = averages.map((entry, index) => {
      if (!entry) {
        logger.warn("Null/undefined entry found in averages", {
          type,
          entryIndex: index,
          totalEntries: averages.length,
        });
        return "";
      }

      if (type === "weekly") return `Day ${entry.day || index + 1}`;
      if (type === "monthly") return `Day ${entry.day || index + 1}`;
      if (type === "yearly") return `Month ${entry.month || index + 1}`;

      logger.warn("Unknown mood data type", {
        type,
        supportedTypes: ["weekly", "monthly", "yearly"],
      });
      return "";
    });

    // Extract mood values
    const data = averages.map((entry, index) => {
      if (!entry) {
        logger.warn("Missing entry data", {
          type,
          entryIndex: index,
        });
        return 0;
      }

      const moodValue = entry.averageMood;
      if (typeof moodValue !== "number" || isNaN(moodValue)) {
        logger.warn("Invalid mood value found", {
          type,
          entryIndex: index,
          moodValue,
          moodType: typeof moodValue,
        });
        return 0;
      }

      return moodValue;
    });

    const duration = Date.now() - startTime;
    const validDataPoints = data.filter((value) => value !== 0).length;
    const moodRange =
      data.length > 0
        ? {
            min: Math.min(...data.filter((v) => v !== 0)),
            max: Math.max(...data.filter((v) => v !== 0)),
            average: data.reduce((acc, val) => acc + val, 0) / data.length,
          }
        : null;

    logger.info("Mood data formatted successfully", {
      type,
      totalDataPoints: averages.length,
      validDataPoints,
      labelsGenerated: labels.length,
      duration: `${duration}ms`,
      moodRange,
    });

    const formattedData = {
      labels,
      datasets: [
        {
          label: "Mood",
          data,
          borderColor: "#3b82f6", // line color -> up for change
          backgroundColor: "rgba(59, 130, 246, 0.2)", // fill color-> up for change
        },
      ],
    };

    return formattedData;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Mood data formatting error", {
      error: error.message,
      stack: error.stack,
      type,
      averagesLength: averages?.length || 0,
      duration: `${duration}ms`,
    });

    // Return safe fallback
    return {
      labels: [],
      datasets: [
        {
          label: "Mood",
          data: [],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
        },
      ],
    };
  }
};
