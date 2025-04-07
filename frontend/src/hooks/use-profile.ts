import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LoginParams,
  LoginResponse,
  LogoutResponse,
  SignupParams,
  SignupResponse,
} from "../types/auth";
import {
  loginRequest,
  logoutRequest,
  signupRequest,
} from "../api/services/auth";
import axios from "axios";

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

//todo fix the any types and make login return user profile on the backend

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
            createdAt: response.data.createdAt
              ? new Date(response.data.createdAt)
              : null,
            updatedAt: response.data.updatedAt
              ? new Date(response.data.updatedAt)
              : null,
            initialized: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message || "Signup failed"
            : "Signup failed";

          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      login: async (login: LoginParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginRequest(login);
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
            moodEntries: response.data.moodEntries || [],
            memories: response.data.memories || [],
            createdAt: response.data.createdAt
              ? new Date(response.data.createdAt)
              : null,
            updatedAt: response.data.updatedAt
              ? new Date(response.data.updatedAt)
              : null,
            initialized: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message || "Login failed"
            : "Login failed";

          set({ isLoading: false, error: errorMessage });
          throw error;
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
        } catch (error) {
          const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message || "Logout failed"
            : "Logout failed";

          set({ isLoading: false, error: errorMessage });
          throw error;
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
