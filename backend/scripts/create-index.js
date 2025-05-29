// Usage: node backend/scripts/create-index.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI environment variable is not set");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db("soulsync");

    // Create the collection if it doesn't exist
    const collections = await db
      .listCollections({ name: "book_chunks" })
      .toArray();
    if (collections.length === 0) {
      await db.createCollection("book_chunks");
      console.log("Created collection 'book_chunks'");
    }

    const collection = db.collection("book_chunks");

    // define your Atlas Vector Search index
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            similarity: "dotProduct",
            numDimensions: 1536,
          },
        ],
      },
    };

    const result = await collection.createSearchIndex(index);
    console.log("Index created:", result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
