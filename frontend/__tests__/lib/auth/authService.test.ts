/**
 * Tests for authService
 *
 * These tests verify that the authentication service:
 * 1. Calls the correct APIs
 * 2. Handles responses correctly
 * 3. Handles errors correctly
 */

import { loginUser, logoutUser } from "@/lib/services/auth/authService";
import { AuthenticationError } from "@/lib/types/auth";

// Global fetch mock
// Declared before each test to start from a clean state
beforeEach(() => {
  // Reset all mocks between each test
  jest.clearAllMocks();

  // Ensure fetch exists (can be undefined in some environments)
  global.fetch = jest.fn();
});

describe("authService", () => {
  describe("loginUser", () => {
    /**
     * TEST 1: Nominal case - Successful login
     *
     * Scenario: User provides correct credentials
     * Expected: Function returns accessToken and user
     */
    it("should successfully login with valid credentials", async () => {
      // ARRANGE: Prepare data
      const mockResponse = {
        accessToken: "fake-jwt-token-123",
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "user",
        },
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // ACT: Execute the function to test
      const result = await loginUser({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT: Verify results

      // 1. Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/login",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
          credentials: "include",
        }),
      );

      // 2. Verify response is correct
      expect(result).toEqual(mockResponse);
    });

    /**
     * TEST 2: Error - Invalid credentials (401)
     *
     * Scenario: User provides wrong password
     * Expected: AuthenticationError is thrown with correct message
     */
    it("should throw AuthenticationError on invalid credentials", async () => {
      // ARRANGE
      const mockErrorResponse = {
        message: "Identifiants incorrects",
        code: "INVALID_CREDENTIALS",
      };

      // Mock of 401 response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      // ACT & ASSERT
      // Use rejects to test that a Promise rejects
      await expect(
        loginUser({
          email: "test@example.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow(AuthenticationError);

      // Must recreate the mock for the second call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      await expect(
        loginUser({
          email: "test@example.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow("Identifiants incorrects");
    });

    /**
     * TEST 3: Error - Invalid response (not JSON)
     *
     * Scenario: Server returns HTML instead of JSON
     * Expected: AuthenticationError with appropriate message
     */
    it("should throw AuthenticationError when response is not JSON", async () => {
      // ARRANGE
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          // Simulate a JSON parsing error
          throw new SyntaxError("Unexpected token < in JSON");
        },
      });

      // ACT & ASSERT
      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Le serveur a renvoyé une réponse invalide");

      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toMatchObject({
        code: "INVALID_RESPONSE",
      });
    });

    /**
     * TEST 4: Network error
     *
     * Scenario: Server is unreachable (no internet connection)
     * Expected: AuthenticationError with NETWORK_ERROR code
     */
    it("should throw AuthenticationError on network failure", async () => {
      // ARRANGE
      // TypeError is thrown by fetch in case of network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Failed to fetch"));

      // ACT & ASSERT
      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Impossible de contacter le serveur");

      // Second call - recreate the mock
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toMatchObject({
        code: "NETWORK_ERROR",
      });
    });

    /**
     * TEST 5: 500 error (Internal Server Error)
     *
     * Scenario: Backend crashes
     * Expected: AuthenticationError with backend message or default message
     */
    it("should handle 500 errors gracefully", async () => {
      // ARRANGE
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Erreur interne du serveur",
        }),
      });

      // ACT & ASSERT
      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Erreur interne du serveur");
    });

    /**
     * TEST 6: 500 error without message
     *
     * Scenario: Backend returns 500 without details
     * Expected: Default message
     */
    it("should use default error message when backend provides none", async () => {
      // ARRANGE
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}), // No message
      });

      // ACT & ASSERT
      await expect(
        loginUser({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Échec de l'authentification");
    });
  });

  describe("logoutUser", () => {
    /**
     * TEST 7: Successful logout
     *
     * Scenario: Normal logout
     * Expected: No error, fetch called correctly
     */
    it("should successfully logout", async () => {
      // ARRANGE
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // ACT
      await logoutUser();

      // ASSERT
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/logout",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    /**
     * TEST 8: Logout with server error (should NOT crash)
     *
     * Scenario: Server responds 500 to logout
     * Expected: No error thrown (graceful degradation)
     */
    it("should not throw error when logout fails on server", async () => {
      // ARRANGE
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // ACT & ASSERT
      // logoutUser should NOT throw
      await expect(logoutUser()).resolves.toBeUndefined();

      // But should log a warning
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    /**
     * TEST 9: Logout with network error (should NOT crash)
     *
     * Scenario: No internet connection during logout
     * Expected: No error thrown
     */
    it("should not throw error on network failure during logout", async () => {
      // ARRANGE
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network error"));

      // ACT & ASSERT
      await expect(logoutUser()).resolves.toBeUndefined();

      // But should log the error
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
