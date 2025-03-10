import mongoose from "mongoose";

// User Type from Zod
export interface IUser extends mongoose.Document {
  name: string;
  lastName: string;
  username: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate: Date;
  email: string;
  password: string;
  photo: string;
  moodEntries: mongoose.Types.ObjectId[];
  memories?: mongoose.Types.ObjectId[];
  comparePassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Model Type
export interface IUserModel extends mongoose.Model<IUser> {}
