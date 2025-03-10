import mongoose from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";
import { MoodEntrySchema } from "./moodEntry.model";

//zod schema validation
export const UserSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  gender: z.enum([
    "male",
    "female",
    "non-binary",
    "other",
    "prefer-not-to-say",
  ]),
  birthDate: z.date().refine((date) => date < new Date(), {
    message: "Birth date cannot be in the future",
  }),
  email: z.string().email(),
  password: z.string().min(6),
  photo: z.string().default(""),
  // For related models in Zod, we can either use:
  // 1. String IDs (simpler)
  moodEntries: z.array(z.string()).default([]),
  memories: z.array(z.string()).default([]),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// for public-facing data (without password)
export const UserPublicSchema = UserSchema.omit({ password: true });

//TypeScript types
export type User = z.infer<typeof UserSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
