import { MemoryModel } from "../models/memory.model";
import { MemorySchema } from "../schemas/memory.schema";
import type { Memory } from "../schemas/memory.schema";
import type { IMemory } from "@/types/memory";
import mongoose from "mongoose";

export const MemoryRepository = {
  create: async (data: Memory) => {
    const parsedData = MemorySchema.parse(data); // Validate input
    return await MemoryModel.create(parsedData);
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
    const validUserId = new mongoose.Types.ObjectId(userId);

    return MemoryModel.find({
      userId: validUserId,
      $or: [
        { memory: { $regex: searchTerm, $options: "i" } },
        { people: { $in: [new RegExp(searchTerm, "i")] } },
        { locations: { $in: [new RegExp(searchTerm, "i")] } },
        { emotions: { $in: [new RegExp(searchTerm, "i")] } },
        { topics: { $in: [new RegExp(searchTerm, "i")] } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};
