import { renderHook, waitFor } from "@testing-library/react";
import { useEmployeeStats } from "@/lib/hooks/useEmployeeStats";
import { getTimeRecordingStats } from "@/lib/services/timeRecording/timeRecordingService";

jest.mock("@/lib/services/timeRecording/timeRecordingService");

const mockGetTimeRecordingStats = getTimeRecordingStats as jest.MockedFunction<
  typeof getTimeRecordingStats
>;

describe("useEmployeeStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and transform employee stats successfully", async () => {
    const mockResponse = {
      statistics: [
        {
          user: { id: 1, name: "John", surname: "Doe", email: "john@example.com" },
          totalHours: 40,
          totalDays: 5,
          averageHoursPerDay: 8,
          workSessions: [
            { date: "2026-01-06", arrival: "09:00", departure: "17:00", hours: 8 },
            { date: "2026-01-07", arrival: "09:00", departure: "17:00", hours: 8 },
          ],
        },
      ],
      period: { start: "2025-12-10", end: "2026-01-09" },
    };

    mockGetTimeRecordingStats.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEmployeeStats(1, "2025-12-10", "2026-01-09"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      hoursTimeline: [
        { date: "2026-01-06", hours: 8 },
        { date: "2026-01-07", hours: 8 },
      ],
      punctualityRate: 85,
      totalHours: 40,
      averageHours: 8,
    });
    expect(result.current.error).toBe(null);
  });

  it("should handle empty statistics", async () => {
    const mockResponse = {
      statistics: [],
      period: { start: "2025-12-10", end: "2026-01-09" },
    };

    mockGetTimeRecordingStats.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEmployeeStats(1, "2025-12-10", "2026-01-09"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should handle API errors", async () => {
    const errorMessage = "Failed to fetch stats";
    mockGetTimeRecordingStats.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useEmployeeStats(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it("should refetch data when refetch is called", async () => {
    const mockResponse = {
      statistics: [
        {
          user: { id: 1, name: "John", surname: "Doe", email: "john@example.com" },
          totalHours: 40,
          totalDays: 5,
          averageHoursPerDay: 8,
          workSessions: [],
        },
      ],
      period: { start: null, end: null },
    };

    mockGetTimeRecordingStats.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEmployeeStats(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetTimeRecordingStats).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(mockGetTimeRecordingStats).toHaveBeenCalledTimes(2);
    });
  });

  it("should call API with correct parameters", async () => {
    const mockResponse = {
      statistics: [],
      period: { start: null, end: null },
    };

    mockGetTimeRecordingStats.mockResolvedValueOnce(mockResponse);

    renderHook(() => useEmployeeStats(5, "2026-01-01", "2026-01-31"));

    await waitFor(() => {
      expect(mockGetTimeRecordingStats).toHaveBeenCalledWith({
        id_user: 5,
        start_date: "2026-01-01",
        end_date: "2026-01-31",
      });
    });
  });
});
