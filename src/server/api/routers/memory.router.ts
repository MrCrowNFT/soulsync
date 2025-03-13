import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MemoryRepository } from "@/server/db/repositories/memory.repository";


export const memoryRouter = createTRPCRouter({
  //create: ,

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
  //there should be any need to update memories from the user since this
  // should only be accesable by the ai
});
