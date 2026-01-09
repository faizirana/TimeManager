/**
 * @fileoverview Tests for timetableService
 */

import {
  getTimetables,
  getTimetableById,
  createTimetable,
} from "@/lib/services/timetable/timetableService";

// Mock apiClient
jest.mock("@/lib/utils/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { apiClient } from "@/lib/utils/apiClient";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("timetableService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTimetables", () => {
    it("should fetch all timetables", async () => {
      const mockTimetables = [
        { id: 1, Shift_start: "09:00", Shift_end: "17:00" },
        { id: 2, Shift_start: "14:00", Shift_end: "22:00" },
      ];

      mockApiClient.get.mockResolvedValue(mockTimetables);

      const result = await getTimetables();

      expect(mockApiClient.get).toHaveBeenCalledWith("/timetables");
      expect(result).toEqual(mockTimetables);
    });

    it("should return empty array when no timetables", async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getTimetables();

      expect(result).toEqual([]);
    });
  });

  describe("getTimetableById", () => {
    it("should fetch a specific timetable by ID", async () => {
      const mockTimetable = {
        id: 1,
        Shift_start: "09:00",
        Shift_end: "17:00",
      };

      mockApiClient.get.mockResolvedValue(mockTimetable);

      const result = await getTimetableById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith("/timetables/1");
      expect(result).toEqual(mockTimetable);
    });
  });

  describe("createTimetable", () => {
    it("should create a new timetable", async () => {
      const timetableData = {
        Shift_start: "06:00",
        Shift_end: "14:00",
      };

      const mockResponse = {
        id: 3,
        ...timetableData,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await createTimetable(timetableData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/timetables", timetableData);
      expect(result).toEqual(mockResponse);
    });
  });
});
