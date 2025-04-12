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
  const res = await api.post("/", chatEntry);
  return res.data;
};

export const getChat = async (): Promise<getChatResponse> => {
  const res = await api.get("/chat/");
  return res.data;
};

export const deleteChat = async (): Promise<deleteChatResponse> => {
  const res = await api.delete("/chat/");
  return res.data;
};
