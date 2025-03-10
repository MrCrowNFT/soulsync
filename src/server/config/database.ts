import { MongoClient } from "mongodb";

//get db connection
const MONGODB_URI = process.env.MONGODB_URI;

//validate
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

// variable to hold the client promise
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // in development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // This to avoid performance issues. we are storing the connection in 
  // global._mongoClientPromise, so it persists across hot reloads.
  
  // Use a namespace approach to avoid TypeScript errors
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;

} else {
  // in prod, it's best to not use a global variable, as in serverless environments, 
  // global doesn't persist across function executions.
  const client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

// helper function to get the database for easy access to the database anywhere.
export const getDb = async () => {
  const client = await clientPromise;
  return client.db("soulsyncDb"); // placeholder name
};

//for fetching a specific collection directly
export const getCollection = async (collectionName: string) => {
  const db = await getDb();
  return db.collection(collectionName);
};