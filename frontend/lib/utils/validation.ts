/**
 * Validation utilities for form inputs
 * All validators return {valid: boolean, error?: string}
 */

import { VALIDATION_ERRORS } from "../types/errorMessages";

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a field is not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns Validation result
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { valid: false, error: VALIDATION_ERRORS.REQUIRED(fieldName) };
  }
  return { valid: true };
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: VALIDATION_ERRORS.INVALID_EMAIL };
  }
  return { valid: true };
}

/**
 * Validates password strength
 * Requirements: min 8 chars, 1 uppercase, 1 digit, 1 special character
 * @param password - The password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { valid: false, error: VALIDATION_ERRORS.WEAK_PASSWORD };
  }
  return { valid: true };
}

/**
 * Validates French mobile phone number
 * Format: 10 digits starting with 0
 * @param mobile - The mobile number to validate
 * @returns Validation result
 */
export function validateMobile(mobile: string): ValidationResult {
  const mobileRegex = /^0[1-9][0-9]{8}$/;
  if (!mobileRegex.test(mobile)) {
    return { valid: false, error: VALIDATION_ERRORS.INVALID_MOBILE };
  }
  return { valid: true };
}

/**
 * Validates country code format
 * Format: + followed by 1-3 digits
 * @param code - The country code to validate
 * @returns Validation result
 */
export function validateCountryCode(code: string): ValidationResult {
  const codeRegex = /^\+\d{1,3}$/;
  if (!codeRegex.test(code)) {
    return { valid: false, error: VALIDATION_ERRORS.INVALID_COUNTRY_CODE };
  }
  return { valid: true };
}

/**
 * Validates time format (HH:MM)
 * @param time - The time string to validate
 * @returns Validation result
 */
export function validateTimeFormat(time: string): ValidationResult {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return { valid: false, error: VALIDATION_ERRORS.INVALID_TIME_FORMAT };
  }
  return { valid: true };
}

/**
 * Validates that end time is after start time
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Validation result
 */
export function validateTimeRange(startTime: string, endTime: string): ValidationResult {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  if (end <= start) {
    return { valid: false, error: VALIDATION_ERRORS.TIME_RANGE_INVALID };
  }
  return { valid: true };
}

/**
 * Validates that at least one item is selected
 * @param items - Array of selected items
 * @returns Validation result
 */
export function validateSelection<T>(items: T[]): ValidationResult {
  if (!items?.length) {
    return { valid: false, error: VALIDATION_ERRORS.EMPTY_SELECTION };
  }
  return { valid: true };
}
