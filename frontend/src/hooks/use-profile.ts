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
import { formattedMoodData } from "../types/mood-entry";
import { updateUserPayload } from "@/types/user";
import { chatEntry } from "@/types/chat";
import { deleteChat, getChat, newChatEntry } from "@/api/services/chat-entry";
import { deleteAccount, updateUser } from "@/api/services/user";
import { getMoodData, newMoodEntryRequest } from "@/api/services/mood-entry";

type Profile = {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate?: Date | null;
  email: string;
  photo?: string |File;
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
  newChat: (message: string) => Promise<boolean>;
  getChat: () => Promise<boolean>;
  deleteChat: () => Promise<boolean>;

  //mood entries
  newMood: (mood: number) => Promise<boolean>;
  getMoods: (type: "weekly" | "monthly" | "yearly") => Promise<boolean>;

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
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
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
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
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
      newChat: async (message: string) => {
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
        //i can't send the entry with createdAt, since that
        //is assigned on the backend
        const newEntry: chatEntry = {
          message: message,
          sender: "user",
        };
        const tempEntry: chatEntry = {
          ...newEntry,
          _id: `temp-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          chat: [...state.chat, tempEntry],
          isLoading: true,
          error: null,
        }));

        try {
          //only getting the ai response from backend
          //so i should not just delete tempEntry
          const aiResponse = await newChatEntry(newEntry);
          set((state) => ({
            chat: [...state.chat, aiResponse.data],
            isLoading: false,
          }));
          return true;
        } catch (error) {
          //don't really need to delete the last message
          //since that one was sent by user
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to get ai response",
          });
          return false;
        }
      },
      //currently getting las 100 messages by default
      getChat: async () => {
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
        set({ isLoading: true, error: null });
        try {
          const chat = await getChat();
          set({
            chat: chat.data,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to get chat",
          });
          return false;
        }
      },
      //*note this deletes the whole chat but not the memories
      deleteChat: async () => {
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
        const previousChat = { ...get().chat };

        set({ isLoading: true, error: null });
        try {
          await deleteChat();
          set({
            chat: [],
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          // Rollback if API call fails
          set((state) => ({
            ...state,
            chat: previousChat,
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to delete chat",
          }));

          return false;
        }
      },

      //MOOD ENTRIES
      //newMood will not update any state, since the moods
      //need to be set into averages for it to be used on dashboard
      newMood: async (mood: number) => {
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
        set({ isLoading: true, error: null });
        try {
          await newMoodEntryRequest(mood);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to add new Mood",
          });
          return false;
        }
      },
      getMoods: async (type: "weekly" | "monthly" | "yearly") => {
        // Check if user is logged in
        if (!get()._id) {
          set({ error: "You must be logged in to chat" });
          return false;
        }
        const previousMoodData = { ...get().moodData };
        set({ isLoading: true, error: null });
        try {
          const moodData = await getMoodData(type);
          set({
            moodData: moodData.data,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set((state) => ({
            ...state,
            moodData: previousMoodData,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to get moods data",
          }));
          return false;
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
