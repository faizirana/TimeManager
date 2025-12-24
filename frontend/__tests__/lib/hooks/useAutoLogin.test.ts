/**
 * @fileoverview Tests for useAutoLogin hook
 *
 * These tests verify that the auto-login hook:
 * 1. Checks for valid token on mount
 * 2. Redirects to dashboard if token is valid
 * 3. Shows login form if token is invalid
 * 4. Handles token verification errors
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { checkToken } from "@/lib/services/auth/authService";
import { useAutoLogin } from "@/lib/hooks/useAutoLogin";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("@/lib/services/auth/authService");

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockCheckToken = checkToken as jest.MockedFunction<typeof checkToken>;

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Router configuration
  mockUseRouter.mockReturnValue({
    push: mockPush,
  } as any);
});

describe("useAutoLogin Hook", () => {
  /**
   * TEST 1: Initial state - checking token
   *
   * Scenario: Hook is mounted
   * Expected: isCheckingToken is true initially
   */
  it("should start with isCheckingToken true", () => {
    // ARRANGE: Mock checkToken to never resolve (to keep initial state)
    mockCheckToken.mockImplementation(() => new Promise(() => {}));

    // ACT: Render the hook
    const { result } = renderHook(() => useAutoLogin());

    // ASSERT: Verify initial state
    expect(result.current.isCheckingToken).toBe(true);
    expect(result.current.shouldShowAutoLoginMessage).toBe(false);
  });

  /**
   * TEST 2: Valid token - auto-login flow
   *
   * Scenario: User has a valid token
   * Expected: Shows auto-login message and redirects to dashboard
   */
  it("should show auto-login message and redirect when token is valid", async () => {
    // ARRANGE: Mock checkToken to return true (valid token)
    mockCheckToken.mockResolvedValue(true);

    // Use fake timers to control setTimeout
    jest.useFakeTimers();

    // ACT: Render the hook
    const { result } = renderHook(() => useAutoLogin());

    // Wait for checkToken to resolve
    await waitFor(() => {
      expect(result.current.shouldShowAutoLoginMessage).toBe(true);
    });

    // ASSERT: Verify auto-login message is shown
    expect(result.current.shouldShowAutoLoginMessage).toBe(true);
    expect(result.current.isCheckingToken).toBe(true);

    // ACT: Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2500);

    // ASSERT: Verify redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Cleanup
    jest.useRealTimers();
  });

  /**
   * TEST 3: Invalid token - show login form
   *
   * Scenario: User has no valid token
   * Expected: Stops checking and allows login form to be shown
   */
  it("should stop checking and show login form when token is invalid", async () => {
    // ARRANGE: Mock checkToken to return false (invalid token)
    mockCheckToken.mockResolvedValue(false);

    // ACT: Render the hook
    const { result } = renderHook(() => useAutoLogin());

    // ASSERT: Wait for token check to complete
    await waitFor(() => {
      expect(result.current.isCheckingToken).toBe(false);
    });

    // ASSERT: Verify no auto-login message is shown
    expect(result.current.shouldShowAutoLoginMessage).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Token verification error
   *
   * Scenario: checkToken throws an error
   * Expected: Stops checking and shows login form
   */
  it("should handle token verification errors gracefully", async () => {
    // ARRANGE: Mock checkToken to throw an error
    mockCheckToken.mockRejectedValue(new Error("Network error"));

    // Spy on console.error to verify error is logged
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // ACT: Render the hook
    const { result } = renderHook(() => useAutoLogin());

    // ASSERT: Wait for error handling
    await waitFor(() => {
      expect(result.current.isCheckingToken).toBe(false);
    });

    // ASSERT: Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("Auto-login check failed:", expect.any(Error));

    // ASSERT: Verify no redirect and no auto-login message
    expect(result.current.shouldShowAutoLoginMessage).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();

    // Cleanup
    consoleErrorSpy.mockRestore();
  });

  /**
   * TEST 5: checkToken is called on mount
   *
   * Scenario: Hook is rendered
   * Expected: checkToken is called once
   */
  it("should call checkToken once on mount", async () => {
    // ARRANGE: Mock checkToken to return false
    mockCheckToken.mockResolvedValue(false);

    // ACT: Render the hook
    renderHook(() => useAutoLogin());

    // ASSERT: Verify checkToken was called
    await waitFor(() => {
      expect(mockCheckToken).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * TEST 6: Redirect delay matches toast duration
   *
   * Scenario: Valid token triggers redirect
   * Expected: Redirect happens after 2500ms
   */
  it("should redirect after 2500ms when token is valid", async () => {
    // ARRANGE: Mock checkToken to return true
    mockCheckToken.mockResolvedValue(true);
    jest.useFakeTimers();

    // ACT: Render the hook
    renderHook(() => useAutoLogin());

    // Wait for auto-login message
    await waitFor(() => {
      expect(mockCheckToken).toHaveBeenCalled();
    });

    // ASSERT: Verify no redirect before timeout
    expect(mockPush).not.toHaveBeenCalled();

    // ACT: Advance timers by less than 2500ms
    jest.advanceTimersByTime(2000);
    expect(mockPush).not.toHaveBeenCalled();

    // ACT: Advance timers to complete the delay
    jest.advanceTimersByTime(500);

    // ASSERT: Verify redirect happened
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Cleanup
    jest.useRealTimers();
  });
});
