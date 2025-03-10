import {type Document} from "mongoose";
import type mongoose from "mongoose";

// User Type from Zod
export interface IUser extends Document {
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
}
