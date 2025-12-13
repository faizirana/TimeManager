import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret_key"; // TODO: Put this in the .env

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 *
 * @param token - The JWT token to verify.
 * @returns
 */
export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}
