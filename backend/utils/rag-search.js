import mongoose from "mongoose";
import { getEmbedding } from "./get-embeddings.js";

export async function searchSimilarContent(query, limit = 5) {
  try {
    // Use the existing Mongoose connection
    const db = mongoose.connection.db;
    const collection = db.collection("book_chunks");

    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
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
    sources: results.map((r) => ({ source: r.source, score: r.score })),
  };
}
