import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManagerStats from "@/components/statistics/ManagerStats";
import { useManagerStats } from "@/lib/hooks/useManagerStats";
import { getTeams } from "@/lib/services/teams/teamService";

jest.mock("@/lib/hooks/useManagerStats");
jest.mock("@/lib/services/teams/teamService");

const mockUseManagerStats = useManagerStats as jest.MockedFunction<typeof useManagerStats>;
const mockGetTeams = getTeams as jest.MockedFunction<typeof getTeams>;

describe("ManagerStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state", () => {
    mockGetTeams.mockResolvedValue([]);
    mockUseManagerStats.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    const skeletons = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render error state", async () => {
    mockGetTeams.mockResolvedValue([
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
    ]);
    mockUseManagerStats.mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to fetch team stats",
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch team stats/i)).toBeInTheDocument();
    });
  });

  it("should render empty state when no data", async () => {
    mockGetTeams.mockResolvedValue([
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
    ]);
    mockUseManagerStats.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune donnée d'équipe disponible/i)).toBeInTheDocument();
    });
  });

  it("should render manager stats with data", async () => {
    mockGetTeams.mockResolvedValue([
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
    ]);
    mockUseManagerStats.mockReturnValue({
      data: {
        teamMembers: [
          { name: "John Doe", hours: 40, punctualityRate: 90 },
          { name: "Jane Smith", hours: 35, punctualityRate: 85 },
        ],
        presenceCalendar: [{ date: "2026-01-06", present: 2, total: 2 }],
        averageTeamHours: 7.5,
        totalTeamHours: 75,
        teamPunctualityRate: 87.5,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(screen.getByText("Statistiques d'Équipe")).toBeInTheDocument();
      expect(screen.getByText("75.0h")).toBeInTheDocument();
      expect(screen.getByText("7.5h")).toBeInTheDocument();
      expect(screen.getByText("88%")).toBeInTheDocument(); // 87.5 rounded
    });
  });

  it("should initialize with first team", async () => {
    const teams = [
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
      { id: 2, name: "Team Beta", id_manager: 4, id_timetable: null },
    ];

    mockGetTeams.mockResolvedValue(teams);
    mockUseManagerStats.mockReturnValue({
      data: {
        teamMembers: [],
        presenceCalendar: [],
        averageTeamHours: 0,
        totalTeamHours: 0,
        teamPunctualityRate: 0,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(mockUseManagerStats).toHaveBeenCalledWith(
        4,
        1, // First team ID
        expect.any(String),
        expect.any(String),
      );
    });
  });

  it("should render team selector when multiple teams", async () => {
    const teams = [
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
      { id: 2, name: "Team Beta", id_manager: 4, id_timetable: null },
    ];

    mockGetTeams.mockResolvedValue(teams);
    mockUseManagerStats.mockReturnValue({
      data: {
        teamMembers: [],
        presenceCalendar: [],
        averageTeamHours: 0,
        totalTeamHours: 0,
        teamPunctualityRate: 0,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Team Alpha")).toBeInTheDocument();
      expect(screen.getByText("Team Beta")).toBeInTheDocument();
    });
  });

  it("should change selected team", async () => {
    const user = userEvent.setup();
    const teams = [
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
      { id: 2, name: "Team Beta", id_manager: 4, id_timetable: null },
    ];

    mockGetTeams.mockResolvedValue(teams);
    mockUseManagerStats.mockReturnValue({
      data: {
        teamMembers: [],
        presenceCalendar: [],
        averageTeamHours: 0,
        totalTeamHours: 0,
        teamPunctualityRate: 0,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "2");

    await waitFor(() => {
      expect(mockUseManagerStats).toHaveBeenCalledWith(
        4,
        2, // Second team ID
        expect.any(String),
        expect.any(String),
      );
    });
  });

  it("should render empty charts when no member data", async () => {
    mockGetTeams.mockResolvedValue([
      { id: 1, name: "Team Alpha", id_manager: 4, id_timetable: null },
    ]);
    mockUseManagerStats.mockReturnValue({
      data: {
        teamMembers: [],
        presenceCalendar: [],
        averageTeamHours: 0,
        totalTeamHours: 0,
        teamPunctualityRate: 0,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ManagerStats userId={4} />);

    await waitFor(() => {
      const emptyMessages = screen.getAllByText("Aucune donnée disponible");
      expect(emptyMessages.length).toBeGreaterThan(0);
    });
  });
});
