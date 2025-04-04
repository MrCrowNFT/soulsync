import axios, { AxiosInstance } from "axios";
import { setupRequestInterceptor } from "./interceptors/request";
import { setupResponseInterceptor } from "./interceptors/response";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5500",
  withCredentials: true,
});
setupRequestInterceptor(api);
setupResponseInterceptor(api);

export default api;
