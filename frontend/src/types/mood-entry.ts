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
