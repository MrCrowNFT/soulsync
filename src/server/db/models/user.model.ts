import mongoose from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";
import { MoodEntrySchema } from "./moodEntry.model";

//zod schema validation
export const UserSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  gender: z.enum([
    "male",
    "female",
    "non-binary",
    "other",
    "prefer-not-to-say",
  ]),
  birthDate: z.date().refine((date) => date < new Date(), {
    message: "Birth date cannot be in the future",
  }),
  email: z.string().email(),
  password: z.string().min(6),
  photo: z.string().default(""),
  // For related models in Zod, we can either use:
  // 1. String IDs (simpler)
  moodEntries: z.array(z.string()).default([]),
  memories: z.array(z.string()).default([]),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// for public-facing data (without password)
export const UserPublicSchema = UserSchema.omit({ password: true });

//TypeScript types
export type User = z.infer<typeof UserSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;

// Mongoose interfaces
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

export interface IUserModel extends mongoose.Model<IUser> {}

// MongoDB schema
const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "non-binary", "other", "prefer-not-to-say"],
    },
    birthDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value < new Date();
        },
        message: "Birth date cannot be in the future",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    photo: { type: String, default: "" },
    moodEntries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MoodEntry",
      },
    ],
    memories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memories",
      },
    ],
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(enteredPassword, this.password as string);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Failed to compare passwords");
  }
};

// Create and export the model
export const UserModel =
  mongoose.models.User ?? mongoose.model<IUser, IUserModel>("User", userSchema);
