/**
 * Authentication types
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

export class AuthenticationError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}
