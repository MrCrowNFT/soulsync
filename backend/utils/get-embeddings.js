import OpenAI from "openai";
import dotenv from "dotenv";
import logger from "./logger.js";

//needed to add this for running the create embeddings script
dotenv.config();

// Set up OpenAI configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate embeddings using the OpenAI API
export async function getEmbedding(text, retries = 3) {
  const startTime = Date.now();

  logger.info("Embedding generation started", {
    textLength: text?.length || 0,
    maxRetries: retries,
    model: "text-embedding-3-small",
  });

  for (let i = 0; i < retries; i++) {
    const attemptStart = Date.now();

    try {
      logger.debug("Embedding API call attempt", {
        attemptNumber: i + 1,
        textLength: text.length,
        remainingRetries: retries - i - 1,
      });

      const results = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });

      const attemptDuration = Date.now() - attemptStart;
      const totalDuration = Date.now() - startTime;

      logger.info("Embedding generated successfully", {
        attemptNumber: i + 1,
        textLength: text.length,
        embeddingDimensions: results.data[0].embedding.length,
        attemptDuration: `${attemptDuration}ms`,
        totalDuration: `${totalDuration}ms`,
        tokensUsed: results.usage?.total_tokens || "unknown",
      });

      return results.data[0].embedding;
    } catch (error) {
      const attemptDuration = Date.now() - attemptStart;

      logger.warn("Embedding generation attempt failed", {
        attemptNumber: i + 1,
        remainingRetries: retries - i - 1,
        error: error.message,
        errorCode: error.code,
        attemptDuration: `${attemptDuration}ms`,
        textLength: text?.length || 0,
      });

      if (i === retries - 1) {
        const totalDuration = Date.now() - startTime;

        logger.error("Embedding generation failed after all retries", {
          totalAttempts: retries,
          error: error.message,
          errorCode: error.code,
          stack: error.stack,
          totalDuration: `${totalDuration}ms`,
          textLength: text?.length || 0,
        });

        throw error;
      }

      const delayMs = 1000 * (i + 1);
      logger.info("Retrying embedding generation", {
        attemptNumber: i + 1,
        nextRetryIn: `${delayMs}ms`,
        remainingRetries: retries - i - 1,
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
