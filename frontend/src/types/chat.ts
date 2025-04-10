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
