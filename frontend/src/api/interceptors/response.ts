import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { refreshAccessTokenRequest } from "../utils/token-refresh";
import axios from "axios";
import { ApiRequestConfig } from "../../types/api";

//Handle 401 errors and refresh the token when they occur
export const setupResponseInterceptor = (api: AxiosInstance): void => {
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ApiRequestConfig;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessTokenRequest();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Authentication failed:", refreshError);

          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
};
