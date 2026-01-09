/**
 * @fileoverview Tests for teamsService
 */

import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
} from "@/lib/services/teams/teamsService";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from "@/lib/utils/apiClient";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("teamsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTeams", () => {
    it("should fetch all teams without user filter", async () => {
      const mockTeams = [
        { id: 1, name: "Team A", id_manager: 1, id_timetable: 1, manager: {}, members: [] },
        { id: 2, name: "Team B", id_manager: 2, id_timetable: 2, manager: {}, members: [] },
      ];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams();

      expect(mockApiClient.get).toHaveBeenCalledWith("/teams");
      expect(result).toEqual(mockTeams);
    });

    it("should fetch teams with user filter", async () => {
      const mockTeams = [
        { id: 1, name: "Team A", id_manager: 1, id_timetable: 1, manager: {}, members: [] },
      ];

      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams(1);

      expect(mockApiClient.get).toHaveBeenCalledWith("/teams?id_user=1");
      expect(result).toEqual(mockTeams);
    });
  });

  describe("getTeamById", () => {
    it("should fetch a specific team by ID", async () => {
      const mockTeam = {
        id: 1,
        name: "Team A",
        id_manager: 1,
        id_timetable: 1,
        manager: {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "john@example.com",
          role: "manager",
        },
        members: [],
      };

      mockApiClient.get.mockResolvedValue(mockTeam);

      const result = await getTeamById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith("/teams/1");
      expect(result).toEqual(mockTeam);
    });
  });

  describe("createTeam", () => {
    it("should create a new team", async () => {
      const teamData = {
        name: "New Team",
        id_manager: 1,
        id_timetable: 1,
      };

      const mockResponse = {
        id: 3,
        ...teamData,
        manager: {},
        members: [],
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await createTeam(teamData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/teams", teamData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateTeam", () => {
    it("should update a team with all fields", async () => {
      const teamData = {
        name: "Updated Team",
        id_manager: 2,
        id_timetable: 2,
      };

      const mockResponse = {
        id: 1,
        ...teamData,
        manager: {},
        members: [],
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateTeam(1, teamData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/teams/1", teamData);
      expect(result).toEqual(mockResponse);
    });

    it("should update a team with partial fields", async () => {
      const teamData = {
        name: "Updated Name",
      };

      const mockResponse = {
        id: 1,
        name: "Updated Name",
        id_manager: 1,
        id_timetable: 1,
        manager: {},
        members: [],
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await updateTeam(1, teamData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/teams/1", teamData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("addTeamMember", () => {
    it("should add a user to a team", async () => {
      const mockResponse = { message: "User added successfully" };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await addTeamMember(1, 5);

      expect(mockApiClient.post).toHaveBeenCalledWith("/teams/1/users", {
        id_user: 5,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("removeTeamMember", () => {
    it("should remove a user from a team", async () => {
      const mockResponse = { message: "User removed successfully" };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await removeTeamMember(1, 5);

      expect(mockApiClient.delete).toHaveBeenCalledWith("/teams/1/users/5");
      expect(result).toEqual(mockResponse);
    });
  });
});
