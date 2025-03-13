import { z } from "zod";

//zod schema validation
export const MemorySchema = z.object({
  userId: z.string().min(1),
  memory: z.string().min(1),
  people: z.array(z.string()).optional(),
  pets: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  emotions: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

//type
export type Memory = z.infer<typeof MemorySchema>;

//input schema for memory creation
export const memoryInputSchema = z.object({
  userId: z.string(),
  memory: z.string().min(1, "Memory content cannot be empty"),
});

