import mongoose from "mongoose";
import { z } from "zod";

//zod schema for validation
export const MoodEntrySchema = z.object({
    userId: z.string().min(1),
    mood: z.number().int().min(1).max(5),
    createdAt: z.date().optional(),
    updated: z.date().optional(),
})

//type
export type MoodEntry = z.infer<typeof MoodEntrySchema>

