import ChatEntry from "../models/chat-entry.model.js";
import mongoose from "mongoose";
import { getLLMResponse } from "../utils/ai.util.js";
import {
  analyzeAndExtractMemory,
  fetchRelevantMemories,
} from "../utils/memory.util.js";

const CHAT_ENTRY_LIMIT = 100;

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
      .sort({ createdAt: -1 }) // get most recent
      .limit(limit); // default to 100 entries
    const queryTime = Date.now() - startTime;

    console.log(`Database query completed in ${queryTime}ms`);
    console.log(`Number of chat entries found: ${chatEntries?.length || 0}`);

    if (!chatEntries ) {
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
    const userId = req.user._id;
    console.log(`Creating new chat entry for user: ${userId}...`);

    const { message, sender, metadata } = req.body;

    //more compact validation
    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !message ||
      !sender ||
      !["user", "ai"].includes(sender)
    ) {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const newChatEntry = new ChatEntry({
      userId: userId,
      message: message,
      sender: sender,
      metadata: metadata || {},
    });
    await newChatEntry.save();
    console.log(`New chat entry saved succesfully`);

    console.log(`Analyzing new chat entry for memory worthiness...`);
    //check if message is new memory worthy and save it
    const newMemory = await analyzeAndExtractMemory(userId, message);
    if (newMemory) await newMemory.save();

    console.log(`Fetching relevant memories...`);
    // get filtered relevant user memories from DB
    const relatedMemories = await fetchRelevantMemories(userId, message);

    console.log(`Sending message to LLM`);
    //todo need to add and send info about the user
    const aiMessage = await getLLMResponse(message, relatedMemories);

    //create and save ai response
    const aiChat = new ChatEntry({ userId, message: aiMessage, sender: "ai" });
    await aiChat.save();

    console.log(
      `Ai chat entry created succesfully.\nSending response to user...`
    );
    //todo maybe also return the newChatEntry and the memory if any
    return res.status(201).json({ success: true, data: aiChat });
  } catch (error) {
    console.error("Error saving chat entry:", error);
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
