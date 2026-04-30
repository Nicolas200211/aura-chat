export interface UserCredentials {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserCredentials;
}
