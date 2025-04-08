import express from "express";
import {
  deleteMoodEntry,
  getEntries,
  newMoodEntry,
} from "../controller/mood-entry.controller";

const moodEntryRouter = express.Router();

moodEntryRouter.post("/", newMoodEntry);
moodEntryRouter.get("/", getEntries);
moodEntryRouter.delete("/", deleteMoodEntry);

export default moodEntryRouter;
