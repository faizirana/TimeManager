/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useAdminStats } from "@/lib/hooks/useAdminStats";
import * as statsService from "@/lib/services/stats/statsService";

jest.mock("@/lib/services/stats/statsService");

describe("useAdminStats", () => {
  const mockStatsResponse = {
    totalUsers: 10,
    totalTeams: 3,
    totalTimetables: 2,
    roles: {
      managers: 2,
      employees: 7,
      admins: 1,
    },
    todayRecordings: 15,
    currentlyPresent: 5,
    teamsWithoutTimetable: 1,
    avgTeamSize: "3.5",
    activeManagers: 2,
    inactiveManagers: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with loading true and all stats at 0", () => {
      (statsService.getAdminStats as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAdminStats());

      expect(result.current.loading).toBe(true);
      expect(result.current.totalUsers).toBe(0);
      expect(result.current.totalTeams).toBe(0);
      expect(result.current.totalTimetables).toBe(0);
      expect(result.current.roles).toEqual({
        managers: 0,
        employees: 0,
        admins: 0,
      });
    });
  });

  describe("Fetching Stats", () => {
    it("should fetch all stats successfully", async () => {
      (statsService.getAdminStats as jest.Mock).mockResolvedValue(mockStatsResponse);

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalUsers).toBe(10);
      expect(result.current.totalTeams).toBe(3);
      expect(result.current.totalTimetables).toBe(2);
      expect(result.current.roles).toEqual({
        managers: 2,
        employees: 7,
        admins: 1,
      });
      expect(result.current.todayRecordings).toBe(15);
      expect(result.current.currentlyPresent).toBe(5);
      expect(result.current.teamsWithoutTimetable).toBe(1);
      expect(result.current.avgTeamSize).toBe("3.5");
      expect(result.current.activeManagers).toBe(2);
      expect(result.current.inactiveManagers).toBe(0);
      expect(statsService.getAdminStats).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error gracefully", async () => {
      (statsService.getAdminStats as jest.Mock).mockRejectedValue(new Error("Stats fetch error"));

      const { result } = renderHook(() => useAdminStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Échec du chargement des statistiques.");
      expect(result.current.totalUsers).toBe(0);
      expect(result.current.totalTeams).toBe(0);
    });
  });
});
