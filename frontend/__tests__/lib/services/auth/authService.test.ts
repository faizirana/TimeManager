/**
 * Tests for authService
 *
 * These tests verify that the authentication service:
 * 1. Calls the correct APIs via apiClient
 * 2. Handles responses correctly
 * 3. Handles errors correctly
 */

import { getCurrentUser, checkToken } from "@/lib/services/auth/authService";
import { apiClient } from "@/lib/utils/apiClient";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authService", () => {
  describe("getCurrentUser", () => {
    it("should return user data when authenticated", async () => {
      const mockUserData = {
        id: "user-1",
        email: "test@example.com",
        role: "user",
      };

      mockApiClient.get.mockResolvedValueOnce(mockUserData);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUserData);
      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should throw error when not authenticated", async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(getCurrentUser()).rejects.toThrow("Unauthorized");
      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
    });
  });

  describe("checkToken", () => {
    it("should return true when token is valid", async () => {
      const mockUserData = {
        id: "user-1",
        email: "test@example.com",
        role: "user",
      };

      mockApiClient.get.mockResolvedValueOnce(mockUserData);

      const result = await checkToken();

      expect(result).toBe(true);
      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
    });

    it("should return false when token is invalid", async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error("Unauthorized"));

      const result = await checkToken();

      expect(result).toBe(false);
    });

    it("should return false on network error", async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error("Network error"));

      const result = await checkToken();

      expect(result).toBe(false);
    });
  });
});
