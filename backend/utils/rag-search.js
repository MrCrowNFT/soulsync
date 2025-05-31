import mongoose from "mongoose";
import logger from "./logger.js";

export async function searchSimilarContent(query, limit = 5) {
  const startTime = Date.now();

  logger.info("Vector search started", {
    queryType: Array.isArray(query) ? "embedding" : "unknown",
    queryDimensions: Array.isArray(query) ? query.length : "unknown",
    limit,
    collection: "book_chunks",
  });

  try {
    // Use the existing Mongoose connection
    const db = mongoose.connection.db;
    const collection = db.collection("book_chunks");

    if (!db) {
      logger.error("Database connection not available", {
        connectionState: mongoose.connection.readyState,
      });
      throw new Error("Database connection not available");
    }

    logger.debug("Executing vector search query", {
      index: "vector_index",
      path: "embedding",
      numCandidates: 100,
      limit,
    });

    const aggregationStart = Date.now();
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

    const aggregationDuration = Date.now() - aggregationStart;
    const totalDuration = Date.now() - startTime;

    // Calculate result statistics
    const scores = results.map((r) => r.score).filter((s) => s !== undefined);
    const wordCounts = results
      .map((r) => r.wordCount)
      .filter((w) => w !== undefined);
    const sources = [...new Set(results.map((r) => r.source))];

    logger.info("Vector search completed successfully", {
      resultsCount: results.length,
      limit,
      aggregationDuration: `${aggregationDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      scoreRange:
        scores.length > 0
          ? {
              min: Math.min(...scores),
              max: Math.max(...scores),
              average: scores.reduce((a, b) => a + b, 0) / scores.length,
            }
          : null,
      wordCountStats:
        wordCounts.length > 0
          ? {
              min: Math.min(...wordCounts),
              max: Math.max(...wordCounts),
              total: wordCounts.reduce((a, b) => a + b, 0),
            }
          : null,
      uniqueSources: sources.length,
      sources: sources.slice(0, 3), // Log first 3 sources for debugging
    });

    return results;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("Vector search error", {
      error: error.message,
      stack: error.stack,
      queryDimensions: Array.isArray(query) ? query.length : "unknown",
      limit,
      totalDuration: `${totalDuration}ms`,
      connectionState: mongoose.connection.readyState,
      dbName: mongoose.connection.db?.databaseName || "unknown",
    });

    throw error;
  }
}

// Helper function to ensure connection is ready
export async function ensureConnection() {
  logger.debug("Checking database connection", {
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.db?.databaseName || "unknown",
  });

  if (mongoose.connection.readyState !== 1) {
    logger.error("Database connection check failed", {
      readyState: mongoose.connection.readyState,
      expectedState: 1,
      stateMapping: {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      },
    });

    throw new Error(
      "Database not connected. Make sure MongoDB is connected before using RAG search."
    );
  }

  logger.debug("Database connection verified", {
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.db.databaseName,
  });
}

// Get context for RAG with connection check
export async function getRAGContext(query, limit = 5) {
  const startTime = Date.now();

  logger.info("RAG context generation started", {
    queryDimensions: Array.isArray(query) ? query.length : "unknown",
    limit,
  });

  try {
    await ensureConnection();

    const searchStart = Date.now();
    const results = await searchSimilarContent(query, limit);
    const searchDuration = Date.now() - searchStart;

    if (!results || results.length === 0) {
      logger.warn("No results found for RAG context", {
        queryDimensions: Array.isArray(query) ? query.length : "unknown",
        limit,
        searchDuration: `${searchDuration}ms`,
      });

      return {
        context: "",
      };
    }

    const contextStart = Date.now();
    const context = results
      .map((result) => `[Source: ${result.source}] ${result.text}`)
      .join("\n\n");
    const contextDuration = Date.now() - contextStart;
    const totalDuration = Date.now() - startTime;

    logger.info("RAG context generated successfully", {
      resultsProcessed: results.length,
      contextLength: context.length,
      averageChunkLength: Math.round(context.length / results.length),
      searchDuration: `${searchDuration}ms`,
      contextDuration: `${contextDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      topScore: results[0]?.score || "unknown",
    });

    return {
      context,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("RAG context generation error", {
      error: error.message,
      stack: error.stack,
      queryDimensions: Array.isArray(query) ? query.length : "unknown",
      limit,
      totalDuration: `${totalDuration}ms`,
    });

    throw error;
  }
}
