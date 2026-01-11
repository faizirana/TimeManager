/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useTimetables } from "@/lib/hooks/useTimetables";
import * as timetableService from "@/lib/services/timetable/timetableService";

jest.mock("@/lib/services/timetable/timetableService");

describe("useTimetables", () => {
  const mockTimetables = [
    { id: 1, Shift_start: "09:00", Shift_end: "17:00" },
    { id: 2, Shift_start: "14:00", Shift_end: "22:00" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty timetables, loading true, and no error", () => {
      (timetableService.getTimetables as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTimetables());

      expect(result.current.timetables).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Fetching Timetables", () => {
    it("should fetch timetables successfully on mount", async () => {
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.timetables).toEqual(mockTimetables);
      expect(result.current.error).toBeNull();
      expect(timetableService.getTimetables).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const errorMessage = "Échec du chargement des horaires. Veuillez réessayer.";
      (timetableService.getTimetables as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.timetables).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it("should refetch timetables when refetch is called", async () => {
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(timetableService.getTimetables).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(timetableService.getTimetables).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Creating Timetable", () => {
    it("should create a new timetable successfully", async () => {
      const newTimetable = { id: 3, Shift_start: "08:00", Shift_end: "16:00" };
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);
      (timetableService.createTimetable as jest.Mock).mockResolvedValue(newTimetable);

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const createdTimetable = await result.current.createNewTimetable({
        Shift_start: "08:00",
        Shift_end: "16:00",
      });

      expect(createdTimetable).toEqual(newTimetable);
      expect(timetableService.createTimetable).toHaveBeenCalledWith({
        Shift_start: "08:00",
        Shift_end: "16:00",
      });

      // Should refetch after creation
      await waitFor(() => {
        expect(timetableService.getTimetables).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle create error and rethrow", async () => {
      const errorMessage = "Failed to create timetable";
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);
      (timetableService.createTimetable as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.createNewTimetable({
          Shift_start: "08:00",
          Shift_end: "16:00",
        }),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("Deleting Timetable", () => {
    it("should delete a timetable successfully", async () => {
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);
      (timetableService.deleteTimetable as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteTimetableById(1);

      expect(timetableService.deleteTimetable).toHaveBeenCalledWith(1);

      // Should refetch after deletion
      await waitFor(() => {
        expect(timetableService.getTimetables).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle delete error and rethrow", async () => {
      const errorMessage = "Failed to delete timetable";
      (timetableService.getTimetables as jest.Mock).mockResolvedValue(mockTimetables);
      (timetableService.deleteTimetable as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteTimetableById(1)).rejects.toThrow(errorMessage);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-Error objects in fetch", async () => {
      (timetableService.getTimetables as jest.Mock).mockRejectedValue("String error");

      const { result } = renderHook(() => useTimetables());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Échec du chargement des horaires. Veuillez réessayer.");
    });
  });
});
