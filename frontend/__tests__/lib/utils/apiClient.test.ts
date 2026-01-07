/**
 * Tests for API Client
 *
 * Tests the centralized API client functionality including:
 * - Token injection
 * - Automatic refresh on 401
 * - HTTP methods (GET, POST, PUT, DELETE)
 */

import { apiClient } from "../../../lib/utils/apiClient";

describe("apiClient", () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = jest.spyOn(global, "fetch");

    // Reset apiClient configuration
    apiClient.setTokenGetter(() => null);
    apiClient.setRefreshTokenFunction(async () => null);
    apiClient.setUnauthorizedHandler(() => {});
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe("Token injection", () => {
    it("should inject Bearer token in Authorization header", async () => {
      const mockToken = "test-token-123";
      apiClient.setTokenGetter(() => mockToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response);

      await apiClient.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.get("Authorization")).toBe(`Bearer ${mockToken}`);
    });

    it("should not inject token when requiresAuth is false", async () => {
      const mockToken = "test-token-123";
      apiClient.setTokenGetter(() => mockToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response);

      await apiClient.get("/test", { requiresAuth: false });

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.get("Authorization")).toBeNull();
    });

    it("should not inject token when no token available", async () => {
      apiClient.setTokenGetter(() => null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response);

      await apiClient.get("/test");

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.get("Authorization")).toBeNull();
    });
  });

  describe("Automatic token refresh", () => {
    it("should refresh token and retry request on 401", async () => {
      const oldToken = "old-token";
      const newToken = "new-token";
      let currentToken = oldToken;

      apiClient.setTokenGetter(() => currentToken);
      apiClient.setRefreshTokenFunction(async () => {
        currentToken = newToken;
        return newToken;
      });

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      // Second call (after refresh) succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response);

      const result = await apiClient.get("/test");

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: "success" });

      // Verify second call used new token
      const secondCallHeaders = mockFetch.mock.calls[1][1].headers;
      expect(secondCallHeaders.get("Authorization")).toBe(`Bearer ${newToken}`);
    });

    it("should call onUnauthorized when refresh fails", async () => {
      const onUnauthorized = jest.fn();

      apiClient.setTokenGetter(() => "old-token");
      apiClient.setRefreshTokenFunction(async () => null);
      apiClient.setUnauthorizedHandler(onUnauthorized);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      try {
        await apiClient.get("/test");
      } catch (_error) {
        // Expected to throw after onUnauthorized is called
      }

      expect(onUnauthorized).toHaveBeenCalled();
    });
  });

  describe("HTTP Methods", () => {
    it("should perform GET request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test" }),
      } as Response);

      const result = await apiClient.get("/users/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(result).toEqual({ id: 1, name: "Test" });
    });

    it("should perform POST request with body", async () => {
      const postData = { name: "New User", email: "test@example.com" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...postData }),
      } as Response);

      const result = await apiClient.post("/users", postData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        }),
      );
      expect(result).toEqual({ id: 1, ...postData });
    });

    it("should perform PUT request with body", async () => {
      const updateData = { name: "Updated User" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updateData }),
      } as Response);

      const result = await apiClient.put("/users/1", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual({ id: 1, ...updateData });
    });

    it("should perform DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await apiClient.delete("/users/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe("Error handling", () => {
    it("should throw error when GET fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(apiClient.get("/users/999")).rejects.toThrow("GET /users/999 failed: Not Found");
    });

    it("should throw error with message when POST fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid email format" }),
      } as Response);

      await expect(apiClient.post("/users", { email: "invalid" })).rejects.toThrow(
        "Invalid email format",
      );
    });

    it("should throw error when PUT fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      } as Response);

      await expect(apiClient.put("/users/1", { name: "Test" })).rejects.toThrow(
        "PUT /users/1 failed: Forbidden",
      );
    });

    it("should throw error when DELETE fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      await expect(apiClient.delete("/users/1")).rejects.toThrow(
        "DELETE /users/1 failed: Internal Server Error",
      );
    });
  });

  describe("Content-Type header", () => {
    it("should set default Content-Type to application/json", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.post("/test", { data: "test" });

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.get("Content-Type")).toBe("application/json");
    });

    it("should allow custom Content-Type header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.post(
        "/test",
        { data: "test" },
        {
          headers: { "Content-Type": "text/plain" },
        },
      );

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.get("Content-Type")).toBe("text/plain");
    });
  });
});
