/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useTeams } from "@/lib/hooks/useTeams";
import * as teamsService from "@/lib/services/teams/teamsService";
import * as timetableService from "@/lib/services/timetable/timetableService";

jest.mock("@/lib/services/teams/teamsService");
jest.mock("@/lib/services/timetable/timetableService");

describe("useTeams", () => {
  const mockTimetable = {
    id: 1,
    Shift_start: "09:00",
    Shift_end: "17:00",
  };

  const mockTeams = [
    {
      id: 1,
      name: "Team Alpha",
      id_timetable: 1,
      id_manager: 10,
      manager: { id: 10, name: "John", surname: "Doe" },
      members: [
        { id: 10, name: "John", surname: "Doe" },
        { id: 11, name: "Jane", surname: "Smith" },
      ],
    },
    {
      id: 2,
      name: "Team Beta",
      id_timetable: 1,
      id_manager: 12,
      manager: { id: 12, name: "Bob", surname: "Johnson" },
      members: [{ id: 12, name: "Bob", surname: "Johnson" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (timetableService.getTimetableById as jest.Mock).mockResolvedValue(mockTimetable);
  });

  describe("Initial State", () => {
    it("should initialize with empty teams, loading true, and no error", () => {
      (teamsService.getTeams as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTeams());

      expect(result.current.teams).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Fetching Teams", () => {
    it("should fetch and transform teams successfully on mount", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.teams).toEqual([
        {
          id: 1,
          name: "Team Alpha",
          shift: "09:00 - 17:00",
          members: 2,
          managerName: "John Doe",
        },
        {
          id: 2,
          name: "Team Beta",
          shift: "09:00 - 17:00",
          members: 1,
          managerName: "Bob Johnson",
        },
      ]);
      expect(result.current.error).toBeNull();
      expect(teamsService.getTeams).toHaveBeenCalledWith({ id_user: undefined });
    });

    it("should fetch teams for a specific user when userId is provided", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue([mockTeams[0]]);

      const { result } = renderHook(() => useTeams(10));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(teamsService.getTeams).toHaveBeenCalledWith({ id_user: 10 });
      expect(result.current.teams).toHaveLength(1);
    });

    it("should handle fetch error", async () => {
      const errorMessage = "Failed to fetch teams";
      (teamsService.getTeams as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.teams).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it("should refetch teams when refetch is called", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(teamsService.getTeams).toHaveBeenCalledTimes(1);

      // Call refetch
      await result.current.refetch();

      expect(teamsService.getTeams).toHaveBeenCalledTimes(2);
    });
  });

  describe("Creating Teams with Members", () => {
    it("should create a new team and add manager as member", async () => {
      const newTeam = { id: 3, name: "Team Gamma", id_timetable: 1, id_manager: 15 };
      (teamsService.createTeam as jest.Mock).mockResolvedValue(newTeam);
      (teamsService.addTeamMember as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeams as jest.Mock).mockResolvedValue([...mockTeams, newTeam]);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createNewTeam({
        name: "Team Gamma",
        id_manager: 15,
        id_timetable: 1,
        memberIds: [],
      });

      // Should create team
      expect(teamsService.createTeam).toHaveBeenCalledWith({
        name: "Team Gamma",
        id_manager: 15,
        id_timetable: 1,
      });

      // Should add manager as member
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(3, 15);

      // Should refetch teams
      expect(teamsService.getTeams).toHaveBeenCalledTimes(2);
    });

    it("should create a team with additional members", async () => {
      const newTeam = { id: 3, name: "Team Gamma", id_timetable: 1, id_manager: 15 };
      (teamsService.createTeam as jest.Mock).mockResolvedValue(newTeam);
      (teamsService.addTeamMember as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeams as jest.Mock).mockResolvedValue([...mockTeams, newTeam]);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createNewTeam({
        name: "Team Gamma",
        id_manager: 15,
        id_timetable: 1,
        memberIds: [16, 17, 18],
      });

      // Should add manager
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(3, 15);

      // Should add all members
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(3, 16);
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(3, 17);
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(3, 18);

      // Should be called 4 times total (manager + 3 members)
      expect(teamsService.addTeamMember).toHaveBeenCalledTimes(4);
    });

    it("should handle error when creating team fails", async () => {
      const errorMessage = "Failed to create team";
      (teamsService.createTeam as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.createNewTeam({
          name: "Team Gamma",
          id_manager: 15,
          id_timetable: 1,
          memberIds: [],
        }),
      ).rejects.toThrow(errorMessage);

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });

  describe("Updating Teams with Member Management", () => {
    it("should update team without modifying members when memberIds not provided", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(mockTeams[0]);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateExistingTeam(1, {
        name: "Team Alpha Updated",
        id_timetable: 1,
      });

      // Should update team
      expect(teamsService.updateTeam).toHaveBeenCalledWith(1, {
        name: "Team Alpha Updated",
        id_timetable: 1,
      });

      // Should NOT call member management methods
      expect(teamsService.addTeamMember).not.toHaveBeenCalled();
      expect(teamsService.removeTeamMember).not.toHaveBeenCalled();
    });

    it("should add new members when updating team", async () => {
      const currentTeam = {
        ...mockTeams[0],
        members: [
          { id: 10, name: "John", surname: "Doe" },
          { id: 11, name: "Jane", surname: "Smith" },
        ],
      };

      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(currentTeam);
      (teamsService.addTeamMember as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Add new members (12, 13) to existing (10, 11)
      await result.current.updateExistingTeam(1, {
        name: "Team Alpha",
        id_timetable: 1,
        memberIds: [10, 11, 12, 13],
      });

      // Should add new members
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 12);
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 13);
      expect(teamsService.addTeamMember).toHaveBeenCalledTimes(2);

      // Should not remove any members
      expect(teamsService.removeTeamMember).not.toHaveBeenCalled();
    });

    it("should remove members when updating team", async () => {
      const currentTeam = {
        ...mockTeams[0],
        members: [
          { id: 10, name: "John", surname: "Doe" },
          { id: 11, name: "Jane", surname: "Smith" },
          { id: 12, name: "Bob", surname: "Johnson" },
        ],
      };

      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(currentTeam);
      (teamsService.removeTeamMember as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Keep only member 10, remove 11 and 12
      await result.current.updateExistingTeam(1, {
        name: "Team Alpha",
        id_timetable: 1,
        memberIds: [10],
      });

      // Should remove members
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 11);
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 12);
      expect(teamsService.removeTeamMember).toHaveBeenCalledTimes(2);

      // Should not add any members
      expect(teamsService.addTeamMember).not.toHaveBeenCalled();
    });

    it("should add and remove members simultaneously", async () => {
      const currentTeam = {
        ...mockTeams[0],
        members: [
          { id: 10, name: "John", surname: "Doe" },
          { id: 11, name: "Jane", surname: "Smith" },
        ],
      };

      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(currentTeam);
      (teamsService.addTeamMember as jest.Mock).mockResolvedValue(undefined);
      (teamsService.removeTeamMember as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Replace members: remove 11, keep 10, add 12
      await result.current.updateExistingTeam(1, {
        name: "Team Alpha",
        id_timetable: 1,
        memberIds: [10, 12],
      });

      // Should add new member
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 12);
      expect(teamsService.addTeamMember).toHaveBeenCalledTimes(1);

      // Should remove old member
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 11);
      expect(teamsService.removeTeamMember).toHaveBeenCalledTimes(1);
    });

    it("should replace all members", async () => {
      const currentTeam = {
        ...mockTeams[0],
        members: [
          { id: 10, name: "John", surname: "Doe" },
          { id: 11, name: "Jane", surname: "Smith" },
        ],
      };

      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(currentTeam);
      (teamsService.addTeamMember as jest.Mock).mockResolvedValue(undefined);
      (teamsService.removeTeamMember as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Replace all members with new ones
      await result.current.updateExistingTeam(1, {
        name: "Team Alpha",
        id_timetable: 1,
        memberIds: [15, 16, 17],
      });

      // Should add new members
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 15);
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 16);
      expect(teamsService.addTeamMember).toHaveBeenCalledWith(1, 17);
      expect(teamsService.addTeamMember).toHaveBeenCalledTimes(3);

      // Should remove old members
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 10);
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 11);
      expect(teamsService.removeTeamMember).toHaveBeenCalledTimes(2);
    });

    it("should handle empty memberIds array (remove all members)", async () => {
      const currentTeam = {
        ...mockTeams[0],
        members: [
          { id: 10, name: "John", surname: "Doe" },
          { id: 11, name: "Jane", surname: "Smith" },
        ],
      };

      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.updateTeam as jest.Mock).mockResolvedValue(undefined);
      (teamsService.getTeamById as jest.Mock).mockResolvedValue(currentTeam);
      (teamsService.removeTeamMember as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Remove all members
      await result.current.updateExistingTeam(1, {
        name: "Team Alpha",
        id_timetable: 1,
        memberIds: [],
      });

      // Should remove all members
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 10);
      expect(teamsService.removeTeamMember).toHaveBeenCalledWith(1, 11);
      expect(teamsService.removeTeamMember).toHaveBeenCalledTimes(2);

      // Should not add any members
      expect(teamsService.addTeamMember).not.toHaveBeenCalled();
    });
  });

  describe("Deleting Teams", () => {
    it("should delete a team successfully", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.deleteTeam as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteTeamById(1);

      expect(teamsService.deleteTeam).toHaveBeenCalledWith(1);
      expect(teamsService.getTeams).toHaveBeenCalledTimes(2); // Initial + refetch
    });

    it("should handle error when deleting team fails", async () => {
      const errorMessage = "Failed to delete team";
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (teamsService.deleteTeam as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteTeamById(1)).rejects.toThrow(errorMessage);

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });
});
