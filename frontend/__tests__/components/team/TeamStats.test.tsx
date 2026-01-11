/**
 * @fileoverview Tests for TeamStats Component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import TeamStats from "@/components/team/TeamStats";
import { useTeamStats } from "@/lib/hooks/useTeamStats";

// Mock the hook
jest.mock("@/lib/hooks/useTeamStats");

const mockUseTeamStats = useTeamStats as jest.MockedFunction<typeof useTeamStats>;

describe("TeamStats Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display loading skeleton when loading", () => {
    mockUseTeamStats.mockReturnValue({
      teamStats: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    // Should show skeleton
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should display error message when error occurs", () => {
    mockUseTeamStats.mockReturnValue({
      teamStats: null,
      loading: false,
      error: "Impossible de charger les statistiques de l'équipe",
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    expect(
      screen.getByText("Impossible de charger les statistiques de l'équipe"),
    ).toBeInTheDocument();
  });

  it("should display no data message when teamStats is null", () => {
    mockUseTeamStats.mockReturnValue({
      teamStats: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    expect(screen.getByText("Aucune donnée disponible")).toBeInTheDocument();
  });

  it("should display team statistics when data is loaded", () => {
    const mockTeamStats = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: {
          id: 5,
          name: "Jane",
          surname: "Smith",
          email: "jane.smith@example.com",
        },
      },
      statistics: [
        {
          user: {
            id: 2,
            name: "John",
            surname: "Doe",
            email: "john.doe@example.com",
          },
          totalHours: 40,
          totalDays: 5,
          averageHoursPerDay: 8,
        },
      ],
      aggregated: {
        totalMembers: 3,
        totalHours: 120,
        averageDaysWorked: 5,
        averageHoursPerDay: 8,
      },
      period: {
        start: null,
        end: null,
      },
    };

    mockUseTeamStats.mockReturnValue({
      teamStats: mockTeamStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    // Check team header
    expect(screen.getByText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByText(/Manager: Jane Smith/)).toBeInTheDocument();

    // Check aggregated stats
    expect(screen.getByText("3")).toBeInTheDocument(); // totalMembers
    expect(screen.getByText("120.0h")).toBeInTheDocument(); // totalHours

    // Check individual member stats table
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("40.0h")).toBeInTheDocument();
  });

  it("should display no members message when statistics array is empty", () => {
    const mockTeamStats = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: {
          id: 5,
          name: "Jane",
          surname: "Smith",
          email: "jane.smith@example.com",
        },
      },
      statistics: [],
      aggregated: {
        totalMembers: 0,
        totalHours: 0,
        averageDaysWorked: 0,
        averageHoursPerDay: 0,
      },
      period: {
        start: null,
        end: null,
      },
    };

    mockUseTeamStats.mockReturnValue({
      teamStats: mockTeamStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    expect(
      screen.getByText("Aucun membre dans cette équipe ou aucune donnée disponible"),
    ).toBeInTheDocument();
  });

  it("should pass correct params to hook", () => {
    mockUseTeamStats.mockReturnValue({
      teamStats: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const teamId = 5;
    const startDate = "2026-01-01";
    const endDate = "2026-01-31";

    render(<TeamStats teamId={teamId} startDate={startDate} endDate={endDate} />);

    expect(mockUseTeamStats).toHaveBeenCalledWith({
      teamId,
      startDate,
      endDate,
    });
  });

  it("should handle zero values in aggregated stats", () => {
    const mockTeamStats = {
      team: {
        id: 1,
        name: "Team Alpha",
        manager: {
          id: 5,
          name: "Jane",
          surname: "Smith",
          email: "jane.smith@example.com",
        },
      },
      statistics: [],
      aggregated: {
        totalMembers: 1,
        totalHours: 10,
        averageDaysWorked: 0,
        averageHoursPerDay: 0,
      },
      period: {
        start: null,
        end: null,
      },
    };

    mockUseTeamStats.mockReturnValue({
      teamStats: mockTeamStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TeamStats teamId={1} />);

    // Should display 0.0 for zero values
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});
