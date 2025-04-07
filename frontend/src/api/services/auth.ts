import api from "../axios";
import { refreshAccessTokenRequest } from "../utils/token-refresh";

interface SignupParams {
  username: string;
  password: string;
  email: string;
  name: string;
  lastName: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate: string | Date;
  photo?: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    name: string;
    lastName: string;
    gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
    birthDate: string; // Will be returned as ISO string from server
    photo: string;
  };
}

interface LoginParams {
  usename: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

//signup
export const signupRequest = async (
  signup: SignupParams
): Promise<SignupResponse> => {
  const res = await api.post("/auth/signup", signup);
  return res.data;
};

//login
export const loginRequest = async (
  login: LoginParams
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", login);
  if (res.data && res.data.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }
  return res.data;
};

//refresh token -> mainly for later exporting it to the index
export { refreshAccessTokenRequest as refreshAccessToken };

//logout
export const logoutRequest = async (): Promise<LogoutResponse> => {
  const res = await api.post("/auth/logout");
  return res.data;
};
