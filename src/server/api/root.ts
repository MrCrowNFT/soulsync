import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user.router";
import { memoryRouter } from "./routers/memory.router";
import { moodEntryRouter } from "./routers/moodEntry.router";

export const appRouter = createTRPCRouter({
  user: userRouter,
  memory: memoryRouter,
  moodEntry: moodEntryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
