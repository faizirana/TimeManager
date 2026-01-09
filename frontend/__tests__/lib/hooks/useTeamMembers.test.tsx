/**
 * @fileoverview Tests for useTeamMembers hook
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useTeamMembers } from "@/lib/hooks/useTeamMembers";
import { getTeamById, addTeamMember, removeTeamMember } from "@/lib/services/teams/teamsService";

// Mock services
jest.mock("@/lib/services/teams/teamsService");

const mockGetTeamById = getTeamById as jest.MockedFunction<typeof getTeamById>;
const mockAddTeamMember = addTeamMember as jest.MockedFunction<typeof addTeamMember>;
const mockRemoveTeamMember = removeTeamMember as jest.MockedFunction<typeof removeTeamMember>;

describe("useTeamMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch team members successfully", async () => {
    const mockTeam = {
      id: 1,
      name: "Team A",
      id_manager: 1,
      id_timetable: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      members: [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
        { id: 2, name: "Jane", surname: "Smith", email: "jane@example.com", role: "Employee" },
      ],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0].isManager).toBe(true);
    expect(result.current.members[1].isManager).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle team with no members", async () => {
    const mockTeam = {
      id: 2,
      name: "Team B",
      id_manager: 3,
      id_timetable: 2,
      manager: {
        id: 3,
        name: "Bob",
        surname: "Manager",
        email: "bob@example.com",
        role: "Manager",
      },
      members: [],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);

    const { result } = renderHook(() => useTeamMembers(2, 3, "08:00 - 16:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toHaveLength(0);
  });

  it("should add multiple members successfully", async () => {
    const mockTeam = {
      id: 1,
      name: "Team A",
      id_manager: 1,
      id_timetable: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      members: [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      ],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockAddTeamMember.mockResolvedValue({ message: "Member added successfully" });

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addMembers([2, 3]);
    });

    expect(mockAddTeamMember).toHaveBeenCalledTimes(2);
    expect(mockAddTeamMember).toHaveBeenCalledWith(1, 2);
    expect(mockAddTeamMember).toHaveBeenCalledWith(1, 3);
    expect(mockGetTeamById).toHaveBeenCalledTimes(2); // Initial + refetch
  });

  it("should remove member with optimistic update", async () => {
    const mockTeam = {
      id: 1,
      name: "Team A",
      id_manager: 1,
      id_timetable: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      members: [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
        { id: 2, name: "Jane", surname: "Smith", email: "jane@example.com", role: "Employee" },
      ],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockRemoveTeamMember.mockResolvedValue({ message: "Member removed successfully" });

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toHaveLength(2);

    await act(async () => {
      await result.current.removeMember(2);
    });

    expect(mockRemoveTeamMember).toHaveBeenCalledWith(1, 2);
    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0].id).toBe(1);
  });

  it("should restore member on remove failure", async () => {
    const mockTeam = {
      id: 1,
      name: "Team A",
      id_manager: 1,
      id_timetable: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      members: [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
        { id: 2, name: "Jane", surname: "Smith", email: "jane@example.com", role: "Employee" },
      ],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockRemoveTeamMember.mockRejectedValue(new Error("Failed to remove"));

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to remove and catch the error
    await expect(
      act(async () => {
        await result.current.removeMember(2);
      }),
    ).rejects.toThrow("Failed to remove");

    // Members should remain unchanged (no optimistic removal happens on error)
    expect(result.current.members).toHaveLength(2);
  });

  it("should handle error when fetching members", async () => {
    mockGetTeamById.mockRejectedValue(new Error("Failed to fetch team"));

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch team");
    expect(result.current.members).toHaveLength(0);
  });

  it("should refetch members", async () => {
    const mockTeam = {
      id: 1,
      name: "Team A",
      id_manager: 1,
      id_timetable: 1,
      manager: { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      members: [
        { id: 1, name: "John", surname: "Doe", email: "john@example.com", role: "Manager" },
      ],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);

    const { result } = renderHook(() => useTeamMembers(1, 1, "09:00 - 17:00"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockGetTeamById).toHaveBeenCalledTimes(2);
    });
  });
});
