/**
 * Tests for AuthContext
 *
 * Tests the authentication context provider including:
 * - Login flow
 * - Logout flow
 * - Token refresh
 * - Session persistence
 * - API client configuration
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../../lib/contexts/AuthContext";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    setTokenGetter: jest.fn(),
    setRefreshTokenFunction: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

describe("AuthContext", () => {
  let mockFetch: jest.SpyInstance;
  let mockSessionStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.spyOn(global, "fetch");

    // Mock sessionStorage
    mockSessionStorage = {};
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn((key) => mockSessionStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete mockSessionStorage[key];
        }),
        clear: jest.fn(() => {
          mockSessionStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe("Initialization", () => {
    it("should start with no user and finish loading after initialization", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially loading should be true
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should restore session from sessionStorage", async () => {
      const storedSession = {
        token: "stored-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock successful fetchAndSetUser calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me response
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id response
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accessToken).toBe("stored-token");
      expect(result.current.user).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test",
        surname: "User",
      });
    });

    it("should handle corrupted sessionStorage data", async () => {
      mockSessionStorage["auth_session"] = "invalid-json";

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("auth_session");
    });

    it("should refresh token automatically when stored token is expired", async () => {
      const storedSession = {
        token: "expired-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock failed fetchAndSetUser (token expired)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        } as Response)
        // Mock successful refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: "new-refreshed-token" }),
        } as Response)
        // Mock successful fetchAndSetUser with new token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accessToken).toBe("new-refreshed-token");
      expect(result.current.user).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test",
        surname: "User",
      });
    });

    it("should clear session when both token and refresh fail", async () => {
      const storedSession = {
        token: "expired-token",
        user: { id: "1", email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock failed fetchAndSetUser (token expired)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        } as Response)
        // Mock failed refresh
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("auth_session");
    });
  });

  describe("Login", () => {
    it("should login successfully and fetch user data", async () => {
      const loginResponse = { accessToken: "new-token" };
      const userData = { email: "test@example.com", name: "Test", surname: "User" };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => loginResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", ...userData }), // /api/users/:id
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        credentials: "include",
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/me", {
        headers: { Authorization: "Bearer new-token" },
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/users/1", {
        headers: { Authorization: "Bearer new-token" },
      });

      expect(result.current.accessToken).toBe("new-token");
      expect(result.current.user).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test",
        surname: "User",
      });
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "auth_session",
        JSON.stringify({
          token: "new-token",
          userStorage: { email: "test@example.com", name: "Test", surname: "User" },
        }),
      );
    });

    it("should handle login failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials" }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login("test@example.com", "wrong-password");
        }),
      ).rejects.toThrow("Invalid credentials");

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it("should handle user fetch failure after successful login", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: "new-token" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false, // /api/auth/me fails
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login("test@example.com", "password123");
        }),
      ).rejects.toThrow("Failed to fetch user information");

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe("Logout", () => {
    it("should logout successfully and clear session", async () => {
      const storedSession = {
        token: "stored-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock successful fetchAndSetUser calls for session restore
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("auth_session");
    });

    it("should clear session even if logout API fails", async () => {
      const storedSession = {
        token: "stored-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock successful fetchAndSetUser calls for session restore
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
        } as Response)
        .mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("auth_session");
    });
  });

  describe("Token Refresh", () => {
    it("should refresh access token successfully", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: "refreshed-token" }),
      } as Response);

      let newToken: string | null = null;
      await act(async () => {
        newToken = await result.current.refreshAccessToken();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      expect(newToken).toBe("refreshed-token");
      expect(result.current.accessToken).toBe("refreshed-token");
    });

    it("should logout when refresh fails", async () => {
      const storedSession = {
        token: "stored-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock successful fetchAndSetUser calls for session restore
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Mock refresh failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      // Mock logout call
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      let newToken: string | null = "initial";
      await act(async () => {
        newToken = await result.current.refreshAccessToken();
      });

      expect(newToken).toBeNull();

      await waitFor(() => {
        expect(result.current.accessToken).toBeNull();
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe("Session Persistence", () => {
    it("should persist session to sessionStorage when user and token are set", async () => {
      const loginResponse = { accessToken: "new-token" };
      const userData = { email: "test@example.com", name: "Test", surname: "User" };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => loginResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", ...userData }), // /api/users/:id
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          "auth_session",
          JSON.stringify({
            token: "new-token",
            userStorage: { email: "test@example.com", name: "Test", surname: "User" },
          }),
        );
      });
    });

    it("should remove session from sessionStorage when logged out", async () => {
      const storedSession = {
        token: "stored-token",
        user: { email: "test@example.com", name: "Test", surname: "User" },
      };
      mockSessionStorage["auth_session"] = JSON.stringify(storedSession);

      // Mock successful fetchAndSetUser calls for session restore
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1" }), // /api/auth/me
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("auth_session");
    });
  });

  describe("useAuth hook error handling", () => {
    it("should throw error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleError.mockRestore();
    });
  });
});
