import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { UserRepository } from "../../db/repositories/user.repository";
import { UserSchema } from "../../db/schemas/user.schema";

//router for user endpoints
export const userRouter = createTRPCRouter({
  //protected don't require auth
  getById: publicProcedure
    // input schema using Zod
    .input(z.object({ id: z.string() }))
    // query handler function
    .query(async ({ input }) => {
      // call repository method with the input
      return UserRepository.findById(input.id);
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      return UserRepository.findByEmail(input.email);
    }),

  //mutation for create/update
  create: publicProcedure.input(UserSchema).mutation(async ({ input }) => {
    return UserRepository.create(input);
  }),

  //this one is protected, shouldn't be able to update if not loged in
  update: protectedProcedure
  .input(z.object({
    id: z.string(),
    // Only fields that should be directly editable
    data: z.object({
      name: z.string().optional(),
      lastName: z.string().optional(),
      username: z.string().min(3).optional(),
      gender: z.enum([
        "male",
        "female",
        "non-binary",
        "other",
        "prefer-not-to-say",
      ]).optional(),
      birthDate: z.date().optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      photo: z.string().optional(),
      // we must exclude moodEntries and memories
    }),
  }))
  .mutation(async ({ input }) => {
    return UserRepository.updateById(input.id, input.data);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return UserRepository.deleteById(input.id);
    }),
});
