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
};
