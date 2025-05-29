import ChatEntry from "../models/chat-entry.model.js";
import mongoose from "mongoose";
import { getLLMResponse } from "../utils/ai.util.js";
import {
  analyzeAndExtractMemory,
  fetchRelevantMemories,
} from "../utils/memory.util.js";
import { getEmbedding } from "../utils/get-embeddings.js";
import { getRAGContext } from "../utils/rag-search.js";

const CHAT_ENTRY_LIMIT = 100;
const CONVERSATION_CONTEXT_LIMIT = 5;
//**We don't need a chat entry update method
/**
 * Get the chat entries when the user loads the chat
 * @param req -
 * @param res
 */
export const getChatEntries = async (req, res) => {
  try {
    console.log("------ GET CHAT ENTRIES PROCESS STARTED ------");
    console.log(`Request path: ${req.path}`);
    console.log(`Request method: ${req.method}`);

    const userId = req.user?._id;
    const limit = CHAT_ENTRY_LIMIT;

    console.log(`Attempting to get chat entries for user: ${userId}`);
    console.log(`Using entry limit: ${limit}`);

    if (!userId) {
      console.log("ERROR: userId not found in request");
      return res.status(400).json({ success: false, error: "userId required" });
    }
    console.log("User ID present in request");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`ERROR: Invalid user ID format: ${userId}`);
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }
    console.log(`User ID format validated: ${userId}`);

    console.log(`Querying database for chat entries with userId: ${userId}`);
    console.log(
      `Query parameters: { sort: { createdAt: -1 }, limit: ${limit} }`
    );

    const startTime = Date.now();
    const chatEntries = await ChatEntry.find({ userId: userId })
      .sort({ createdAt: 1 }) // from oldest to newest for it to be shown properly on the ui
      .limit(limit); // default to 100 entries
    const queryTime = Date.now() - startTime;

    console.log(`Database query completed in ${queryTime}ms`);
    console.log(`Number of chat entries found: ${chatEntries?.length || 0}`);

    if (!chatEntries) {
      console.log(`No chat entries found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "No chat entries found",
      });
    }

    const oldestEntry =
      chatEntries.length > 0
        ? new Date(chatEntries[chatEntries.length - 1].createdAt)
        : "none";
    const newestEntry =
      chatEntries.length > 0 ? new Date(chatEntries[0].createdAt) : "none";

    console.log(`Chat entries retrieved successfully for user: ${userId}`);
    console.log(`Date range: ${oldestEntry} to ${newestEntry}`);
    console.log(`Returning ${chatEntries.length} entries to client`);
    console.log(
      "------ GET CHAT ENTRIES PROCESS COMPLETED SUCCESSFULLY ------"
    );

    return res.status(200).json({
      success: true,
      data: chatEntries,
    });
  } catch (error) {
    console.error("------ GET CHAT ENTRIES PROCESS FAILED ------");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    console.error(`User ID from request: ${req.user?._id || "undefined"}`);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const newChatEntry = async (req, res) => {
  try {
    console.log("------ NEW CHAT ENTRY PROCESS STARTED ------");
    console.log(`Request path: ${req.path}`);
    console.log(`Request method: ${req.method}`);

    const userId = req.user._id;
    console.log(`Creating new chat entry for user: ${userId}...`);

    const { message, sender, metadata } = req.body;
    console.log(`Message length: ${message ? message.length : 0} characters`);
    console.log(`Sender: ${sender}`);
    console.log(`Metadata provided: ${metadata ? "Yes" : "No"}`);

    //more compact validation
    console.log("Validating input parameters...");
    console.log(
      `User ID valid: ${mongoose.Types.ObjectId.isValid(userId) ? "Yes" : "No"}`
    );
    console.log(`Message provided: ${message ? "Yes" : "No"}`);
    console.log(
      `Sender valid: ${["user", "ai"].includes(sender) ? "Yes" : "No"}`
    );

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !message ||
      !sender ||
      !["user", "ai"].includes(sender)
    ) {
      console.log("ERROR: Invalid input parameters");
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    console.log(`Generating message embeddings`);

    const embedding = await getEmbedding(message);

    const newChatEntry = new ChatEntry({
      userId: userId,
      message: message,
      sender: sender,
      metadata: metadata || {},
      embedding: embedding,
    });
    console.log(`Chat entry object created, preparing to save to database`);
    await newChatEntry.save();
    console.log(
      `New chat entry saved successfully. Entry ID: ${newChatEntry._id}`
    );

    console.log(`Analyzing new chat entry for memory worthiness...`);
    //check if message is new memory worthy and save it
    const newMemory = await analyzeAndExtractMemory(userId, message, embedding);
    console.log(
      `Memory extraction result: ${
        newMemory ? "New memory created" : "No memory created"
      }`
    );
    if (newMemory) {
      await newMemory.save();
      console.log(`New memory saved successfully. Memory ID: ${newMemory._id}`);
    }

    console.log(`Fetching relevant memories...`);
    // get filtered relevant user memories from DB
    const relatedMemories = await fetchRelevantMemories(userId, message);
    console.log(`Related memories found: ${relatedMemories.length}`);

    console.log(`Fetching recent chat history for conversational context...`);
    const recentChatEntries = await ChatEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(CONVERSATION_CONTEXT_LIMIT)
      .lean();

    console.log(
      `Found ${recentChatEntries.length} recent chat entries for context`
    );

    // Reverse to chronological order for proper conversation flow
    const orderedChatEntries = recentChatEntries.reverse();

    console.log(`Getting RAG context`);
    const ragContext = await getRAGContext(embedding);

    console.log(`Sending message to LLM`);

    const aiMessage = await getLLMResponse(
      message,
      relatedMemories,
      orderedChatEntries,
      ragContext
    );
    console.log(
      `LLM response received. Response length: ${aiMessage.length} characters`
    );

    //create and save ai response
    console.log(`Creating AI response entry in database`);
    const aiChat = new ChatEntry({ userId, message: aiMessage, sender: "ai" });
    await aiChat.save();

    console.log(
      `AI chat entry created successfully. Entry ID: ${aiChat._id}\nSending response to user...`
    );
    //todo maybe also return the newChatEntry and the memory if any
    console.log("------ NEW CHAT ENTRY PROCESS COMPLETED SUCCESSFULLY ------");
    return res.status(201).json({ success: true, data: aiChat });
  } catch (error) {
    console.error("------ NEW CHAT ENTRY PROCESS FAILED ------");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    console.error(`Request body: ${JSON.stringify(req.body)}`);
    console.error(`Request user: ${JSON.stringify(req.user)}`);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteChatEntries = async (req, res) => {
  try {
    const { userId } = req.user._id;
    console.log(`Deleting chat of user: ${userId}`);
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid userId format" });
    }

    await ChatEntry.deleteMany({ userId: userId });
    console.log(`Chat deleted succesfully`);

    return res
      .status(200)
      .json({ success: true, message: "All chat entries deleted" });
  } catch (error) {
    console.error("Error deleting chat entries:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
