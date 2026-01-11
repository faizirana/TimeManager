/**
 * Error classification service
 * Determines how to handle, log, and display errors from API responses
 */

export type ErrorSeverity = "user-facing" | "silent" | "critical";

export interface ClassifiedError {
  severity: ErrorSeverity;
  userMessage: string;
  shouldLog: boolean;
  logLevel: "warn" | "error";
  statusCode?: number;
}

/**
 * Classifies an error based on status code and context
 * Determines if it should be shown to user, logged, etc.
 */
export function classifyError(statusCode?: number, message?: string): ClassifiedError {
  // Silent errors - normal flow, no console, no user notification
  if (statusCode === 401) {
    return {
      severity: "silent",
      userMessage: "Session expired. Please log in again.",
      shouldLog: false,
      logLevel: "warn",
      statusCode,
    };
  }

  // User-facing errors - show to user, no console
  if (statusCode === 400) {
    return {
      severity: "user-facing",
      userMessage: message ?? "Invalid request. Please check your input.",
      shouldLog: false,
      logLevel: "warn",
      statusCode,
    };
  }

  if (statusCode === 403) {
    return {
      severity: "user-facing",
      userMessage: message ?? "You don't have permission to do this.",
      shouldLog: false,
      logLevel: "warn",
      statusCode,
    };
  }

  if (statusCode === 404) {
    return {
      severity: "user-facing",
      userMessage: "Resource not found.",
      shouldLog: false,
      logLevel: "warn",
      statusCode,
    };
  }

  // Critical errors - show to user + console.error
  if (statusCode === 500) {
    return {
      severity: "critical",
      userMessage: "Something went wrong. Please try again later.",
      shouldLog: true,
      logLevel: "error",
      statusCode,
    };
  }

  if (statusCode && statusCode >= 500) {
    return {
      severity: "critical",
      userMessage: "Server error. Please try again later.",
      shouldLog: true,
      logLevel: "error",
      statusCode,
    };
  }

  // Network errors, timeout, etc.
  if (message?.includes("Failed to fetch") || message?.includes("Network")) {
    return {
      severity: "user-facing",
      userMessage: "Network error. Please check your connection.",
      shouldLog: false,
      logLevel: "warn",
    };
  }

  // Default: unknown error
  return {
    severity: "critical",
    userMessage: message ?? "An unexpected error occurred.",
    shouldLog: true,
    logLevel: "error",
  };
}

/**
 * Extracts error message from API response
 * Handles both JSON error responses and plain text
 */
export async function extractErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      const data = await response.json();
      return data.message ?? data.error ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  try {
    return await response.text();
  } catch {
    return response.statusText;
  }
}

/**
 * Determines if an error should trigger a user-facing notification
 */
export function shouldNotifyUser(severity: ErrorSeverity): boolean {
  return severity === "user-facing" || severity === "critical";
}

/**
 * Determines if an error should be logged to console
 */
export function shouldLogError(severity: ErrorSeverity): boolean {
  return severity === "critical";
}
