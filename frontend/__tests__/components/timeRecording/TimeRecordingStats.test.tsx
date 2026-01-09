/**
 * @fileoverview Tests for TimeRecordingStats Component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import TimeRecordingStats from "@/components/timeRecording/TimeRecordingStats";
import { useTimeRecordingStats } from "@/lib/hooks/useTimeRecordingStats";

// Mock the hook
jest.mock("@/lib/hooks/useTimeRecordingStats");

const mockUseTimeRecordingStats = useTimeRecordingStats as jest.MockedFunction<
  typeof useTimeRecordingStats
>;

describe("TimeRecordingStats Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display loading skeleton when loading", () => {
    mockUseTimeRecordingStats.mockReturnValue({
      stats: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<TimeRecordingStats />);

    // Should show skeleton (check for animation class)
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should display error message when error occurs", () => {
    mockUseTimeRecordingStats.mockReturnValue({
      stats: [],
      loading: false,
      error: "Impossible de charger les statistiques",
      refetch: jest.fn(),
    });

    render(<TimeRecordingStats />);

    expect(screen.getByText("Impossible de charger les statistiques")).toBeInTheDocument();
  });

  it("should display no data message when stats are empty", () => {
    mockUseTimeRecordingStats.mockReturnValue({
      stats: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TimeRecordingStats />);

    expect(screen.getByText("Aucune donnée disponible pour cette période")).toBeInTheDocument();
  });

  it("should display statistics when data is loaded", () => {
    const mockStats = [
      {
        user: {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "john.doe@example.com",
        },
        totalHours: 42.5,
        totalDays: 5,
        averageHoursPerDay: 8.5,
        workSessions: [
          {
            date: "2026-01-02",
            arrival: "2026-01-02T09:00:00.000Z",
            departure: "2026-01-02T17:30:00.000Z",
            hours: 8.5,
          },
        ],
      },
    ];

    mockUseTimeRecordingStats.mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TimeRecordingStats userId={1} />);

    // Check user info
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();

    // Check stats cards
    expect(screen.getByText("42.5h")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    // 8.5h appears multiple times (in card and table), so use getAllByText
    const hoursElements = screen.getAllByText(/8\.5h?/);
    expect(hoursElements.length).toBeGreaterThan(0);

    // Check work sessions table
    expect(screen.getByText("Sessions de travail")).toBeInTheDocument();
  });

  it("should pass correct params to hook", () => {
    mockUseTimeRecordingStats.mockReturnValue({
      stats: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const userId = 5;
    const startDate = "2026-01-01";
    const endDate = "2026-01-31";

    render(<TimeRecordingStats userId={userId} startDate={startDate} endDate={endDate} />);

    expect(mockUseTimeRecordingStats).toHaveBeenCalledWith({
      userId,
      startDate,
      endDate,
    });
  });
});
