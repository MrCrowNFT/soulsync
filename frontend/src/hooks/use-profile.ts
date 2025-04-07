import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LoginParams,
  LoginResponse,
  LogoutResponse,
  SignupParams,
  SignupResponse,
} from "../types/auth";
import { loginRequest, logoutRequest, signupRequest } from "../api/services/auth";

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

      signup: async (signup: SignupParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await signupRequest(signup);
          set({
            _id: response.data._id,
            name: response.data.name,
            lastName: response.data.lastName,
            username: response.data.username,
            gender: response.data.gender,
            email: response.data.email,
            photo: response.data.photo,
            birthDate: response.data.birthDate
              ? new Date(response.data.birthDate)
              : null,
            createdAt: response.user.createdAt
              ? new Date(response.user.createdAt)
              : null,
            updatedAt: response.user.updatedAt
              ? new Date(response.user.updatedAt)
              : null,
            initialized: true,
            isLoading: false,
          });
          return response;
        } catch (signupError: any) {
          set({
            isLoading: false,
            error: signupError?.response?.data?.message || "Signup failed",
          });
          throw signupError;
        }
      },

      login: async (login: LoginParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginRequest(login);
          set({
            _id: response.user._id,
            name: response.user.name,
            lastName: response.user.lastName,
            username: response.user.username,
            gender: response.user.gender,
            email: response.user.email,
            photo: response.user.photo,
            birthDate: response.user.birthDate
              ? new Date(response.user.birthDate)
              : null,
            moodEntries: response.user.moodEntries || [],
            memories: response.user.memories || [],
            createdAt: response.user.createdAt
              ? new Date(response.user.createdAt)
              : null,
            updatedAt: response.user.updatedAt
              ? new Date(response.user.updatedAt)
              : null,
            initialized: true,
            isLoading: false,
          });
          return response;
        } catch (loginError: any) {
          set({
            isLoading: false,
            error: loginError?.response?.data?.message || "Login failed",
          });
          throw loginError;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await logoutRequest();
          // Clear user data on logout
          set({
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
          });
          // Remove token from localStorage
          localStorage.removeItem("accessToken");
          return response;
        } catch (logoutError: any) {
          set({
            isLoading: false,
            error: logoutError?.response?.data?.message || "Logout failed",
          });
          throw logoutError;
        }
      },
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
