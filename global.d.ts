import type { MongoClient } from "mongodb";

declare global {
  let mongoClientPromise: Promise<MongoClient> | undefined;
}
