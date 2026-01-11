/**
 * @fileoverview Tests for useTeamDetails hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useTeamDetails } from "@/lib/hooks/useTeamDetails";
import { getTeamById } from "@/lib/services/teams/teamsService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";

// Mock services
jest.mock("@/lib/services/teams/teamsService");
jest.mock("@/lib/services/timetable/timetableService");

const mockGetTeamById = getTeamById as jest.MockedFunction<typeof getTeamById>;
const mockGetTimetableById = getTimetableById as jest.MockedFunction<typeof getTimetableById>;

describe("useTeamDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch team details successfully", async () => {
    const mockTeam = {
      id: 1,
      name: "Development Team",
      id_timetable: 1,
      id_manager: 5,
      manager: {
        id: 5,
        name: "Alice",
        surname: "Manager",
        email: "alice@test.com",
        role: "manager",
        mobileNumber: "+33601020304",
      },
      members: [],
    };

    const mockTimetable = {
      id: 1,
      Shift_start: "09:00",
      Shift_end: "17:00",
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockGetTimetableById.mockResolvedValue(mockTimetable);

    const { result } = renderHook(() => useTeamDetails(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamName).toBe("Development Team");
    expect(result.current.teamShift).toBe("09:00 - 17:00");
    expect(result.current.managerId).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it("should handle team without timetable", async () => {
    const mockTeam = {
      id: 2,
      name: "Marketing Team",
      id_timetable: null,
      id_manager: 3,
      manager: {
        id: 3,
        name: "Bob",
        surname: "Manager",
        email: "bob@test.com",
        role: "manager",
        mobileNumber: "+33601020304",
      },
      members: [],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);

    const { result } = renderHook(() => useTeamDetails(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamName).toBe("Marketing Team");
    expect(result.current.teamShift).toBe("No shift assigned");
    expect(result.current.managerId).toBe(3);
  });

  it("should handle error when fetching team", async () => {
    mockGetTeamById.mockRejectedValue(new Error("Failed to fetch team"));

    const { result } = renderHook(() => useTeamDetails(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch team");
  });

  it("should handle error when fetching timetable", async () => {
    const mockTeam = {
      id: 1,
      name: "Development Team",
      id_timetable: 1,
      id_manager: 5,
      manager: {
        id: 5,
        name: "Alice",
        surname: "Manager",
        email: "alice@test.com",
        role: "manager",
        mobileNumber: "+33601020304",
      },
      members: [],
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockGetTimetableById.mockRejectedValue(new Error("Timetable not found"));

    const { result } = renderHook(() => useTeamDetails(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamName).toBe("Development Team");
    expect(result.current.teamShift).toBe("Shift unavailable");
  });

  it("should refetch team details", async () => {
    const mockTeam = {
      id: 1,
      name: "Development Team",
      id_timetable: 1,
      id_manager: 5,
      manager: {
        id: 5,
        name: "Alice",
        surname: "Manager",
        email: "alice@test.com",
        role: "manager",
        mobileNumber: "+33601020304",
      },
      members: [],
    };

    const mockTimetable = {
      id: 1,
      Shift_start: "09:00",
      Shift_end: "17:00",
    };

    mockGetTeamById.mockResolvedValue(mockTeam);
    mockGetTimetableById.mockResolvedValue(mockTimetable);

    const { result } = renderHook(() => useTeamDetails(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(mockGetTeamById).toHaveBeenCalledTimes(2);
    });
  });
});
