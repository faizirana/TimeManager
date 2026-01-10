/**
 * @fileoverview Tests for useTimeRecordingStats Hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useTimeRecordingStats } from "@/lib/hooks/useTimeRecordingStats";
import { getTimeRecordingStats } from "@/lib/services/timeRecording/timeRecordingService";

// Mock the service
jest.mock("@/lib/services/timeRecording/timeRecordingService");

const mockGetTimeRecordingStats = getTimeRecordingStats as jest.MockedFunction<
  typeof getTimeRecordingStats
>;

describe("useTimeRecordingStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch statistics successfully", async () => {
    const mockStats = {
      statistics: [
        {
          user: { id: 1, name: "John", surname: "Doe", email: "john@example.com" },
          totalHours: 40,
          totalDays: 5,
          averageHoursPerDay: 8,
          workSessions: [],
        },
      ],
    };

    mockGetTimeRecordingStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useTimeRecordingStats({ userId: 1 }));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats.statistics);
    expect(result.current.error).toBe(null);
    expect(mockGetTimeRecordingStats).toHaveBeenCalledWith({
      id_user: 1,
      start_date: undefined,
      end_date: undefined,
    });
  });

  it("should handle errors correctly", async () => {
    mockGetTimeRecordingStats.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTimeRecordingStats({ userId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual([]);
    expect(result.current.error).toBe("Impossible de charger les statistiques");
  });

  it("should pass filters correctly", async () => {
    const mockStats = { statistics: [] };
    mockGetTimeRecordingStats.mockResolvedValue(mockStats);

    const startDate = "2026-01-01";
    const endDate = "2026-01-31";

    renderHook(() =>
      useTimeRecordingStats({
        userId: 2,
        startDate,
        endDate,
      }),
    );

    await waitFor(() => {
      expect(mockGetTimeRecordingStats).toHaveBeenCalledWith({
        id_user: 2,
        start_date: startDate,
        end_date: endDate,
      });
    });
  });

  it("should refetch data when called", async () => {
    const mockStats = { statistics: [] };
    mockGetTimeRecordingStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useTimeRecordingStats({ userId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    mockGetTimeRecordingStats.mockClear();

    // Call refetch
    await result.current.refetch();

    expect(mockGetTimeRecordingStats).toHaveBeenCalledTimes(1);
  });

  it("should handle empty user ID", async () => {
    const mockStats = { statistics: [] };
    mockGetTimeRecordingStats.mockResolvedValue(mockStats);

    renderHook(() => useTimeRecordingStats({}));

    await waitFor(() => {
      expect(mockGetTimeRecordingStats).toHaveBeenCalledWith({
        id_user: undefined,
        start_date: undefined,
        end_date: undefined,
      });
    });
  });
});
