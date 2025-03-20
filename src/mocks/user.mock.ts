import type { IUser } from "@/types/user";
import mongoose from "mongoose";

export const mockUser: IUser = {
  _id: new mongoose.Types.ObjectId(), // Mongoose ObjectId for the user
  name: "John",
  lastName: "Doe",
  username: "johndoe",
  gender: "male",
  birthDate: new Date("1990-01-01"),
  email: "johndoe@example.com",
  password: "hashedpassword123", // passwords are hashed, this is just example
  photo: "/images/avatar.jpg",
  moodEntries: [new mongoose.Types.ObjectId()], // Example reference IDs
  memories: [new mongoose.Types.ObjectId()],
  comparePassword: async (enteredPassword: string) => {
    return enteredPassword === "hashedpassword123"; // Mocked comparison
  },
};