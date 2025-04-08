import api from "../axios";

export interface moodEntry {
  _id: string;
  userId: string;
  mood: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface newMoodEntryResponse {
  success: boolean;
  data: moodEntry;
}

interface formattedMoodData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface getMoodEntriesResponse {
  success: boolean;
  data: formattedMoodData;
}

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
