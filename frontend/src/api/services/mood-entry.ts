import {
  getMoodEntriesResponse,
  newMoodEntryResponse,
} from "../../types/mood-entry";
import api from "../axios";

export const newMoodEntryRequest = async (
  mood: number
): Promise<newMoodEntryResponse> => {
  const res = await api.post("/mood/", mood);
  return res.data;
};

export const getMoodEntries = async (
  type: "weekly" | "monthly" | "yearly"
): Promise<getMoodEntriesResponse> => {
  const res = await api.get(`/mood/${type}`);
  return res.data;
};
