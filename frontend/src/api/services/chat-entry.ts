import api from "../axios";

//todo this is up for change since the ai logic is still not implemented
export interface newChatEntryResponse {
  success: boolean;
  data: string; //this should be the ai response
}

export interface getChatParams {
  limit?: number;
  skip?: number;
}

export interface getChatResponse {
  success: boolean;
  data: chatEntry[];
}

export interface deleteChatResponse {
  success: boolean;
  message: string;
  details?: string;
}

//this will also be used as type for sending the entry to the api
//that's why the optional params that are included when getting the entry
//the userId is sent in the token, so there is no need to also send it with this
export interface chatEntry {
  _id?: string;
  userId?: string;
  message: string;
  sender: "user" | "ai";
  metadata?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
