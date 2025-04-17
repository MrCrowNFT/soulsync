import {
  chatEntry,
  deleteChatResponse,
  getChatResponse,
} from "../../types/chat";
import api from "../axios";

export interface newChatEntryResponse {
  success: boolean;
  data: chatEntry;
}

export const newChatEntry = async (
  chatEntry: chatEntry
): Promise<newChatEntryResponse> => {
  console.log("Sending new chat entry...")
  const res = await api.post("/chat/", chatEntry);
  return res.data;
};

export const getChat = async (): Promise<getChatResponse> => {
  console.log("Fetching chat entries...")
  const res = await api.get("/chat/");
  return res.data;
};

export const deleteChat = async (): Promise<deleteChatResponse> => {
  console.log("Deleting user chat...")
  const res = await api.delete("/chat/");
  return res.data;
};
