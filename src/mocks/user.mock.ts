import type { IUser } from "@/types/user";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

export const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: "John",
  lastName: "Doe",
  username: "johndoe",
  gender: "male",
  birthDate: new Date("1990-01-01"),
  email: "johndoe@example.com",
  password: "hashedpassword123",
  photo: "/images/avatar.jpg",
  moodEntries: [new mongoose.Types.ObjectId()],
  memories: [new mongoose.Types.ObjectId()],

  // ✅ Mock Mongoose method correctly
  comparePassword: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),

  // ✅ Required Mongoose Document methods (empty mocks)
  isModified: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  populate: jest.fn(),
  toObject: jest.fn().mockReturnValue({}),
  toJSON: jest.fn().mockReturnValue({}),
  $isValid: jest.fn(),
  $locals: {},
  $op: undefined,
  $session: jest.fn(),
  $ignore: jest.fn(),
  $getAllSubdocs: jest.fn(),
  $set: jest.fn(),
  $unset: jest.fn(),
  $clone: jest.fn(),
  $assertPopulated: jest.fn(),
  $createModifiedPathsSnapshot: jest.fn(),
  $clearModifiedPaths: jest.fn(),
} as unknown as IUser; // ✅ Force it to be IUser
