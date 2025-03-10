import { MemoryModel } from "../models/memory.model";
import { MemorySchema } from "../schemas/memory.schema";
import type { Memory } from "../schemas/memory.schema";
import mongoose from "mongoose";

export const MemoryRepository = {
  create: async (data: Memory) => {
    const parsedData = MemorySchema.parse(data); // Validate input
    const newMemory = await MemoryModel.create(parsedData);
    return newMemory;
  },

  getById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    return await MemoryModel.findById(id).exec();
  },

  getAllByUserId: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");
    return await MemoryModel.find({ userId }).exec();
  },

  updateById: async (id: string, updateData: Partial<Memory>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    const parsedData = MemorySchema.partial().parse(updateData); // Validate update fields
    return await MemoryModel.findByIdAndUpdate(id, parsedData, {
      new: true,
      runValidators: true,
    }).exec();
  },

  deleteById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    return await MemoryModel.findByIdAndDelete(id).exec();
  },
};
