import ChatEntry from "../models/chat-entry.model.js";
import { getLLMResponse } from "../utils/ai.util.js";
import {
  analyzeAndExtractMemory,
  fetchRelevantMemories,
} from "../utils/memory.util";

//**We don't need a chat entry update method
/**
 * Get the chat entries when the user loads the chat
 * @param req -
 * @param res
 */
export const getChatEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    const chatEntries = await ChatEntry.find({ userId: userId })
      .sort({ createdAt: -1 }) //get most recent
      .limit(limit); //default to 100 entries

    if (!chatEntries || chatEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chat entries found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chatEntries,
    });
  } catch (error) {
    console.error("Error retrieving chat entries:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const newChatEntry = async (req, res) => {
  try {
    const userId = req.user._id;
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

    //check if message is new memory worthy and save it
    const newMemory = await analyzeAndExtractMemory(userId, message);
    if (newMemory) await newMemory.save();

    // get filtered relevant user memories from DB
    const relatedMemories = await fetchRelevantMemories(userId, message);

    //todo need to add and send info about the user
    const aiMessage = await getLLMResponse(message, relatedMemories);

    //create and save ai response
    const aiChat = new ChatEntry({ userId, message: aiMessage, sender: "ai" });
    await aiChat.save();

    //todo maybe also return the newChatEntry and the memory if any
    res.status(201).json({ success: true, data: aiChat });
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
