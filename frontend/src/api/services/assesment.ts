import { Assessment } from "@/types";
import api from "../axios";

export const getAssesment = async (): Promise<Assessment> => {
  const res = await api.get("/assessment");
  return res.data;
};
