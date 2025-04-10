export interface IUser {
  _id?: string;
  name: string;
  lastName: string;
  username: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate?: Date;
  email: string;
  photo?: string;
  moodEntries?: string[];
  memories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
