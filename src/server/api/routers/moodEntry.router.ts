import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MoodEntryRepository } from "@/server/db/repositories/moodEntry.repository";
import { MoodEntrySchema } from "@/server/db/schemas/moodEntry.schema";

export const moodEntryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(MoodEntrySchema)
    .mutation(async ({ input }) => {
      return MoodEntryRepository.create(input);
    }),

  //get by entry id
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return MoodEntryRepository.getById(input.id);
    }),

  //get all by user id
  getAllUserMoodEntries: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return MoodEntryRepository.getAllByUserId(input.id);
    }),

  //query get specific entries by date

  //update by id
  updateById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // Only fields that should be directly editable
        data: z.object({
          mood: z.number().int().min(1).max(5),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      return MoodEntryRepository.updateById(input.id, input.data);
    }),

  //delete one entry by it's id
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return MoodEntryRepository.deleteById(input.id);
    }),

  //delete all entries of user id, should only be called when deleting account
  deleteAll: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return MoodEntryRepository.deleteAllByUserId(input.id);
    }),

    
});
