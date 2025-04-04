import axios, { AxiosInstance } from "axios";
import { setupRequestInterceptor } from "./interceptors/request";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5500",
  withCredentials: true,
});
setupRequestInterceptor(api);

export default api;
