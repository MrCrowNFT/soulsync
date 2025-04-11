import { chatEntry, deleteChatResponse, getChatParams, getChatResponse } from "../../types/chat";
import api from "../axios";

//todo this is up for change since the ai logic is still not implemented
export interface newChatEntryResponse {
  success: boolean;
  memory ?: string; 
  data: chatEntry;
}

export const newChatEntry = async (
  chatEntry: chatEntry
): Promise<newChatEntryResponse> => {
  const res = await api.post("/", chatEntry);
  return res.data;
};

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
