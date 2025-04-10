import { IUser } from "../../types/user";
import api from "../axios";

export interface updateUserPayload {
  username?: string;
  password?: string;
  email?: string;
  name?: string;
  lastName?: string;
  gender?: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate?: Date;
  photo?: string;
}

export interface updateUserResponse {
  success: boolean;
  message: string;
  user: IUser;
}
//i know i can just extend this response onto the update one
//but i could not come up with a good name
export interface deleteAccountResponse {
  success: boolean;
  message: string;
}

export const updateUser = async (
  updateUserPayload: updateUserPayload
): Promise<updateUserResponse> => {
  const res = await api.put("/user/", updateUserPayload);
  return res.data;
};

export const deleteAccount = async (): Promise<deleteAccountResponse> => {
  const res = await api.delete("/user/");
  return res.data;
};
