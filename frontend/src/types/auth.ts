import { IUser } from "./user";

export interface SignupParams {
  username: string;
  password: string;
  email: string;
  name: string;
  lastName: string;
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  birthDate: string | Date;
  photo?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  data: IUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
