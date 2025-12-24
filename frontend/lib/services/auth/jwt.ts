import { jwtVerify } from "jose";

const SECRET = process.env.ACCESS_TOKEN_SECRET ?? "dev_secret_key";

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * Uses jose library which is compatible with Edge Runtime.
 *
 * @param token - The JWT token to verify.
 * @returns The decoded payload if valid, null otherwise
 */
export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
