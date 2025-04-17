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
  console.log("Sending signup request...")
  const res = await api.post("/auth/signup", signup);
  console.log("New account created succesfully")
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
