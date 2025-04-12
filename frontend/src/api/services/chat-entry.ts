import { chatEntry, deleteChatResponse, getChatParams, getChatResponse } from "../../types/chat";
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

//* Currently not using limit and skip, but may be useful in the future
export const getChat = async (
  query?: getChatParams
): Promise<getChatResponse> => {
  const res = await api.get("/chat/", { params: query });
  return res.data;
};

export const deleteChat = async (): Promise<deleteChatResponse> => {
  const res = await api.delete("/chat/");
  return res.data;
};
