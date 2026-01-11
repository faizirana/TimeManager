import { render, screen } from "@testing-library/react";
import EmployeeStats from "@/components/statistics/EmployeeStats";
import { useEmployeeStats } from "@/lib/hooks/useEmployeeStats";

jest.mock("@/lib/hooks/useEmployeeStats");

const mockUseEmployeeStats = useEmployeeStats as jest.MockedFunction<typeof useEmployeeStats>;

describe("EmployeeStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={1} userName="John Doe" />);

    const skeletons = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render error state", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to fetch stats",
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={1} userName="John Doe" />);

    expect(screen.getByText(/Erreur/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch stats/i)).toBeInTheDocument();
  });

  it("should render empty state when no data", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={1} userName="John Doe" />);

    expect(screen.getByText(/Aucune donnée disponible/i)).toBeInTheDocument();
  });

  it("should render employee stats with data", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: {
        hoursTimeline: [
          { date: "2026-01-06", hours: 8 },
          { date: "2026-01-07", hours: 8 },
        ],
        punctualityRate: 92,
        totalHours: 40.5,
        averageHours: 8.1,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={1} userName="John Doe" />);

    expect(screen.getByText("Mes Statistiques")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("40.5h")).toBeInTheDocument();
    expect(screen.getByText("8.1h")).toBeInTheDocument();
    // Two elements with 92%: one in summary header, one in gauge
    const percentages = screen.getAllByText("92%");
    expect(percentages).toHaveLength(2);
  });

  it("should render with empty hours timeline", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: {
        hoursTimeline: [],
        punctualityRate: 85,
        totalHours: 0,
        averageHours: 0,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={1} userName="John Doe" />);

    expect(screen.getByText("Mes Statistiques")).toBeInTheDocument();
    expect(screen.getByText("Aucune donnée disponible")).toBeInTheDocument();
  });

  it("should call hook with correct date parameters", () => {
    mockUseEmployeeStats.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<EmployeeStats userId={5} userName="Test User" />);

    expect(mockUseEmployeeStats).toHaveBeenCalledWith(
      5,
      expect.any(String), // startDate (30 days ago)
      expect.any(String), // endDate (today)
    );

    const calls = mockUseEmployeeStats.mock.calls[0];
    expect(calls[0]).toBe(5); // userId
    expect(calls[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
    expect(calls[2]).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
  });
});
