// Usage: node backend/scripts/create-index.js
import { MongoClient } from "mongodb";

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db("soulsync");
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
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
