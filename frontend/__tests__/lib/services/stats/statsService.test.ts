/**
 * @jest-environment jsdom
 */

import { getAdminStats } from "@/lib/services/stats/statsService";
import { apiClient } from "@/lib/utils/apiClient";

jest.mock("@/lib/utils/apiClient");

describe("statsService", () => {
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

  describe("getAdminStats", () => {
    it("should fetch admin statistics successfully", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockStatsResponse);

      const result = await getAdminStats();

      expect(apiClient.get).toHaveBeenCalledWith("/stats/admin");
      expect(result).toEqual(mockStatsResponse);
    });

    it("should throw error when API call fails", async () => {
      const errorMessage = "Failed to fetch stats";
      (apiClient.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(getAdminStats()).rejects.toThrow(errorMessage);
      expect(apiClient.get).toHaveBeenCalledWith("/stats/admin");
    });

    it("should return all required fields", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockStatsResponse);

      const result = await getAdminStats();

      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("totalTeams");
      expect(result).toHaveProperty("totalTimetables");
      expect(result).toHaveProperty("roles");
      expect(result).toHaveProperty("todayRecordings");
      expect(result).toHaveProperty("currentlyPresent");
      expect(result).toHaveProperty("teamsWithoutTimetable");
      expect(result).toHaveProperty("avgTeamSize");
      expect(result).toHaveProperty("activeManagers");
      expect(result).toHaveProperty("inactiveManagers");
    });

    it("should have correct role distribution structure", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockStatsResponse);

      const result = await getAdminStats();

      expect(result.roles).toHaveProperty("managers");
      expect(result.roles).toHaveProperty("employees");
      expect(result.roles).toHaveProperty("admins");
      expect(typeof result.roles.managers).toBe("number");
      expect(typeof result.roles.employees).toBe("number");
      expect(typeof result.roles.admins).toBe("number");
    });
  });
});
