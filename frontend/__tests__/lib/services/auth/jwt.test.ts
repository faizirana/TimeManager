/**
 * @fileoverview Tests for jwt auth utilities
 *
 * These tests verify that the JWT utilities:
 * 1. Correctly verify valid tokens
 * 2. Reject invalid or malformed tokens
 * 3. Expire tokens as expected
 */

import { verifyToken } from "@/lib/services/auth/jwt";

// Mock jose module completely to avoid ESM issues
jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

// Import the mocked function after mocking
import { jwtVerify } from "jose";
const mockJwtVerify = jwtVerify as jest.MockedFunction<typeof jwtVerify>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("JWT Utilities", () => {
  /**
   * TEST 1: Valid token
   *
   * Scenario: A valid JWT token is provided
   * Expected: The decoded payload is returned
   */
  it("should return decoded payload for valid token", async () => {
    // ARRANGE: create a mock payload
    const mockPayload = {
      userId: "123",
      email: "test@example.com",
      role: "user",
    };

    // Mock jwtVerify to return the payload
    mockJwtVerify.mockResolvedValue({
      payload: mockPayload,
      protectedHeader: { alg: "HS256", typ: "JWT" },
    } as any);

    // ACT: verify a token
    const result = await verifyToken("valid-token");

    // ASSERT: jwtVerify was called correctly
    expect(mockJwtVerify).toHaveBeenCalledWith(
      "valid-token",
      expect.any(Object), // SECRET as Uint8Array
    );

    // ASSERT: the result matches the payload
    expect(result).toEqual(mockPayload);
  });

  /**
   * TEST 2: Invalid token
   *
   * Scenario: An invalid JWT token is provided
   * Expected: The function returns null
   */
  it("should return null for invalid token", async () => {
    // ARRANGE: mock jwtVerify to throw error
    mockJwtVerify.mockRejectedValue(new Error("JWTInvalid"));

    // ACT: verify an invalid token
    const result = await verifyToken("invalid-token");

    // ASSERT: jwtVerify was called
    expect(mockJwtVerify).toHaveBeenCalledWith("invalid-token", expect.any(Object));

    // ASSERT: the result is null
    expect(result).toBeNull();
  });

  /**
   * TEST 3: Expired token
   *
   * Scenario: An expired JWT token is provided
   * Expected: The function returns null
   */
  it("should return null for expired token", async () => {
    // ARRANGE: mock jwtVerify to throw TokenExpiredError
    const error = new Error("jwt expired");
    error.name = "JWTExpired";
    mockJwtVerify.mockRejectedValue(error);

    // ACT: verify an expired token
    const result = await verifyToken("expired-token");

    // ASSERT: jwtVerify was called
    expect(mockJwtVerify).toHaveBeenCalledWith("expired-token", expect.any(Object));

    // ASSERT: the result is null (graceful handling of expired tokens)
    expect(result).toBeNull();
  });
});
