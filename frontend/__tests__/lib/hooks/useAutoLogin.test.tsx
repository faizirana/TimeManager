/**
 * @fileoverview Tests for useAutoLogin hook
 *
 * These tests verify that the auto-login hook:
 * 1. Checks if user is authenticated on mount
 * 2. Redirects to dashboard if user is authenticated
 * 3. Shows login form if user is not authenticated
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAutoLogin } from "@/lib/hooks/useAutoLogin";
import { AuthProvider } from "@/lib/contexts/AuthContext";

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

describe("useAutoLogin Hook", () => {
  it("should show auto-login message and redirect when user is authenticated", async () => {
    // Mock sessionStorage with valid data
    (Storage.prototype.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "auth_session")
        return JSON.stringify({
          token: "valid-token",
          user: { email: "test@example.com", name: "Test", surname: "User" },
        });
      return null;
    });

    // Mock fetch for token validation
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }), // /api/auth/me
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@example.com", name: "Test", surname: "User" }), // /api/users/:id
      } as Response);

    jest.useFakeTimers();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAutoLogin(), { wrapper });

    // Wait for auth check to complete
    await waitFor(() => {
      expect(result.current.shouldShowAutoLoginMessage).toBe(true);
    });

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(2500);

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    jest.useRealTimers();
  });

  it("should not redirect when user is not authenticated", async () => {
    // No sessionStorage data - unauthenticated
    (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAutoLogin(), { wrapper });

    // Wait for loading to finish
    await waitFor(() => {
      expect(result.current.isCheckingToken).toBe(false);
    });

    // Verify no auto-login message or redirect
    expect(result.current.shouldShowAutoLoginMessage).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
