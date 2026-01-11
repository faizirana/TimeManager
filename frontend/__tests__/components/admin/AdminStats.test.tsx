/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { AdminStats } from "@/components/admin/AdminStats";

// Mock hooks
jest.mock("@/lib/hooks/useAdminStats", () => ({
  useAdminStats: jest.fn(),
}));

import { useAdminStats } from "@/lib/hooks/useAdminStats";

const mockUseAdminStats = useAdminStats as jest.MockedFunction<typeof useAdminStats>;

describe("AdminStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display loading state", () => {
    mockUseAdminStats.mockReturnValue({
      totalUsers: 0,
      totalTeams: 0,
      totalTimetables: 0,
      roles: { managers: 0, employees: 0, admins: 0 },
      todayRecordings: 0,
      currentlyPresent: 0,
      teamsWithoutTimetable: 0,
      avgTeamSize: "0",
      activeManagers: 0,
      inactiveManagers: 0,
      loading: true,
      error: null,
    });

    render(<AdminStats />);

    const loadingElements = screen.getAllByText("...");
    expect(loadingElements.length).toBeGreaterThanOrEqual(3);
  });

  it("should display all stats when loaded", () => {
    mockUseAdminStats.mockReturnValue({
      totalUsers: 20,
      totalTeams: 5,
      totalTimetables: 3,
      roles: { managers: 4, employees: 15, admins: 1 },
      todayRecordings: 25,
      currentlyPresent: 12,
      teamsWithoutTimetable: 1,
      avgTeamSize: "4.2",
      activeManagers: 3,
      inactiveManagers: 1,
      loading: false,
      error: null,
    });

    render(<AdminStats />);

    // Basic counts - using more specific queries
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument(); // totalUsers
    expect(screen.getByText("Équipes")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // totalTeams
    expect(screen.getByText("Horaires")).toBeInTheDocument();

    // Roles
    expect(screen.getByText("Managers")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // managers
    expect(screen.getByText("Employés")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // employees
    expect(screen.getByText("Admins")).toBeInTheDocument();

    // Activity
    expect(screen.getByText("Enregistrements aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Employés présents")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // Team health
    expect(screen.getByText("Taille moyenne")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("should display zero stats", () => {
    mockUseAdminStats.mockReturnValue({
      totalUsers: 0,
      totalTeams: 0,
      totalTimetables: 0,
      roles: { managers: 0, employees: 0, admins: 0 },
      todayRecordings: 0,
      currentlyPresent: 0,
      teamsWithoutTimetable: 0,
      avgTeamSize: "0",
      activeManagers: 0,
      inactiveManagers: 0,
      loading: false,
      error: null,
    });

    render(<AdminStats />);

    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThanOrEqual(3);
  });
});
