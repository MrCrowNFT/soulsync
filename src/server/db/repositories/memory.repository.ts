import { MemoryModel } from "../models/memory.model";
import { MemorySchema } from "../schemas/memory.schema";
import type { Memory } from "../schemas/memory.schema";
import type { IMemory } from "@/types/memory";
import mongoose from "mongoose";
import { processWithNLP } from "@/utils/nlp.utils";

export const MemoryRepository = {
  create: async (data: Memory) => {
    const parsedData = MemorySchema.parse(data); // Validate input
    const nlpResult = processWithNLP(parsedData.memory);
    const memoryData = { ...parsedData, ...nlpResult };
    return await MemoryModel.create(memoryData);
  },

  //get by memory id
  getById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
    return await MemoryModel.findById(id).sort({ createdAt: -1 }).lean();
  },

  /**
   * Get all memories linked to a specific user ID
   * @param userId - The user ID to search for
   * @returns An array of memory documents
   * @throws Error if the user ID is invalid or if the query fails
   */
  getAllByUserId: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");
    return await MemoryModel.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  //probably don't need this, you should be able to update your memory
  //maybe should add the method all the same, just in case
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

  /**
   * Delete all memories linked to a specific user ID, should be called when user deletes account
   * @param userId - The user ID to delete memories for
   * @returns The number of deleted memories
   * @throws Error if the user ID is invalid or if the deletion fails
   */
  deleteAllByUserId: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error("Invalid User ID");
    return await MemoryModel.deleteMany({ userId }).exec();
  },

  // Text-based search for memories
  searchMemories(userId: string, searchTerm: string): Promise<IMemory[]> {
    if (!searchTerm.trim()) return Promise.resolve([]); // Prevent empty searches

    const validUserId = new mongoose.Types.ObjectId(userId);
    const regex = new RegExp(searchTerm, "i"); // Case-insensitive search

    return MemoryModel.find({
      userId: validUserId,
      $or: [
        { memory: regex }, // Direct text search
        { people: regex }, // Match in arrays
        { locations: regex },
        { emotions: regex },
        { topics: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};
