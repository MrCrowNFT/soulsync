import mongoose from "mongoose";

const chatEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
      enum: ["user", "ai"],
    },
    metadata: {
      context: {
        type: String,
        default: "", // Default empty string
      }, // Context of the conversation, not sure how to add this, but might be useful
    },
  },
  {
    timestamps: true,
  }
);

//index on users for faster queries
chatEntrySchema.index({ userId: 1 });

const ChatEntry = mongoose.model("ChatEntry", chatEntrySchema);
export default ChatEntry;
