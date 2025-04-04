import { AxiosRequestConfig } from "axios";

export interface DecodedToken {
  id: string;
  username: string;
  exp: number;
  iat: number;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
