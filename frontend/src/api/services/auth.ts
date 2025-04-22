import api from "../axios";
import { refreshAccessTokenRequest } from "../utils/token-refresh";
import {
  SignupParams,
  SignupResponse,
  LoginParams,
  LoginResponse,
  LogoutResponse,
} from "../../types/auth";

//signup
export const signupRequest = async (
  signup: SignupParams
): Promise<SignupResponse> => {
  console.log("Sending signup request...");
  const res = await api.post("/auth/signup", signup);
  console.log("New account created succesfully.\nRedirecting to login");
  return res.data;
};

//login
export const loginRequest = async (
  login: LoginParams
): Promise<LoginResponse> => {
  console.log("Sending login request...");
  const res = await api.post("/auth/login", login);
  if (res.data && res.data.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
    console.log("Login successful");
  }
  return res.data;
};

//refresh token -> mainly for later exporting it to the index
export { refreshAccessTokenRequest as refreshAccessToken };

//logout
export const logoutRequest = async (): Promise<LogoutResponse> => {
  console.log("Sending logout request...");
  const res = await api.post("/auth/logout");
  return res.data;
};
