import mongoose from "mongoose";
import bcrypt from "bcrypt";
import type { IUser } from "../../../types/user";

// MongoDB schema
const userSchema = new mongoose.Schema<IUser & Document>(
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
        ref: "Memory",
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
  (mongoose.models.User as mongoose.Model<IUser & Document>) ??
  mongoose.model<IUser & Document>("User", userSchema);
