import { UserModel } from "../models/user.model";
import { UserSchema } from "../schemas/user.schema";
import type { IUser } from "@/types/user";
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
  updateById: async (
    userId: string,
    updateData: Partial<IUser>, //Partial cause it can contain any subset of the properties in IUser
  ): Promise<(IUser & Document) | null> => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }
      return await UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user by ID
   * @param userId - User ID
   * @returns Deleted user or null
   */
  deleteById: async (userId: string): Promise<(IUser & Document) | null> => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }
      return await UserModel.findByIdAndDelete(userId).exec();
    } catch (error) {
      throw error;
    }
  },
};
