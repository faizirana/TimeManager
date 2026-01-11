/**
 * @fileoverview Tests for useAuth hook (UI wrapper)
 *
 * These tests verify that the UI authentication hook:
 * 1. Wraps AuthContext correctly
 * 2. Handles form submission with navigation
 * 3. Handles logout with navigation
 * 4. Manages loading and error states
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { FormEvent } from "react";

// Mock dependencies
jest.mock("next/navigation");

// Mock fetch globally
global.fetch = jest.fn();

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();

  // Router configuration
  mockUseRouter.mockReturnValue({
    push: mockPush,
  } as any);
});

describe("useAuth Hook (UI Wrapper)", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  /**
   * TEST 1: Initial State
   *
   * Scenario: Hook is first initialized
   * Expected: loading is false, error is an empty string, user is null
   */
  it("should initialize with correct default values", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("");
    expect(result.current.user).toBeNull();
  });

  /**
   * TEST 2: Login Success
   *
   * Scenario: User provides correct credentials via form
   * Expected: calls context login, navigates to dashboard, no errors
   */
  it("should handle successful login and navigate to dashboard", async () => {
    // Mock successful login and user fetch
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }), // /api/auth/me
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "password123");
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  /**
   * TEST 3: Login Failure
   *
   * Scenario: User provides incorrect credentials
   * Expected: error state is set, no navigation occurs
   */
  it("should handle failed login and set error message", async () => {
    // Mock failed login
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "wrongpassword");
    });

    expect(result.current.error).toBe("Invalid credentials");
    expect(result.current.loading).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Login with unexpected error
   *
   * Scenario: Network error during login
   * Expected: error message is set, no navigation
   */
  it("should handle unexpected error during login", async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "password123");
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.loading).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TEST 5: Logout Success
   *
   * Scenario: User logs out successfully
   * Expected: calls context logout, navigates to login
   */
  it("should handle successful logout and navigate to login", async () => {
    // Setup authenticated state
    (Storage.prototype.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "auth_session") {
        return JSON.stringify({
          token: "test-token",
          user: { email: "test@example.com", name: "Test", surname: "User" },
        });
      }
      return null;
    });

    // Mock fetchAndSetUser calls for session restore
    (global.fetch as jest.Mock)
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
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  /**
   * TEST 6: Logout with error
   *
   * Scenario: Logout API fails
   * Expected: still navigates to login (graceful degradation)
   */
  it("should redirect to login even if logout API fails", async () => {
    // Setup authenticated state
    (Storage.prototype.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "auth_session") {
        return JSON.stringify({
          token: "test-token",
          user: { email: "test@example.com", name: "Test", surname: "User" },
        });
      }
      return null;
    });

    // Mock fetchAndSetUser calls for session restore
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }), // /api/auth/me
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
      } as Response)
      .mockRejectedValueOnce(new Error("Server error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    await act(async () => {
      await result.current.logout();
    });

    // Logout error is silently handled and not logged to console
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  /**
   * TEST 7: Loading state during login
   *
   * Scenario: Login is in progress
   * Expected: loading state is true during operation
   */
  it("should set loading state during login operation", async () => {
    let resolveLogin: any;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => loginPromise);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleSubmit(mockEvent, "test@example.com", "password123");
    });

    // Check loading state before promise resolves
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Resolve the promise
    resolveLogin({
      ok: true,
      json: async () => ({ accessToken: "test-token" }),
    });

    // Mock user fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", email: "test@example.com", role: "user" }),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  /**
   * TEST 8: User data from context
   *
   * Scenario: User is authenticated
   * Expected: user data is available from the hook
   */
  it("should provide user data from AuthContext", async () => {
    // Mock sessionStorage with user data
    (Storage.prototype.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "auth_session") {
        return JSON.stringify({
          token: "test-token",
          user: { email: "test@example.com", name: "Test", surname: "Admin" },
        });
      }
      return null;
    });

    // Mock fetchAndSetUser calls for session restore
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }), // /api/auth/me
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "Admin" }), // /api/users/:id
      } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(result.current.user).toEqual({
      id: "1",
      email: "test@example.com",
      name: "Test",
      surname: "Admin",
    });
  });

  /**
   * TEST 9: Error is cleared on new login attempt
   *
   * Scenario: User had a failed login, tries again
   * Expected: previous error is cleared when new attempt starts
   */
  it("should clear error on new login attempt", async () => {
    // First attempt fails
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "wrongpassword");
    });

    expect(result.current.error).toBe("Invalid credentials");

    // Second attempt succeeds
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }), // /api/auth/me
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
      });

    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "correctpassword");
    });

    expect(result.current.error).toBe("");
  });
});
