import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../../types/api";
import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { refreshAccessTokenRequest } from "../utils/token-refresh";

export const setupRequestInterceptor = (api: AxiosInstance): void => {
  api.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        try {
          // Check if token is expired or about to expire
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp - currentTime < 30) {
            // 30 seconds before expiration
            const newToken = await refreshAccessTokenRequest();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              return config;
            }
          }

          config.headers.Authorization = `Bearer ${accessToken}`;
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};
