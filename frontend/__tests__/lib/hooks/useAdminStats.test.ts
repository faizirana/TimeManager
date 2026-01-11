/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useAdminStats } from "@/lib/hooks/useAdminStats";
import * as teamsService from "@/lib/services/teams/teamsService";
import * as usersService from "@/lib/services/users/usersService";
import * as timetableService from "@/lib/services/timetable/timetableService";

jest.mock("@/lib/services/teams/teamsService");
jest.mock("@/lib/services/users/usersService");
jest.mock("@/lib/services/timetable/timetableService");

describe("useAdminStats", () => {
  const mockTeams = [
    { id: 1, name: "Team 1", id_manager: 1, id_timetable: 1 },
    { id: 2, name: "Team 2", id_manager: 2, id_timetable: 2 },
  ];

  const mockUsers = [
    {
      id: 1,
      name: "User1",
      surname: "Test",
      email: "user1@test.com",
      role: "admin",
      mobileNumber: "+33601020304",
    },
    {
      id: 2,
      name: "User2",
      surname: "Test",
      email: "user2@test.com",
      role: "manager",
      mobileNumber: "+33601020305",
    },
    {
      id: 3,
      name: "User3",
      surname: "Test",
      email: "user3@test.com",
      role: "employee",
      mobileNumber: "+33601020306",
    },
  ];

  const mockTimetables = [
    { id: 1, Shift_start: "09:00", Shift_end: "17:00" },
    { id: 2, Shift_start: "14:00", Shift_end: "22:00" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with loading true and stats at 0", () => {
      (teamsService.getTeams as jest.Mock).mockImplementation(() => new Promise(() => {}));
      (usersService.getUsers as jest.Mock).mockImplementation(() => new Promise(() => {}));
      (timetableService.getTimetables as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAdminStats());

      expect(result.current.loading).toBe(true);
      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 0,
        users: 0,
        timetables: 0,
      });
    });
  });

  describe("Fetching Stats", () => {
    it("should fetch all stats successfully", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (usersService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 2,
        users: 3,
        timetables: 2,
      });
      expect(teamsService.getTeams).toHaveBeenCalledTimes(1);
      expect(usersService.getUsers).toHaveBeenCalledTimes(1);
      expect(timetableService.getTimetables).toHaveBeenCalledTimes(1);
    });

    it("should handle empty data arrays", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue([]);
      (usersService.getUsers as jest.Mock).mockResolvedValue([]);
      (timetableService.getTimetables as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 0,
        users: 0,
        timetables: 0,
      });
    });

    it("should handle teams fetch error gracefully", async () => {
      (teamsService.getTeams as jest.Mock).mockRejectedValue(new Error("Teams error"));
      (usersService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 0,
        users: 3,
        timetables: 2,
      });
    });

    it("should handle users fetch error gracefully", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (usersService.getUsers as jest.Mock).mockRejectedValue(new Error("Users error"));
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 2,
        users: 0,
        timetables: 2,
      });
    });

    it("should handle timetables fetch error gracefully", async () => {
      (teamsService.getTeams as jest.Mock).mockResolvedValue(mockTeams);
      (usersService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
      (timetableService.getTimetables as jest.Mock).mockRejectedValue(
        new Error("Timetables error"),
      );

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 2,
        users: 3,
        timetables: 0,
      });
    });

    it("should handle all fetch errors gracefully", async () => {
      (teamsService.getTeams as jest.Mock).mockRejectedValue(new Error("Teams error"));
      (usersService.getUsers as jest.Mock).mockRejectedValue(new Error("Users error"));
      (timetableService.getTimetables as jest.Mock).mockRejectedValue(
        new Error("Timetables error"),
      );

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect({
        users: result.current.users,
        teams: result.current.teams,
        timetables: result.current.timetables,
      }).toEqual({
        teams: 0,
        users: 0,
        timetables: 0,
      });
    });
  });
});
