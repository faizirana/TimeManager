/**
 * @fileoverview Tests for useAuth hook
 *
 * These tests verify that the authentication service:
 * 1. Initializes with correct default states
 * 2. Handles login flow correctly (success and failure)
 * 3. Handles logout flow correctly
 */

import { loginUser, logoutUser } from "@/lib/auth/authService";
import { useRouter } from "next/navigation";

// Define mocks
jest.mock("next/navigation");
jest.mock("@/lib/auth/authService");

import { renderHook } from "@testing-library/react";
import { useAuth } from "@/lib/auth/useAuth";
import { act } from "@testing-library/react";
import { FormEvent } from "react";
import { AuthenticationError } from "@/lib/auth/types";

// Mock typings for TypeScript
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockLogoutUser = logoutUser as jest.MockedFunction<typeof logoutUser>;

const mockPush = jest.fn();

// Setup before each test
beforeEach(() => {
  jest.clearAllMocks();

  // Router configuration
  mockUseRouter.mockReturnValue({
    push: mockPush,
    // Add other router methods if needed
  } as any);

  // loginUser configuration (successful by default)
  mockLoginUser.mockResolvedValue({
    accessToken: "fake-jwt-token",
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    },
  } as any);

  // logoutUser configuration (successful by default)
  mockLogoutUser.mockResolvedValue(undefined);
});

describe("useAuth Hook", () => {
  /**
   * TEST 1: Initial State
   *
   * Scenario: Hook is first initialized
   * Expected: loading is false, error is an empty string
   */
  it("should initialize with correct default values", () => {
    // ARRANGE: render the hook
    const { result } = renderHook(() => useAuth());

    // ASSERT: check initial values
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  /**
   * TEST 2: Login Success
   *
   * Scenario: User provides correct credentials
   * Expected: loading is true during login, then false after,
   *           error remains an empty string, and navigation occurs
   */
  it("should handle successful login", async () => {
    // ARRANGE: render hook and mock successful login
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    // ACT: call handleSubmit
    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "password123");
    });

    // ASSERT: loginUser was called with correct credentials
    expect(mockLoginUser).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    // ASSERT: Navigation to dashboard occurred
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    // ASSERT: loading is false after completion
    expect(result.current.loading).toBe(false);
    // ASSERT: error is empty
    expect(result.current.error).toBe("");
  });

  /**
   * TEST 3: Login Failure
   *
   * Scenario: User provides incorrect credentials
   * Expected: loading is true during login, then false after,
   *           error is set with appropriate message, no navigation occurs
   */
  it("should handle failed login", async () => {
    // ARRANGE: render hook and mock failed login
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    mockLoginUser.mockRejectedValueOnce(new AuthenticationError("Invalid credentials"));

    // ACT: call handleSubmit
    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "wrongpassword");
    });

    // ASSERT: Error message is set
    expect(result.current.error).toBe("Invalid credentials");
    // ASSERT: loading is false after completion
    expect(result.current.loading).toBe(false);
    // ASSERT: No navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Login with unexpected error
   *
   * Scenario: An unexpected error occurs during login
   * Expected: loading is true during login, then false after,
   *           error is set with generic message, no navigation occurs
   */
  it("should handle unexpected error during login", async () => {
    // ARRANGE: render hook and mock unexpected error
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;

    // Mock an unexpected error (not AuthenticationError)
    mockLoginUser.mockRejectedValueOnce(new Error("Network error"));

    // ACT: call handleSubmit
    await act(async () => {
      await result.current.handleSubmit(mockEvent, "test@example.com", "password123");
    });

    // ASSERT: Error message is set
    expect(result.current.error).toBe("Une erreur inattendue est survenue.");
    // ASSERT: loading is false after completion
    expect(result.current.loading).toBe(false);
    // ASSERT: No navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TEST 5: Logout Success
   *
   * Scenario: User logs out successfully
   * Expected: loading is true during logout, then false after,
   *           error remains an empty string, and navigation to login occurs
   */
  it("should handle successful logout", async () => {
    // ARRANGE: render the hook
    const { result } = renderHook(() => useAuth());

    // ACT: call logout
    await act(async () => {
      await result.current.logout();
    });

    // ASSERT: logoutUser was called
    expect(mockLogoutUser).toHaveBeenCalled();

    // ASSERT: navigation to login
    expect(mockPush).toHaveBeenCalledWith("/login");

    // ASSERT: final state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  /**
   * TEST 6: Logout with error
   *
   * Scenario: An error occurs during logout
   * Expected: loading is true during logout, then false after,
   *           error remains an empty string, and navigation to login occurs anyway
   */
  it("should redirect to login even if logout fails", async () => {
    // ARRANGE: render hook and mock logout failure
    const { result } = renderHook(() => useAuth());

    // Mock logout to fail
    mockLogoutUser.mockRejectedValueOnce(new Error("Server error"));

    // ACT: call logout
    await act(async () => {
      await result.current.logout();
    });

    // ASSERT: logoutUser was called
    expect(mockLogoutUser).toHaveBeenCalled();

    // ASSERT: navigation to login STILL happened (graceful failure!)
    expect(mockPush).toHaveBeenCalledWith("/login");

    // ASSERT: final state
    expect(result.current.loading).toBe(false);

    // Important: error stays empty because catch doesn't call setError
    expect(result.current.error).toBe("");
  });
});
