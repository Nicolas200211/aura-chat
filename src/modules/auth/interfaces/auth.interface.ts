export interface UserCredentials {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserCredentials;
}
