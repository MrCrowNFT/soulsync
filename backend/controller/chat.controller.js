import ChatEntry from "../models/chat-entry.model.js";
import mongoose from "mongoose";
import { getLLMResponse } from "../utils/ai.util.js";
import {
  analyzeAndExtractMemory,
  fetchRelevantMemories,
} from "../utils/memory.util.js";
import { getEmbedding } from "../utils/get-embeddings.js";
import { getRAGContext } from "../utils/rag-search.js";
import logger from "../utils/logger.js";

//todo probably should make a constants file
const CHAT_ENTRY_LIMIT = 100;
const CONVERSATION_CONTEXT_LIMIT = 5;

//**We don't need a chat entry update method
/**
 * Get the chat entries when the user loads the chat
 * @param req -
 * @param res
 */
export const getChatEntries = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user?._id;
    const limit = CHAT_ENTRY_LIMIT;

    requestLogger.info("Chat entries retrieval started", { userId, limit });

    if (!userId) {
      requestLogger.warn("Chat entries failed - no userId");
      return res.status(400).json({ success: false, error: "userId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      requestLogger.warn("Chat entries failed - invalid userId format", {
        userId,
      });
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    const startTime = Date.now();
    const chatEntries = await ChatEntry.find({ userId: userId })
      .sort({ createdAt: 1 }) // from oldest to newest for it to be shown properly on the ui
      .limit(limit); // default to 100 entries
    const queryDuration = Date.now() - startTime;

    if (!chatEntries) {
      requestLogger.info("No chat entries found", { userId });
      return res.status(404).json({
        success: false,
        message: "No chat entries found",
      });
    }

    requestLogger.info("Chat entries retrieved successfully", {
      userId,
      entriesCount: chatEntries.length,
      queryDuration: `${queryDuration}ms`,
      dateRange:
        chatEntries.length > 0
          ? {
              oldest: chatEntries[0].createdAt,
              newest: chatEntries[chatEntries.length - 1].createdAt,
            }
          : null,
    });

    return res.status(200).json({
      success: true,
      data: chatEntries,
    });
  } catch (error) {
    requestLogger.error("Chat entries retrieval error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const newChatEntry = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id;
    const { message, sender, metadata } = req.body;

    requestLogger.info("New chat entry process started", {
      userId,
      sender,
      messageLength: message?.length || 0,
      hasMetadata: !!metadata,
    });

    //more compact validation
    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !message ||
      !sender ||
      !["user", "ai"].includes(sender)
    ) {
      requestLogger.warn("New chat entry failed - invalid input", {
        userId,
        hasMessage: !!message,
        sender,
        validSender: ["user", "ai"].includes(sender),
      });
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    // Generate embeddings
    const embedding = await getEmbedding(message);

    // Save user message
    const newChatEntry = new ChatEntry({
      userId: userId,
      message: message,
      sender: sender,
      metadata: metadata || {},
      embedding: embedding,
    });

    await newChatEntry.save();

    requestLogger.info("User chat entry saved", {
      userId,
      entryId: newChatEntry._id,
      messageLength: message.length,
    });

    // Memory analysis
    const newMemory = await analyzeAndExtractMemory(userId, message, embedding);
    if (newMemory) {
      await newMemory.save();
      requestLogger.info("New memory created from chat", {
        userId,
        memoryId: newMemory._id,
        chatEntryId: newChatEntry._id,
      });
    }

    // Get relevant memories
    const relatedMemories = await fetchRelevantMemories(userId, message);

    // Get recent chat context
    const recentChatEntries = await ChatEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(CONVERSATION_CONTEXT_LIMIT)
      .lean();

    // Reverse to chronological order for proper conversation flow
    const orderedChatEntries = recentChatEntries.reverse();

    // Get RAG context
    const ragContext = await getRAGContext(embedding);

    requestLogger.info("Context gathered for AI response", {
      userId,
      relatedMemoriesCount: relatedMemories.length,
      recentChatsCount: orderedChatEntries.length,
      hasRagContext: !!ragContext,
    });

    // Get AI response
    const aiResponseStart = Date.now();
    const aiMessage = await getLLMResponse(
      message,
      relatedMemories,
      orderedChatEntries,
      ragContext
    );
    const aiResponseDuration = Date.now() - aiResponseStart;

    //create and save ai response
    const aiChat = new ChatEntry({ userId, message: aiMessage, sender: "ai" });
    await aiChat.save();

    requestLogger.info("AI response generated and saved", {
      userId,
      aiChatId: aiChat._id,
      aiResponseLength: aiMessage.length,
      aiResponseDuration: `${aiResponseDuration}ms`,
      originalMessageId: newChatEntry._id,
    });

    //todo maybe also return the newChatEntry and the memory if any
    return res.status(201).json({ success: true, data: aiChat });
  } catch (error) {
    requestLogger.error("New chat entry process error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      requestBody: {
        messageLength: req.body?.message?.length || 0,
        sender: req.body?.sender,
        hasMetadata: !!req.body?.metadata,
      },
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteChatEntries = async (req, res) => {
  const requestLogger = req.logger || logger;

  try {
    const userId = req.user._id; // Fixed: was destructuring incorrectly

    requestLogger.info("Chat deletion started", { userId });

    if (!userId) {
      requestLogger.warn("Chat deletion failed - no userId");
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      requestLogger.warn("Chat deletion failed - invalid userId format", {
        userId,
      });
      return res
        .status(400)
        .json({ success: false, error: "Invalid userId format" });
    }

    const deleteResult = await ChatEntry.deleteMany({ userId: userId });

    requestLogger.info("Chat entries deleted successfully", {
      userId,
      deletedCount: deleteResult.deletedCount,
    });

    return res
      .status(200)
      .json({ success: true, message: "All chat entries deleted" });
  } catch (error) {
    requestLogger.error("Chat deletion error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
