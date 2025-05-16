import api from "../axios";

export const getAssesment = async (): Promise<string> => {
  const res = await api.get("/assessment");
  return res.data;
};
