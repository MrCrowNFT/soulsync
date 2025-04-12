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
import {
  formattedMoodData,
  getMoodEntriesResponse,
  newMoodEntryResponse,
} from "../types/mood-entry";
import { deleteAccountResponse, updateUserPayload } from "@/types/user";
import {
  chatEntry,
  deleteChatResponse,
  getChatParams,
  getChatResponse,
} from "@/types/chat";
import { newChatEntryResponse } from "@/api/services/chat-entry";
import { deleteAccount, updateUser } from "@/api/services/user";

type Profile = {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate?: Date | null;
  email: string;
  photo?: string;
  moodData: formattedMoodData;
  chat: chatEntry[];
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

  //user
  updateProfile: (updatePayload: updateUserPayload) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;

  //chat
  newChat: (chatEntry: chatEntry) => Promise<newChatEntryResponse>;
  getChat: (query?: getChatParams) => Promise<getChatResponse>;
  deleteChat: () => Promise<boolean>;

  //mood entries
  newMood: (mood: number) => Promise<newMoodEntryResponse>;
  getMoods: (
    type: "weekly" | "monthly" | "yearly"
  ) => Promise<getMoodEntriesResponse>;

  //todo eventually need a method for user to check memories and delete them
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
      moodData: {
        labels: [],
        datasets: [],
      },
      chat: [],
      memories: [],
      createdAt: null,
      updatedAt: null,
      initialized: false,
      isLoading: false,
      error: null,

      //AUTH
      signup: async (signup: SignupParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await signupRequest(signup);
          set({ isLoading: false });

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
            moodData: {
              labels: [],
              datasets: [],
            },
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
      //USER PROFILE
      updateProfile: async (updatePayload: updateUserPayload) => {
        const previousState = { ...get() };
        //optimistic update
        set((state) => ({
          ...state,
          ...updatePayload,
          isLoading: true,
          error: null,
        }));
        try {
          await updateUser(updatePayload);
          // Update succeeded, update timestamp
          set((state) => ({
            ...state,
            updatedAt: new Date(),
            isLoading: false,
          }));

          return true;
        } catch (error) {
          // Rollback if API call fails
          set({
            ...previousState,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update profile",
          });
          return false;
        }
      },
      deleteAccount: async () => {
        const previousState = { ...get() };

        set({ isLoading: true, error: null });
        try {
          await deleteAccount();
          set({
            _id: "",
            name: "",
            lastName: "",
            username: "",
            gender: "prefer-not-to-say",
            birthDate: null,
            email: "",
            photo: "",
            moodData: {
              labels: [],
              datasets: [],
            },
            memories: [],
            createdAt: null,
            updatedAt: null,
            initialized: false,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          // Rollback if API call fails
          set({
            ...previousState,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete profile",
          });

          return false;
        }
      },

      //CHAT
      newChat: (chatEntry: chatEntry) => {},
      getChat: (query?: getChatParams) => {},
      deleteChat: () => {},

      //MOOD ENTRIES
      newMood: (mood: number) => {},
      getMoods: (type: "weekly" | "monthly" | "yearly") => {},
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
        moodData: state.moodData,
        chat: state.chat,
        memories: state.memories,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        initialized: state.initialized,
      }),
    }
  )
);
