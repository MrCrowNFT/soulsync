import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LoginParams,
  LoginResponse,
  LogoutResponse,
  SignupParams,
  SignupResponse,
} from "../types/auth";

type Profile = {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate?: Date | null;
  email: string;
  photo?: string;
  moodEntries: string[]; // Consider creating a MoodEntry type
  memories: string[]; // Create a Memory type later
  createdAt: Date | null;
  updatedAt: Date | null;
  initialized: boolean;
  isLoading: boolean;
  error: string | null;

  //auth
  signup: (signup: SignupParams) => Promise<SignupResponse>;
  login: (login: LoginParams) => Promise<LoginResponse>;
  logout: () => Promise<LogoutResponse>;
};

export const useProfile = create<Profile>()(
  persist(
    (set, get) => ({
      _id: "",
      name: "",
      lastName: "",
      username: "",
      gender: "prefer-not-to-say",
      birthDate: null,
      email: "",
      photo: "",
      moodEntries: [],
      memories: [],
      createdAt: null,
      updatedAt: null,
      initialized: false,
      isLoading: false,
      error: null,

      signup: ,
      login: ,
      logout:  ,
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({
        _id: state._id,
        name: state.name,
        lastName: state.lastName,
        username: state.username,
        gender: state.gender,
        birthDate: state.birthDate,
        email: state.email,
        photo: state.photo,
        moodEntries: state.moodEntries,
        memories: state.memories,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        initialized: state.initialized,
      }),
    }
  )
);
