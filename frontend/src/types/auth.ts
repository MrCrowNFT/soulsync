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

export interface LoginParams {
  usename: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
