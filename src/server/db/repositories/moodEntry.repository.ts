import { MoodEntryModel } from "../models/moodEntry.model";
import { MoodEntrySchema } from "../schemas/moodEntry.schema";
import type { MoodEntry } from "../schemas/moodEntry.schema";
import mongoose from "mongoose";

export const MoodEntryRepository = {
  create: async (data: MoodEntry) => {
    const parsedData = MoodEntrySchema.parse(data); //validate
    const newMoodEntry = await MoodEntryModel.create(parsedData);
    return newMoodEntry;
  },

  getById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error();
    return await MoodEntryModel.findById(id).exec();
  },
  getAllByUserId: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");
    return await MoodEntryModel.find({ userId }).exec();
  },

  //need a method for querying it, to get specific dates ranges of entries

  updateById: async (id: string, updateData: Partial<MoodEntry>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    const parsedData = MoodEntrySchema.partial().parse(updateData); // Validate update fields
    return await MoodEntryModel.findByIdAndUpdate(id, parsedData, {
      new: true,
      runValidators: true,
    }).exec();
  },
  deleteById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    return await MoodEntryModel.findByIdAndDelete(id).exec();
  },
  deleteAllByUserId: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");
    return await MoodEntryModel.deleteMany({ userId }).exec();
  },

  // New methods for averages
  getWeeklyAverages: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");

    const userIdObj = new mongoose.Types.ObjectId(userId);
    return await MoodEntryModel.aggregate([
      {
        $match: {
          userId: userIdObj,
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
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
        $sort: { day: 1 },
      },
    ]);
  },

  getMonthlyAverages: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");

    const userIdObj = new mongoose.Types.ObjectId(userId);
    return await MoodEntryModel.aggregate([
      {
        $match: {
          userId: userIdObj,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
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
        $sort: { day: 1 },
      },
    ]);
  },

  getYearlyAverages: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");

    const userIdObj = new mongoose.Types.ObjectId(userId);
    return await MoodEntryModel.aggregate([
      {
        $match: {
          userId: userIdObj,
          createdAt: {
            $gte: new Date(
              new Date().setFullYear(new Date().getFullYear() - 1),
            ),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
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
        $sort: { month: 1 },
      },
    ]);
  },

  getMoodAverages: async (
    userId: string,
    type: "weekly" | "monthly" | "yearly",
  ) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");

    let averages;
    switch (type) {
      case "weekly":
        averages = await MoodEntryRepository.getWeeklyAverages(userId);
        break;
      case "monthly":
        averages = await MoodEntryRepository.getMonthlyAverages(userId);
        break;
      case "yearly":
        averages = await MoodEntryRepository.getYearlyAverages(userId);
        break;
      default:
        throw new Error("Invalid type. Use 'weekly', 'monthly', or 'yearly'.");
    }

    // Add the formatMoodData function or import it
    return formatMoodData(averages, type);
  },
};
