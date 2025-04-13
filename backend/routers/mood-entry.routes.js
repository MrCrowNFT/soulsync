import express from "express";
import {
  deleteMoodEntries,
  getEntries,
  newMoodEntry,
} from "../controller/mood-entry.controller.js";

const moodEntryRouter = express.Router();

moodEntryRouter.post("/", newMoodEntry);
moodEntryRouter.get("/:type", getEntries);
moodEntryRouter.delete("/", deleteMoodEntries);

export default moodEntryRouter;
