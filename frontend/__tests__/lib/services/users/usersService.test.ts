/**
 * @fileoverview Tests for usersService
 */

import { getUsers } from "@/lib/services/users/usersService";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { apiClient } from "@/lib/utils/apiClient";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("usersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch all users", async () => {
      const mockUsers = [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "employee" },
        { id: 2, name: "Jane", surname: "Smith", email: "jane@example.com", role: "manager" },
      ];

      mockApiClient.get.mockResolvedValue(mockUsers);

      const result = await getUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith("/users");
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array when no users", async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getUsers();

      expect(result).toEqual([]);
    });
  });
});
