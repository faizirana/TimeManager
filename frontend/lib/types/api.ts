/**
 * @fileoverview Common API types
 *
 * Provides shared type definitions used across all API interactions:
 * - ApiError: Standard error response format
 * - ApiMessage: Standard success message format
 *
 * These types ensure consistent API response handling throughout the application.
 */

/**
 * Standard error response format for API calls
 *
 * @interface ApiError
 * @property {string} message - Human-readable error message
 * @property {string} [error] - Additional technical details or stack trace (optional)
 *
 * @example
 * ```typescript
 * const errorResponse: ApiError = {
 *   message: "User not found",
 *   error: "Database query returned no results"
 * };
 * ```
 */
export interface ApiError {
  message: string;
  error?: string; // Additional details in case of server error
}

/**
 * Standard success message response format for API calls
 *
 * @interface ApiMessage
 * @property {string} message - Success or informational message
 *
 * @example
 * ```typescript
 * const successResponse: ApiMessage = {
 *   message: "User created successfully"
 * };
 * ```
 */
export interface ApiMessage {
  message: string;
}
