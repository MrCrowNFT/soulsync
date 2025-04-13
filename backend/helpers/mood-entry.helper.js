import {MoodEntry} from "../models/mood-entry.model.js";
import { formatMoodData } from "../utils/mood-entry.util.js";

//Helper functions
export const getWeeklyAverages = async (userId) => {
  const weeklyAverages = await MoodEntry.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        }, //Last 7 days, i think this should work, confusing af
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" }, //group by day of the week
        averageMood: { $avg: "$mood" },
      },
    },
    {
      $project: {
        _id: 0, //exclude id on the output
        day: "$_id", //rename id to day
        averageMood: 1, //add averageMood to output
      },
    },
    {
      $sort: { day: 1 }, // sort by day of the week
    },
  ]);

  return weeklyAverages;
};

export const getMonthlyAverages = async (userId) => {
  const monthlyAverages = await MoodEntry.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), //again confusing, but should give 30 days
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
  return monthlyAverages;
};

export const getYearlyAverages = async (userId) => {
  const yearlyAverages = await MoodEntry.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        }, // last 12 months
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

  return yearlyAverages;
};

//Getter functions
export const getMoodAverages = async (userId, type) => {
  let averages;
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

  return formatMoodData(averages, type);
};
