/**
 * Tests for useProtectedRoute hook
 *
 * Tests client-side route protection including:
 * - Redirect to login when not authenticated
 * - Stay on page when authenticated
 * - Loading state handling
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useProtectedRoute } from "../../../lib/hooks/useProtectedRoute";
import { useAuth } from "@/lib/contexts/AuthContext";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("useProtectedRoute", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to /login when not authenticated and not loading", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { result } = renderHook(() => useProtectedRoute());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("should not redirect when authenticated", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "admin" as const,
      name: "Test",
      surname: "User",
      mobileNumber: "+33601020304",
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      accessToken: "test-token",
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { result } = renderHook(() => useProtectedRoute());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
  });

  it("should not redirect while loading", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { result } = renderHook(() => useProtectedRoute());

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it("should redirect after loading completes with no user", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { rerender } = renderHook(() => useProtectedRoute());

    expect(mockPush).not.toHaveBeenCalled();

    // Simulate loading completed
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    rerender();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should return user and loading state", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "admin" as const,
      name: "Test",
      surname: "User",
      mobileNumber: "+33601020304",
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      accessToken: "test-token",
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { result } = renderHook(() => useProtectedRoute());

    expect(result.current).toEqual({
      user: mockUser,
      loading: false,
    });
  });

  it("should handle transition from loading to authenticated", async () => {
    // Start with loading state
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    const { rerender } = renderHook(() => useProtectedRoute());

    expect(mockPush).not.toHaveBeenCalled();

    // Transition to authenticated
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "employee" as const,
      name: "Test",
      surname: "User",
      mobileNumber: "+33601020304",
    };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      accessToken: "test-token",
      login: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
    });

    rerender();

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
