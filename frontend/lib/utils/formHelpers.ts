/**
 * Form helper utilities for common form operations
 */

/**
 * Resets multiple form fields by calling their setter functions
 * @param setters - Array of state setter functions
 * @param defaultValue - Default value to set (defaults to empty string)
 */
export function resetFormFields(setters: Array<(value: string) => void>, defaultValue = ""): void {
  setters.forEach((setter) => setter(defaultValue));
}

/**
 * Normalizes phone number to E.164 format
 * @param countryCode - Country code (e.g., "+33")
 * @param mobile - Mobile number (e.g., "0612345678")
 * @returns E.164 formatted number (e.g., "+33612345678")
 */
export function normalizePhoneNumber(countryCode: string, mobile: string): string {
  const cleanMobile = mobile.trim();
  const normalizedMobile = cleanMobile.startsWith("0") ? cleanMobile.slice(1) : cleanMobile;
  return `${countryCode.trim()}${normalizedMobile}`;
}

/**
 * Passes E.164 formatted number into country code and local number
 * For French numbers (+33), assumes local number starts with 0
 * @param e164Number - E.164 formatted number (e.g., "+33612345678")
 * @returns Object with countryCode and localNumber
 */
export function parsePhoneNumber(e164Number: string): { countryCode: string; localNumber: string } {
  // Try to match known country codes first (France: +33)
  // For French numbers, we expect the local number to start with 0
  if (e164Number.startsWith("+33") && e164Number.length >= 12) {
    return {
      countryCode: "+33",
      localNumber: `0${e164Number.slice(3)}`,
    };
  }

  // For other countries, try to detect 1-3 digit country codes
  // Prioritize shorter codes: try 1 digit, then 2, then 3
  for (let codeLength = 1; codeLength <= 3; codeLength++) {
    if (e164Number.length > codeLength + 4) {
      // At least 4 digits for local number
      const countryCode = e164Number.slice(0, codeLength + 1); // +1 for the '+'
      const localNumber = e164Number.slice(codeLength + 1);

      // Validate it looks like a real phone number structure
      if (countryCode.match(/^\+\d+$/) && localNumber.match(/^\d{4,}$/)) {
        return { countryCode, localNumber };
      }
    }
  }

  return { countryCode: "+33", localNumber: e164Number }; // Default fallback
}

/**
 * Parses error from unknown source and returns user-friendly message
 * @param error - Error from API or validation
 * @returns User-friendly error message
 */
export function parseFormError(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Une erreur s'est produite. Veuillez réessayer.";
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Formats a shift string (e.g., "09:00 - 17:00") to display format
 * @param shift - Shift string
 * @returns Formatted shift or fallback
 */
export function formatShift(shift: string | null | undefined): string {
  return shift ?? "Non défini";
}

/**
 * Capitalizes first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
