import mongoose from "mongoose";

export async function searchSimilarContent(query, limit = 5) {
  try {
    // Use the existing Mongoose connection
    const db = mongoose.connection.db;
    const collection = db.collection("book_chunks");

    //the query is the embedding so there is no need to generate embedding again

    console.log("Initializing rag search")
    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: query,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $project: {
            text: 1,
            source: 1,
            chunkIndex: 1,
            wordCount: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    return results;
  } catch (error) {
    console.error("Error in vector search:", error);
    throw error;
  }
}

// Helper function to ensure connection is ready
export async function ensureConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      "Database not connected. Make sure MongoDB is connected before using RAG search."
    );
  }
}

// Get context for RAG with connection check
export async function getRAGContext(query, limit = 5) {
  await ensureConnection();

  const results = await searchSimilarContent(query, limit);

  const context = results
    .map((result) => `[Source: ${result.source}] ${result.text}`)
    .join("\n\n");

  return {
    context,
  };
}
