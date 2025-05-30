import axios, { AxiosInstance } from "axios";
import { setupRequestInterceptor } from "./interceptors/request";
import { setupResponseInterceptor } from "./interceptors/response";

const urlApi =
  import.meta.env.VITE_API_URL || "https://soulsync-fxrq.onrender.com";
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

const api: AxiosInstance = axios.create({
  baseURL: urlApi,
  withCredentials: true,
});
setupRequestInterceptor(api);
setupResponseInterceptor(api);

export default api;
