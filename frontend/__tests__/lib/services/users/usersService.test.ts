/**
 * @fileoverview Tests for usersService
 */

import {
  getUsers,
  getCurrentUserProfile,
  getUserById,
  updateCurrentUser,
} from "@/lib/services/users/usersService";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
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

  describe("getCurrentUserProfile", () => {
    it("should fetch current user profile", async () => {
      const mockProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        role: "employee" as const,
        id_manager: 2,
      };

      mockApiClient.get.mockResolvedValue(mockProfile);

      const result = await getCurrentUserProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockProfile);
    });

    it("should handle profile without mobileNumber", async () => {
      const mockProfile = {
        id: 1,
        name: "Jane",
        surname: "Smith",
        email: "jane.smith@example.com",
        mobileNumber: undefined,
        role: "manager" as const,
        id_manager: null,
      };

      mockApiClient.get.mockResolvedValue(mockProfile);

      const result = await getCurrentUserProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockProfile);
      expect(result.mobileNumber).toBeUndefined();
    });

    it("should throw error when not authenticated", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(getCurrentUserProfile()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getUserById", () => {
    it("should fetch user by ID", async () => {
      const mockUser = {
        id: 5,
        name: "Bob",
        surname: "Johnson",
        email: "bob@example.com",
        mobileNumber: "0698765432",
        role: "employee" as const,
        id_manager: 1,
      };

      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await getUserById(5);

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/5");
      expect(result).toEqual(mockUser);
    });

    it("should throw error when user not found", async () => {
      mockApiClient.get.mockRejectedValue(new Error("User not found"));

      await expect(getUserById(999)).rejects.toThrow("User not found");
    });
  });

  describe("updateCurrentUser", () => {
    it("should update current user profile with all fields", async () => {
      const currentProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        role: "employee" as const,
        id_manager: 2,
      };

      const updateData = {
        name: "Johnny",
        surname: "Doe",
        email: "johnny.doe@example.com",
        mobileNumber: "0698765432",
      };

      const updatedProfile = {
        ...currentProfile,
        ...updateData,
      };

      mockApiClient.get.mockResolvedValue(currentProfile);
      mockApiClient.put.mockResolvedValue(updatedProfile);

      const result = await updateCurrentUser(updateData);

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(mockApiClient.put).toHaveBeenCalledWith("/users/1", updateData);
      expect(result).toEqual(updatedProfile);
    });

    it("should update with optional mobileNumber removed", async () => {
      const currentProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        role: "employee" as const,
        id_manager: 2,
      };

      const updateData = {
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "",
      };

      mockApiClient.get.mockResolvedValue(currentProfile);
      mockApiClient.put.mockResolvedValue({ ...currentProfile, mobileNumber: "" });

      const result = await updateCurrentUser(updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/users/1", updateData);
      expect(result.mobileNumber).toBe("");
    });

    it("should update profile with password change", async () => {
      const currentProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        role: "employee" as const,
        id_manager: 2,
      };

      const updateData = {
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        password: "NewPassword123!",
      };

      mockApiClient.get.mockResolvedValue(currentProfile);
      mockApiClient.put.mockResolvedValue(currentProfile);

      await updateCurrentUser(updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/users/1", updateData);
    });

    it("should handle partial updates (only name)", async () => {
      const currentProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        mobileNumber: "0612345678",
        role: "employee" as const,
        id_manager: 2,
      };

      const updateData = {
        name: "Johnny",
      };

      const updatedProfile = {
        ...currentProfile,
        name: "Johnny",
      };

      mockApiClient.get.mockResolvedValue(currentProfile);
      mockApiClient.put.mockResolvedValue(updatedProfile);

      const result = await updateCurrentUser(updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/users/1", updateData);
      expect(result.name).toBe("Johnny");
    });

    it("should throw error on invalid update data", async () => {
      const currentProfile = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        role: "employee" as const,
        id_manager: 2,
      };

      mockApiClient.get.mockResolvedValue(currentProfile);
      mockApiClient.put.mockRejectedValue(new Error("Validation error"));

      await expect(updateCurrentUser({ email: "invalid-email" })).rejects.toThrow(
        "Validation error",
      );
    });
  });
});
