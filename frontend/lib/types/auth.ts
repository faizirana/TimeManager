/**
 * @fileoverview Authentication types
 *
 * Provides type definitions for authentication flows:
 * - LoginCredentials: User login input data
 * - LoginResponse: Successful authentication response
 * - AuthenticationError: Custom error class for auth failures
 */

/**
 * User credentials for login
 *
 * @interface LoginCredentials
 * @property {string} email - User's email address
 * @property {string} password - User's password
 *
 * @example
 * ```typescript
 * const credentials: LoginCredentials = {
 *   email: "user@example.com",
 *   password: "securePassword123"
 * };
 * ```
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response received upon successful authentication
 *
 * @interface LoginResponse
 * @property {string} accessToken - JWT access token for authenticated requests
 * @property {object} [user] - Optional user information
 * @property {string} user.id - User's unique identifier
 * @property {string} user.email - User's email address
 * @property {string} user.name - User's full name
 * @property {string} user.role - User's role (e.g., "admin", "user", "manager")
 *
 * @example
 * ```typescript
 * const response: LoginResponse = {
 *   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   user: {
 *     id: "123",
 *     email: "user@example.com",
 *     name: "John Doe",
 *     role: "admin"
 *   }
 * };
 * ```
 */
export interface LoginResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Custom error class for authentication failures
 *
 * Extends the native Error class to provide additional context
 * for authentication-related errors.
 *
 * @class AuthenticationError
 * @extends Error
 * @property {string} name - Always "AuthenticationError"
 * @property {string} message - Human-readable error message
 * @property {string} [code] - Optional error code for programmatic handling
 *
 * @example
 * ```typescript
 * throw new AuthenticationError("Invalid credentials", "INVALID_LOGIN");
 *
 * // Usage in error handling
 * try {
 *   await loginUser(credentials);
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.log(error.code); // "INVALID_LOGIN"
 *     console.log(error.message); // "Invalid credentials"
 *   }
 * }
 * ```
 */
export class AuthenticationError extends Error {
  code?: string;

  /**
   * Creates a new AuthenticationError
   *
   * @param {string} message - Human-readable error message
   * @param {string} [code] - Optional error code (e.g., "INVALID_CREDENTIALS", "NETWORK_ERROR")
   */
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}
