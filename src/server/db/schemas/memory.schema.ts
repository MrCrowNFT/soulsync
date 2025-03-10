import { z } from "zod";

//zod schema validation
export const MemorySchema = z.object({
  userId: z.string().min(1),
  memory: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

//type
export type Memory = z.infer<typeof MemorySchema>;
