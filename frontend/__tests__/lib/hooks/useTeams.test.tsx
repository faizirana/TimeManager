/**
 * @fileoverview Tests for useTeams hook
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useTeams } from "@/lib/hooks/useTeams";
import {
  getTeams,
  createTeam,
  updateTeam,
  addTeamMember,
  getTeamById,
} from "@/lib/services/teams/teamService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";

// Mock services
jest.mock("@/lib/services/teams/teamService");
jest.mock("@/lib/services/timetable/timetableService");

const mockGetTeams = getTeams as jest.MockedFunction<typeof getTeams>;
const mockCreateTeam = createTeam as jest.MockedFunction<typeof createTeam>;
const mockUpdateTeam = updateTeam as jest.MockedFunction<typeof updateTeam>;
const mockAddTeamMember = addTeamMember as jest.MockedFunction<typeof addTeamMember>;
const mockGetTimetableById = getTimetableById as jest.MockedFunction<typeof getTimetableById>;

describe("useTeams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch teams successfully", async () => {
    const mockTeams = [
      {
        id: 1,
        name: "Team A",
        id_timetable: 1,
        id_manager: 1,
        manager: { id: 1, name: "John", surname: "Doe", email: "john@test.com", role: "manager" },
        members: [
          { id: 1, name: "John", surname: "Doe", email: "john@test.com", role: "manager" },
          { id: 2, name: "Jane", surname: "Smith", email: "jane@test.com", role: "employee" },
        ],
      },
      {
        id: 2,
        name: "Team B",
        id_timetable: 2,
        id_manager: 3,
        manager: { id: 3, name: "Bob", surname: "Manager", email: "bob@test.com", role: "manager" },
        members: [
          { id: 3, name: "Bob", surname: "Manager", email: "bob@test.com", role: "manager" },
        ],
      },
    ];

    const mockTimetable1 = { id: 1, Shift_start: "09:00", Shift_end: "17:00" };
    const mockTimetable2 = { id: 2, Shift_start: "14:00", Shift_end: "22:00" };

    mockGetTeams.mockResolvedValue(mockTeams);
    mockGetTimetableById
      .mockResolvedValueOnce(mockTimetable1)
      .mockResolvedValueOnce(mockTimetable2);

    const { result } = renderHook(() => useTeams(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toHaveLength(2);
    expect(result.current.teams[0]).toEqual({
      id: 1,
      name: "Team A",
      shift: "09:00 - 17:00",
      members: 2,
    });
    expect(result.current.teams[1]).toEqual({
      id: 2,
      name: "Team B",
      shift: "14:00 - 22:00",
      members: 1,
    });
  });

  it("should fetch teams for specific user", async () => {
    const mockTeams = [
      {
        id: 1,
        name: "Team A",
        id_timetable: 1,
        id_manager: 5,
        manager: {
          id: 5,
          name: "Alice",
          surname: "Manager",
          email: "alice@test.com",
          role: "manager",
        },
        members: [
          { id: 5, name: "Alice", surname: "Manager", email: "alice@test.com", role: "manager" },
        ],
      },
    ];

    mockGetTeams.mockResolvedValue(mockTeams);
    mockGetTimetableById.mockResolvedValue({ id: 1, Shift_start: "09:00", Shift_end: "17:00" });

    const { result } = renderHook(() => useTeams(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetTeams).toHaveBeenCalledWith({ id_user: 5 });
  });

  it("should handle teams without timetable", async () => {
    const mockTeams = [
      {
        id: 1,
        name: "Team A",
        id_timetable: null,
        id_manager: 1,
        manager: { id: 1, name: "John", surname: "Doe", email: "john@test.com", role: "manager" },
        members: [],
      },
    ];

    mockGetTeams.mockResolvedValue(mockTeams);

    const { result } = renderHook(() => useTeams(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams[0].shift).toBe("No shift assigned");
  });

  it("should create new team successfully", async () => {
    const teamData = {
      name: "New Team",
      id_manager: 1,
      id_timetable: 1,
      memberIds: [2, 3],
    };

    const mockNewTeam = {
      id: 10,
      name: "New Team",
      id_timetable: 1,
      id_manager: 1,
      manager: {
        id: 1,
        name: "Manager",
        surname: "User",
        email: "manager@test.com",
        role: "manager",
      },
      members: [],
    };

    mockCreateTeam.mockResolvedValue(mockNewTeam);
    mockAddTeamMember.mockResolvedValue({ message: "Member added successfully" });
    mockGetTeams.mockResolvedValue([]);

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createNewTeam(teamData);
    });

    expect(mockCreateTeam).toHaveBeenCalledWith({
      name: "New Team",
      id_manager: 1,
      id_timetable: 1,
    });
    expect(mockAddTeamMember).toHaveBeenCalledWith(10, 1); // Manager
    expect(mockAddTeamMember).toHaveBeenCalledWith(10, 2); // Member 1
    expect(mockAddTeamMember).toHaveBeenCalledWith(10, 3); // Member 2
  });

  it("should create team without additional members", async () => {
    const teamData = {
      name: "Solo Team",
      id_manager: 1,
      id_timetable: 1,
      memberIds: [],
    };

    const mockNewTeam = {
      id: 11,
      name: "Solo Team",
      id_timetable: 1,
      id_manager: 1,
      manager: { id: 1, name: "Solo", surname: "Manager", email: "solo@test.com", role: "manager" },
      members: [],
    };

    mockCreateTeam.mockResolvedValue(mockNewTeam);
    mockAddTeamMember.mockResolvedValue({ message: "Member added successfully" });
    mockGetTeams.mockResolvedValue([]);

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createNewTeam(teamData);
    });

    expect(mockAddTeamMember).toHaveBeenCalledTimes(1); // Only manager
  });

  it("should update existing team successfully", async () => {
    const teamData = {
      name: "Updated Team",
      id_timetable: 2,
    };

    const mockUpdatedTeam = {
      id: 1,
      name: "Updated Team",
      id_timetable: 2,
      id_manager: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@test.com", role: "manager" },
      members: [],
    };

    mockUpdateTeam.mockResolvedValue(mockUpdatedTeam);
    (getTeamById as jest.MockedFunction<typeof getTeamById>).mockResolvedValue(mockUpdatedTeam);
    mockGetTimetableById.mockResolvedValue({ id: 2, Shift_start: "10:00", Shift_end: "18:00" });
    mockGetTeams.mockResolvedValue([]);

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateExistingTeam(1, teamData);
    });

    expect(mockUpdateTeam).toHaveBeenCalledWith(1, teamData);
  });

  it("should handle error when fetching teams", async () => {
    mockGetTeams.mockRejectedValue(new Error("Failed to fetch teams"));

    const { result } = renderHook(() => useTeams(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch teams");
    expect(result.current.teams).toHaveLength(0);
  });

  it("should handle error when creating team", async () => {
    const teamData = {
      name: "New Team",
      id_manager: 1,
      id_timetable: 1,
      memberIds: [],
    };

    mockCreateTeam.mockRejectedValue(new Error("Failed to create"));

    const { result } = renderHook(() => useTeams(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.createNewTeam(teamData)).rejects.toThrow("Failed to create");
  });

  it("should refetch teams", async () => {
    mockGetTeams.mockResolvedValue([]);

    const { result } = renderHook(() => useTeams(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockGetTeams).toHaveBeenCalledTimes(2);
    });
  });
});
