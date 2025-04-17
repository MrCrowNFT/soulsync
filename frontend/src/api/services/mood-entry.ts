import {
  deleteMoodEntriesResponse,
  getMoodEntriesResponse,
  newMoodEntryResponse,
} from "../../types/mood-entry";
import api from "../axios";

export const newMoodEntryRequest = async (
  mood: number
): Promise<newMoodEntryResponse> => {
  console.log("Sending new mood entry...");
  const res = await api.post("/mood/", { mood: mood });
  return res.data;
};

export const getMoodData = async (
  type: "weekly" | "monthly" | "yearly"
): Promise<getMoodEntriesResponse> => {
  console.log(`Getting mood ${type} averages...`);
  const res = await api.get(`/mood/${type}`);
  return res.data;
};

//* Currently not using this
export const deleteMoodEntries =
  async (): Promise<deleteMoodEntriesResponse> => {
    const res = await api.delete(`/mood/`);
    return res.data;
  };
