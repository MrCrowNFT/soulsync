import { Mood } from "@/types/mood-entry";
import { Frown, Meh, Smile, Angry, Laugh } from "lucide-react";

export const moods: Mood[] = [
  { value: 1, icon: Angry, label: "Very Unhappy", color: "text-red-500" },
  { value: 2, icon: Frown, label: "Unhappy", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Neutral", color: "text-yellow-500" },
  { value: 4, icon: Smile, label: "Happy", color: "text-lime-500" },
  { value: 5, icon: Laugh, label: "Very Happy", color: "text-green-500" },
];
