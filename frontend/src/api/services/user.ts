import {
  deleteAccountResponse,
  updateUserPayload,
  updateUserResponse,
} from "../../types/user";
import api from "../axios";

export const updateUser = async (
  updateUserPayload: updateUserPayload
): Promise<updateUserResponse> => {
  // Check if photo is a File object
  const hasFileUpload = updateUserPayload.photo instanceof File;

  if (hasFileUpload) {
    // FormData for file uploads
    const formData = new FormData();

    Object.entries(updateUserPayload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "photo" && value instanceof File) {
          formData.append("photo", value);
        } else if (key === "birthDate" && value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const res = await api.put("/user/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } else {
    // Regular JSON request for non-file updates
    const res = await api.put("/user/", updateUserPayload);
    return res.data;
  }
};
export const deleteAccount = async (): Promise<deleteAccountResponse> => {
  const res = await api.delete("/user/");
  return res.data;
};
