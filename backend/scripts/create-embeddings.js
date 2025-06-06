// Usage: node backend/scripts/create-embeddings.js
// Extracts text from PDFs and stores vector embeddings in MongoDB Atlas

import fs from "fs";

import { MongoClient } from "mongodb";
import { getEmbedding } from "../utils/get-embeddings.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  return new Promise(async (resolve, reject) => {
    try {
      const { default: PDFParser } = await import("pdf2json");
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error(
          `PDF parsing error for ${filePath}:`,
          errData.parserError
        );
        reject(errData.parserError);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        let text = "";

        // Extract text from all pages
        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((textItem) => {
            textItem.R.forEach((run) => {
              text += decodeURIComponent(run.T) + " ";
            });
          });
          text += "\n"; // Add newline between pages
        });

        resolve(text.trim());
      });

      pdfParser.loadPDF(filePath);
    } catch (error) {
      reject(error);
    }
  });
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
    "./backend/scripts/books/emotional_intelligence.pdf",
    "./backend/scripts/books/The_Body_Keeps_the_Score.pdf",
    "./backend/scripts/books/The_Subtle_Art_of_Not_Giving_a_F_ck.pdf",
  ];

  const client = new MongoClient(process.env.MONGO_URI);
  const BATCH_SIZE = 10; // Process 10 chunks at a time

  try {
    await client.connect();
    const db = client.db("soulsync");
    const collection = db.collection("book_chunks");

    for (const path of filePaths) {
      if (!fs.existsSync(path)) {
        console.error(`File not found: ${path}`);
        console.log(`Current working directory: ${process.cwd()}`);
        process.exit(1);
      }
      const rawText = await extractTextFromPDF(path);
      const chunks = chunkText(rawText);

      console.log(`Processing ${path} with ${chunks.length} chunks...`);

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            chunks.length / BATCH_SIZE
          )}`
        );

        // Filter out chunks that already exist
        const newChunks = [];

        for (const chunk of batch) {
          const exists = await collection.findOne({ text: chunk });
          if (!exists) {
            newChunks.push(chunk);
          }
        }

        if (newChunks.length === 0) {
          console.log(
            `Batch ${
              Math.floor(i / BATCH_SIZE) + 1
            }: All chunks already exist, skipping...`
          );
          continue;
        }

        // Generate embeddings for all new chunks in parallel
        console.log(`Generating ${newChunks.length} embeddings...`);
        const embeddings = await Promise.all(
          newChunks.map((chunk) => getEmbedding(chunk))
        );

        // Prepare documents for insertion
        const documents = newChunks.map((chunk, index) => ({
          text: chunk,
          embedding: embeddings[index],
          source: path.split("/").pop(), // filename
          chunkIndex: i + index,
          createdAt: new Date(),
          wordCount: chunk.split(/\s+/).length,
        }));

        // Insert all documents at once
        if (documents.length > 0) {
          await collection.insertMany(documents);
          console.log(`Inserted ${documents.length} new chunks`);
        }

        // Add a small delay between batches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
