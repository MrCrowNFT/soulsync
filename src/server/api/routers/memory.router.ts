import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MemoryRepository } from "@/server/db/repositories/memory.repository";

//input schema for memory creation
const memoryInputSchema = z.object({
  userId: z.string(),
  memory: z.string().min(1, "Memory content cannot be empty"),
});

export const memoryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(memoryInputSchema)
    .mutation(async ({ input }) => {
      return MemoryRepository.create(input);
    }),

  //get by memory id
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return MemoryRepository.getById(input.id);
    }),

  //get all by user id
  getAllUserMemories: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return MemoryRepository.getAllByUserId(input.id);
    }),

  // Search memories
  search: protectedProcedure
    .input(z.object({ userId: z.string(), searchTerm: z.string() }))
    .query(async ({ input }) => {
      return MemoryRepository.searchMemories(input.userId, input.searchTerm);
    }),

  // Update a memory by ID but there should not be any need to update memories from
  // the user since this should only be accesable by the ai
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        updateData: z.object({
          memory: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      return MemoryRepository.updateById(input.id, input.updateData);
    }),

  //delete one memory by it's id
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return MemoryRepository.deleteById(input.id);
    }),

  //delete all memories of user id, should only be called when deleting account
  deleteAll: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return MemoryRepository.deleteAllByUserId(input.id);
    }),
});
