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
