import {
  deleteAccountResponse,
  updateUserPayload,
  updateUserResponse,
} from "../../types/user";
import api from "../axios";

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
