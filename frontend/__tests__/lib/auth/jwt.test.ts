/**
 * @fileoverview Tests for jwt auth utilities
 *
 * These tests verify that the JWT utilities:
 * 1. Correctly verify valid tokens
 * 2. Reject invalid or malformed tokens
 * 3. Expire tokens as expected
 */

import jwt from "jsonwebtoken";
import { verifyToken } from "@/lib/auth/jwt";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

const mockJwt = jwt as jest.Mocked<typeof jwt>;

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
  it("should return decoded payload for valid token", () => {
    // ARRANGE: create a mock payload
    const mockPayload = {
      userId: "123",
      email: "test@example.com",
      role: "user",
    };

    // Mock jwt.verify to return the payload
    mockJwt.verify.mockReturnValue(mockPayload as any);

    // ACT: verify a token
    const result = verifyToken("valid-token");

    // ASSERT: jwt.verify was called correctly
    expect(mockJwt.verify).toHaveBeenCalledWith(
      "valid-token",
      expect.any(String), // SECRET
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
  it("should return null for invalid token", () => {
    // ARRANGE: mock jwt.verify to throw error
    mockJwt.verify.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    // ACT: verify an invalid token
    const result = verifyToken("invalid-token");

    // ASSERT: jwt.verify was called
    expect(mockJwt.verify).toHaveBeenCalledWith("invalid-token", expect.any(String));

    // ASSERT: the result is null
    expect(result).toBeNull();
  });

  /**
   * TEST 3: Expired token
   *
   * Scenario: An expired JWT token is provided
   * Expected: The function returns null
   */
  it("should return null for expired token", () => {
    // ARRANGE: mock jwt.verify to throw TokenExpiredError
    mockJwt.verify.mockImplementation(() => {
      const error = new Error("jwt expired");
      error.name = "TokenExpiredError";
      throw error;
    });

    // ACT: verify an expired token
    const result = verifyToken("expired-token");

    // ASSERT: jwt.verify was called
    expect(mockJwt.verify).toHaveBeenCalledWith("expired-token", expect.any(String));

    // ASSERT: the result is null (graceful handling of expired tokens)
    expect(result).toBeNull();
  });
});
