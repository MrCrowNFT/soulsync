import OpenAI from "openai";
import dotenv from "dotenv";

//needed to add this for running the create embeddings script
dotenv.config();
// Set up OpenAI configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate embeddings using the OpenAI API
export async function getEmbedding(text, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const results = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });
      return results.data[0].embedding;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1} for embedding...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}