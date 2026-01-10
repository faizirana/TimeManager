import { renderHook, waitFor } from "@testing-library/react";
import { useManagerStats } from "@/lib/hooks/useManagerStats";
import { getTeamStats } from "@/lib/services/teams/teamService";

jest.mock("@/lib/services/teams/teamService");

const mockGetTeamStats = getTeamStats as jest.MockedFunction<typeof getTeamStats>;

describe("useManagerStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and transform manager stats successfully", async () => {
    const mockResponse = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: { id: 4, name: "Sarah", surname: "Manager", email: "sarah@example.com" },
      },
      statistics: [
        {
          user: { id: 2, name: "John", surname: "Doe", email: "john@example.com" },
          totalHours: 40,
          totalDays: 5,
          averageHoursPerDay: 8,
        },
        {
          user: { id: 3, name: "Jane", surname: "Smith", email: "jane@example.com" },
          totalHours: 35,
          totalDays: 5,
          averageHoursPerDay: 7,
        },
      ],
      aggregated: {
        totalMembers: 2,
        totalHours: 75,
        averageDaysWorked: 5,
        averageHoursPerDay: 7.5,
      },
      period: { start: "2025-12-10", end: "2026-01-09" },
    };

    mockGetTeamStats.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useManagerStats(4, 1, "2025-12-10", "2026-01-09"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.teamMembers).toHaveLength(2);
    expect(result.current.data?.teamMembers[0]).toEqual({
      name: "John Doe",
      hours: 40,
      punctualityRate: 85,
    });
    expect(result.current.data?.totalTeamHours).toBe(75);
    expect(result.current.data?.averageTeamHours).toBe(7.5);
    expect(result.current.data?.presenceCalendar).toHaveLength(28);
    expect(result.current.error).toBe(null);
  });

  it("should not fetch if teamId is undefined", async () => {
    const { result } = renderHook(() => useManagerStats(4, undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetTeamStats).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should handle API errors", async () => {
    const errorResponse = {
      response: { data: { message: "Team not found" } },
    };
    mockGetTeamStats.mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() => useManagerStats(4, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("Team not found");
  });

  it("should generate presence calendar with correct data", async () => {
    const mockResponse = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: { id: 4, name: "Sarah", surname: "Manager", email: "sarah@example.com" },
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
      period: { start: null, end: null },
    };

    mockGetTeamStats.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useManagerStats(4, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.presenceCalendar).toHaveLength(28);

    const firstDay = result.current.data?.presenceCalendar[0];
    expect(firstDay).toHaveProperty("date");
    expect(firstDay).toHaveProperty("present");
    expect(firstDay).toHaveProperty("total");
    expect(firstDay?.total).toBe(1);
  });

  it("should refetch data when refetch is called", async () => {
    const mockResponse = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: { id: 4, name: "Sarah", surname: "Manager", email: "sarah@example.com" },
      },
      statistics: [],
      aggregated: {
        totalMembers: 0,
        totalHours: 0,
        averageDaysWorked: 0,
        averageHoursPerDay: 0,
      },
      period: { start: null, end: null },
    };

    mockGetTeamStats.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useManagerStats(4, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetTeamStats).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(mockGetTeamStats).toHaveBeenCalledTimes(2);
    });
  });

  it("should call API with correct parameters", async () => {
    const mockResponse = {
      team: {
        id: 2,
        name: "Team Beta",
        manager: { id: 4, name: "Sarah", surname: "Manager", email: "sarah@example.com" },
      },
      statistics: [],
      aggregated: {
        totalMembers: 0,
        totalHours: 0,
        averageDaysWorked: 0,
        averageHoursPerDay: 0,
      },
      period: { start: null, end: null },
    };

    mockGetTeamStats.mockResolvedValueOnce(mockResponse);

    renderHook(() => useManagerStats(4, 2, "2026-01-01", "2026-01-31"));

    await waitFor(() => {
      expect(mockGetTeamStats).toHaveBeenCalledWith(2, {
        start_date: "2026-01-01",
        end_date: "2026-01-31",
      });
    });
  });
});
