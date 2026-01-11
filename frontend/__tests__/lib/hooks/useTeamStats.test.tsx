/**
 * @fileoverview Tests for useTeamStats Hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useTeamStats } from "@/lib/hooks/useTeamStats";
import { getTeamStats } from "@/lib/services/teams/teamService";

// Mock the service
jest.mock("@/lib/services/teams/teamService");

const mockGetTeamStats = getTeamStats as jest.MockedFunction<typeof getTeamStats>;

describe("useTeamStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTeamStats = {
    team: {
      id: 1,
      name: "Team Alpha",
      manager: { id: 5, name: "Jane", surname: "Smith", email: "jane@example.com" },
    },
    statistics: [
      {
        user: { id: 2, name: "John", surname: "Doe", email: "john@example.com" },
        totalHours: 40,
        totalDays: 5,
        averageHoursPerDay: 8,
      },
    ],
    aggregated: {
      totalMembers: 1,
      totalHours: 40,
      averageDaysWorked: 5,
      averageHoursPerDay: 8,
    },
    period: {
      start: null,
      end: null,
    },
  };

  it("should fetch team statistics successfully", async () => {
    mockGetTeamStats.mockResolvedValue(mockTeamStats);

    const { result } = renderHook(() => useTeamStats({ teamId: 1 }));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.teamStats).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamStats).toEqual(mockTeamStats);
    expect(result.current.error).toBe(null);
    expect(mockGetTeamStats).toHaveBeenCalledWith(1, {
      start_date: undefined,
      end_date: undefined,
    });
  });

  it("should handle errors correctly", async () => {
    mockGetTeamStats.mockRejectedValue(new Error("Team not found"));

    const { result } = renderHook(() => useTeamStats({ teamId: 999 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamStats).toBe(null);
    expect(result.current.error).toBe("Impossible de charger les statistiques de l'équipe");
  });

  it("should pass date filters correctly", async () => {
    mockGetTeamStats.mockResolvedValue(mockTeamStats);

    const startDate = "2026-01-01T00:00:00.000Z";
    const endDate = "2026-01-31T23:59:59.999Z";

    renderHook(() =>
      useTeamStats({
        teamId: 1,
        startDate,
        endDate,
      }),
    );

    await waitFor(() => {
      expect(mockGetTeamStats).toHaveBeenCalledWith(1, {
        start_date: startDate,
        end_date: endDate,
      });
    });
  });

  it("should refetch data when called", async () => {
    mockGetTeamStats.mockResolvedValue(mockTeamStats);

    const { result } = renderHook(() => useTeamStats({ teamId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    mockGetTeamStats.mockClear();

    // Call refetch
    await result.current.refetch();

    expect(mockGetTeamStats).toHaveBeenCalledTimes(1);
  });

  it("should refetch when teamId changes", async () => {
    mockGetTeamStats.mockResolvedValue(mockTeamStats);

    const { rerender } = renderHook(({ teamId }) => useTeamStats({ teamId }), {
      initialProps: { teamId: 1 },
    });

    await waitFor(() => {
      expect(mockGetTeamStats).toHaveBeenCalledWith(1, expect.any(Object));
    });

    mockGetTeamStats.mockClear();

    // Change teamId
    rerender({ teamId: 2 });

    await waitFor(() => {
      expect(mockGetTeamStats).toHaveBeenCalledWith(2, expect.any(Object));
    });
  });
});
