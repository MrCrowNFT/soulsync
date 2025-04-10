import express from "express";
import {
  deleteChatEntries,
  getChatEntries,
  newChatEntry,
} from "../controller/chat.controller";

const chatEntryRouter = express.Router();

chatEntryRouter.get("/", getChatEntries);
chatEntryRouter.post("/", newChatEntry);
chatEntryRouter.delete("/", deleteChatEntries);

export default chatEntryRouter;
