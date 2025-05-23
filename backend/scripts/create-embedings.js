// Usage: node scripts/embed-books.js
// Extracts text from PDFs and stores vector embeddings in MongoDB Atlas

import fs from "fs";
import pdf from "pdf-parse";
import { MongoClient } from "mongodb";
import { getEmbedding } from "../utils/get-embeddings.js";

// helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text;
}

// helper function to chunk text
function chunkText(text, chunkSize = 500, overlap = 50) {
  // Clean the text first
  const cleanText = text.replace(/\s+/g, " ").trim();
  const sentences = cleanText.match(/[^\.!\?]+[\.!\?]+/g) || [cleanText];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if ((current + " " + trimmedSentence).length < chunkSize) {
      current += (current ? " " : "") + trimmedSentence;
    } else {
      if (current) {
        chunks.push(current);
        // Add overlap for context continuity
        const words = current.split(" ");
        current =
          words.slice(-Math.floor(overlap / 10)).join(" ") +
          " " +
          trimmedSentence;
      } else {
        current = trimmedSentence;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.filter((chunk) => chunk.length > 20); // Filter out very short chunks
}

// Process and embed all books
async function run() {
  console.log("----Creating embeddings start----");
  const filePaths = [
    // need to add pdf paths here
  ];

  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db("soulsync");
    const collection = db.collection("book_chunks");

    for (const path of filePaths) {
      const rawText = await extractTextFromPDF(path);
      const chunks = chunkText(rawText);

      console.log(`Processing ${path} with ${chunks.length} chunks...`);

      for (const chunk of chunks) {
        const exists = await collection.findOne({ text: chunk });
        if (!exists) {
          const embedding = await getEmbedding(chunk);
          await collection.insertOne({ text: chunk, embedding });
        }
      }
    }

    console.log("----Embeddings created successfully----");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
