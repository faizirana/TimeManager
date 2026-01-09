/**
 * @fileoverview Tests for useDashboardTeams Hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardTeams } from "@/lib/hooks/useDashboardTeams";
import { getTeams } from "@/lib/services/teams/teamService";

// Mock the service
jest.mock("@/lib/services/teams/teamService");

const mockGetTeams = getTeams as jest.MockedFunction<typeof getTeams>;

describe("useDashboardTeams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserTeams = [
    {
      id: 1,
      name: "Team Alpha",
      id_manager: 5,
      manager: { id: 5, name: "Manager", surname: "One", email: "manager@example.com" },
      members: [],
    },
    {
      id: 2,
      name: "Team Beta",
      id_manager: 6,
      manager: { id: 6, name: "Manager", surname: "Two", email: "manager2@example.com" },
      members: [],
    },
  ];

  const mockManagedTeams = [
    {
      id: 1,
      name: "Team Alpha",
      id_manager: 5,
      manager: { id: 5, name: "Manager", surname: "One", email: "manager@example.com" },
      members: [],
    },
  ];

  it("should fetch user teams and managed teams for a manager", async () => {
    mockGetTeams
      .mockResolvedValueOnce(mockUserTeams) // First call for userTeams
      .mockResolvedValueOnce(mockManagedTeams); // Second call for managedTeams

    const { result } = renderHook(() => useDashboardTeams({ userId: 5, userRole: "manager" }));

    // Initially loading
    expect(result.current.loadingUserTeams).toBe(true);
    expect(result.current.loadingManagedTeams).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loadingUserTeams).toBe(false);
      expect(result.current.loadingManagedTeams).toBe(false);
    });

    expect(result.current.userTeams).toEqual(mockUserTeams);
    expect(result.current.managedTeams).toEqual(mockManagedTeams);
    expect(result.current.error).toBe(null);

    expect(mockGetTeams).toHaveBeenCalledTimes(2);
    expect(mockGetTeams).toHaveBeenNthCalledWith(1, { id_user: 5 });
    expect(mockGetTeams).toHaveBeenNthCalledWith(2, { id_manager: 5 });
  });

  it("should only fetch user teams for non-manager", async () => {
    mockGetTeams.mockResolvedValueOnce(mockUserTeams);

    const { result } = renderHook(() => useDashboardTeams({ userId: 3, userRole: "employee" }));

    await waitFor(() => {
      expect(result.current.loadingUserTeams).toBe(false);
    });

    expect(result.current.userTeams).toEqual(mockUserTeams);
    expect(result.current.managedTeams).toEqual([]);
    expect(mockGetTeams).toHaveBeenCalledTimes(1);
    expect(mockGetTeams).toHaveBeenCalledWith({ id_user: 3 });
  });

  it("should not fetch if userId is undefined", async () => {
    renderHook(() => useDashboardTeams({}));

    await waitFor(() => {
      expect(mockGetTeams).not.toHaveBeenCalled();
    });
  });

  it("should handle errors when fetching user teams", async () => {
    mockGetTeams.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDashboardTeams({ userId: 5 }));

    await waitFor(() => {
      expect(result.current.loadingUserTeams).toBe(false);
    });

    expect(result.current.userTeams).toEqual([]);
    expect(result.current.error).toBe("Impossible de charger vos équipes");
  });

  it("should handle errors when fetching managed teams", async () => {
    mockGetTeams
      .mockResolvedValueOnce(mockUserTeams)
      .mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDashboardTeams({ userId: 5, userRole: "manager" }));

    await waitFor(() => {
      expect(result.current.loadingManagedTeams).toBe(false);
    });

    expect(result.current.userTeams).toEqual(mockUserTeams);
    expect(result.current.managedTeams).toEqual([]);
    expect(result.current.error).toBe("Impossible de charger les équipes gérées");
  });

  it("should refetch all teams when refetch is called", async () => {
    mockGetTeams.mockResolvedValueOnce(mockUserTeams).mockResolvedValueOnce(mockManagedTeams);

    const { result } = renderHook(() => useDashboardTeams({ userId: 5, userRole: "manager" }));

    await waitFor(() => {
      expect(result.current.loadingUserTeams).toBe(false);
      expect(result.current.loadingManagedTeams).toBe(false);
    });

    mockGetTeams.mockClear();
    mockGetTeams.mockResolvedValueOnce(mockUserTeams).mockResolvedValueOnce(mockManagedTeams);

    // Call refetch
    await result.current.refetch();

    expect(mockGetTeams).toHaveBeenCalledTimes(2);
  });

  it("should refetch when userId changes", async () => {
    mockGetTeams.mockResolvedValue(mockUserTeams);

    const { rerender } = renderHook(({ userId }) => useDashboardTeams({ userId }), {
      initialProps: { userId: 5 },
    });

    await waitFor(() => {
      expect(mockGetTeams).toHaveBeenCalledWith({ id_user: 5 });
    });

    mockGetTeams.mockClear();

    // Change userId
    rerender({ userId: 6 });

    await waitFor(() => {
      expect(mockGetTeams).toHaveBeenCalledWith({ id_user: 6 });
    });
  });
});
