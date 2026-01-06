import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a token using bcrypt
 * @param {string} token - The token to hash
 * @returns {Promise<string>} The hashed token
 */
export const hashToken = (token) => {
  return bcrypt.hash(token, SALT_ROUNDS);
};

/**
 * Compare a plain token with a hashed token
 * @param {string} plainToken - The plain text token
 * @param {string} hashedToken - The hashed token from database
 * @returns {Promise<boolean>} True if tokens match
 */
export const compareTokenHash = (plainToken, hashedToken) => {
  return bcrypt.compare(plainToken, hashedToken);
};
