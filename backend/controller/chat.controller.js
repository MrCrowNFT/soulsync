//todo in this chat i need to integrate the ai utils

import ChatEntry from "../models/chat-entry.model";

//**We don't need a chat entry update method

//todo check how infinite scroll works, maybe can do something like that
//todo but backwards

//** Remember, this needs a query on the frontend for the limit and skip

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

    const limit = parseInt(req.query.limit) || 100; //default to 100 entries
    const skip = parseInt(req.query.skip) || 0;

    const chatEntries = await ChatEntry.find({ userId: userId })
      .sort({ createdAt: -1 }) //get most recent
      .skip(skip)
      .limit(limit);

    if (!chatEntries || chatEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chat entries found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chatEntries,
      //leave this like this for now, but is a chat, so no pagination
      pagination: {
        limit,
        skip,
        hasMore: chatEntries.length === limit,
      },
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

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }

    if (!message || !sender) {
      res
        .status(400)
        .json({ success: false, error: "Message and sender are required" });
      return;
    }

    //validate sender
    if (sender !== "user" && sender !== "ai") {
      res.status(400).json({
        success: false,
        error: "Sender must be either 'user' or 'ai'",
      });
      return;
    }

    const newChatEntry = new ChatEntry({
      userId: userId,
      message: message,
      sender: sender,
      metadata: metadata || {},
    });

    //TODO the question now is whem exactly should i use ai, the ai will
    //TODO analyse and extract data if is memory worthy, and send the message
    //TODO to the LLM, so, i have to actually return if there is a new memory
    //TODO and the response that comes from the llm
    //place holder for now
    const aiResponse = "";

    await newChatEntry.save();
    res.status(201).json({ success: true, data: aiResponse });
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
