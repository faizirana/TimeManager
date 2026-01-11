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
      users: 0,
      teams: 0,
      timetables: 0,
      loading: true,
      error: null,
    });

    render(<AdminStats />);

    const loadingElements = screen.getAllByText("...");
    expect(loadingElements.length).toBe(3);
  });

  it("should display stats when loaded", () => {
    mockUseAdminStats.mockReturnValue({
      users: 20,
      teams: 5,
      timetables: 3,
      loading: false,
      error: null,
    });

    render(<AdminStats />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Timetables")).toBeInTheDocument();
  });

  it("should display zero stats", () => {
    mockUseAdminStats.mockReturnValue({
      users: 0,
      teams: 0,
      timetables: 0,
      loading: false,
      error: null,
    });

    render(<AdminStats />);

    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThanOrEqual(3);
  });
});
