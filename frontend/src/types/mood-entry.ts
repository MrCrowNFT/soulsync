import { LucideIcon } from "lucide-react";

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

export interface formattedMoodData {
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

export interface deleteMoodEntriesResponse {
  success: boolean;
  message: string;
  details?: string;
}

export interface Mood {
  value: number;
  icon: LucideIcon;
  label: string;
  color: string;
}
