import { UserModel } from "../models/user.model";
import { UserSchema, User } from "../schemas/user.schema";
import { IUser } from "@/types/user";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";

export const UserRepository = {
  /**
   * Create a new user
   * @param userData - User data to create
   * @returns The created user
   */
  create: async (userData: unknown): Promise<IUser> => {
    try {
      const validatedData = UserSchema.parse(userData);

      const newUser = new UserModel(validatedData) as IUser;
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      // Handle mongoose errors specifically
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new Error("A user with that email or username already exists");
      }
      throw error; // Re-throw other errors
    }
  },
  /**
   * Find user by ID
   * @param userId - User ID
   * @returns found user or null
   */
  findById: async (userId: string): Promise<IUser | null> => {
    try {
      //validate id
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }
      const user = await UserModel.findById(userId).exec();
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find a user by email
   * @param email - User email
   * @returns The found user or null
   */
  findByEmail: async (email: string): Promise<IUser | null> => {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  },
};
