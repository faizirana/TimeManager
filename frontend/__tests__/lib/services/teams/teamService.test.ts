/**
 * @fileoverview Tests for Team Service
 */

import {
  getTeams,
  getTeamById,
  getTeamStats,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from "@/lib/services/teams/teamService";
import { apiClient } from "@/lib/utils/apiClient";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("Team Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTeams", () => {
    it("should fetch all teams without filters", async () => {
      const mockTeams = [
        { id: 1, name: "Team Alpha", id_manager: 5 },
        { id: 2, name: "Team Beta", id_manager: 6 },
      ];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams();

      expect(result).toEqual(mockTeams);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams");
    });

    it("should fetch teams filtered by user", async () => {
      const mockTeams = [{ id: 1, name: "Team Alpha", id_manager: 5 }];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams({ id_user: 2 });

      expect(result).toEqual(mockTeams);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams?id_user=2");
    });

    it("should fetch teams filtered by manager", async () => {
      const mockTeams = [{ id: 1, name: "Team Alpha", id_manager: 5 }];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams({ id_manager: 5 });

      expect(result).toEqual(mockTeams);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams?id_manager=5");
    });

    it("should fetch teams with both filters", async () => {
      const mockTeams = [{ id: 1, name: "Team Alpha", id_manager: 5 }];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams({ id_user: 2, id_manager: 5 });

      expect(result).toEqual(mockTeams);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams?id_user=2&id_manager=5");
    });
  });

  describe("getTeamById", () => {
    it("should fetch a specific team", async () => {
      const mockTeam = { id: 1, name: "Team Alpha", id_manager: 5 };

      mockApiClient.get.mockResolvedValue(mockTeam);

      const result = await getTeamById(1);

      expect(result).toEqual(mockTeam);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams/1");
    });
  });

  describe("getTeamStats", () => {
    it("should fetch team statistics without filters", async () => {
      const mockStats = {
        team: { id: 1, name: "Team Alpha" },
        statistics: [],
        aggregated: { totalMembers: 0, totalHours: 0 },
        period: { start: null, end: null },
      };

      mockApiClient.get.mockResolvedValue(mockStats);

      const result = await getTeamStats(1);

      expect(result).toEqual(mockStats);
      expect(mockApiClient.get).toHaveBeenCalledWith("/teams/1/stats");
    });

    it("should fetch team statistics with date filters", async () => {
      const mockStats = {
        team: { id: 1, name: "Team Alpha" },
        statistics: [],
        aggregated: { totalMembers: 0, totalHours: 0 },
        period: { start: "2026-01-01", end: "2026-01-31" },
      };

      mockApiClient.get.mockResolvedValue(mockStats);

      const result = await getTeamStats(1, {
        start_date: "2026-01-01",
        end_date: "2026-01-31",
      });

      expect(result).toEqual(mockStats);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/teams/1/stats?start_date=2026-01-01&end_date=2026-01-31",
      );
    });
  });

  describe("createTeam", () => {
    it("should create a new team", async () => {
      const teamData = {
        name: "Team Gamma",
        id_manager: 7,
        id_timetable: 1,
      };

      const mockCreatedTeam = { id: 3, ...teamData };

      mockApiClient.post.mockResolvedValue(mockCreatedTeam);

      const result = await createTeam(teamData);

      expect(result).toEqual(mockCreatedTeam);
      expect(mockApiClient.post).toHaveBeenCalledWith("/teams", teamData);
    });
  });

  describe("updateTeam", () => {
    it("should update a team", async () => {
      const updateData = { name: "Team Alpha Updated" };
      const mockUpdatedTeam = { id: 1, name: "Team Alpha Updated", id_manager: 5 };

      mockApiClient.put.mockResolvedValue(mockUpdatedTeam);

      const result = await updateTeam(1, updateData);

      expect(result).toEqual(mockUpdatedTeam);
      expect(mockApiClient.put).toHaveBeenCalledWith("/teams/1", updateData);
    });
  });

  describe("deleteTeam", () => {
    it("should delete a team", async () => {
      const mockResponse = { message: "Team deleted successfully" };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteTeam(1);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.delete).toHaveBeenCalledWith("/teams/1");
    });
  });

  describe("addTeamMember", () => {
    it("should add a member to a team", async () => {
      const mockResponse = { message: "User added to team" };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await addTeamMember(1, 5);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.post).toHaveBeenCalledWith("/teams/1/users", { id_user: 5 });
    });
  });

  describe("removeTeamMember", () => {
    it("should remove a member from a team", async () => {
      const mockResponse = { message: "User removed from team" };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await removeTeamMember(1, 5);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.delete).toHaveBeenCalledWith("/teams/1/users/5");
    });
  });
});
