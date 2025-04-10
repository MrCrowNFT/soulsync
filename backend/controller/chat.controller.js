//todo in this chat i need to integrate the ai utils


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
    const skip = parseInt(req.query.limit) || 0;
    


  } catch (error) {}
};
