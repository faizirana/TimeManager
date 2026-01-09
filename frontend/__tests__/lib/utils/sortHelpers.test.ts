/**
 * @fileoverview Tests for sortHelpers utility functions
 */

import { compareShifts, compareSituations } from "@/lib/utils/sortHelpers";

describe("sortHelpers", () => {
  describe("compareShifts", () => {
    it("should sort shifts in ascending order by start time", () => {
      expect(compareShifts("08:00 - 16:00", "09:00 - 17:00")).toBeLessThan(0);
      expect(compareShifts("09:00 - 17:00", "08:00 - 16:00")).toBeGreaterThan(0);
    });

    it("should return 0 for equal shifts", () => {
      expect(compareShifts("09:00 - 17:00", "09:00 - 17:00")).toBe(0);
    });

    it("should handle different time formats correctly", () => {
      expect(compareShifts("06:00 - 14:00", "14:00 - 22:00")).toBeLessThan(0);
      expect(compareShifts("22:00 - 06:00", "06:00 - 14:00")).toBeGreaterThan(0);
    });

    it("should handle shifts with same start time", () => {
      expect(compareShifts("09:00 - 17:00", "09:00 - 18:00")).toBe(0);
    });
  });

  describe("compareSituations", () => {
    it("should sort situations in alphabetical order by label", () => {
      const situationA = { label: "Telework" };
      const situationB = { label: "On Site" };

      expect(compareSituations(situationA, situationB)).toBeGreaterThan(0);
      expect(compareSituations(situationB, situationA)).toBeLessThan(0);
    });

    it("should return 0 for equal situation labels", () => {
      const situationA = { label: "On Site" };
      const situationB = { label: "On Site" };

      expect(compareSituations(situationA, situationB)).toBe(0);
    });

    it("should handle case-sensitive sorting", () => {
      const situationA = { label: "business trip" };
      const situationB = { label: "Business Trip" };

      // localeCompare puts uppercase before lowercase
      expect(compareSituations(situationB, situationA)).toBeGreaterThan(0);
    });

    it("should sort multiple situations correctly", () => {
      const situations = [
        { label: "Telework" },
        { label: "On Site" },
        { label: "Business Trip" },
        { label: "Absent" },
      ];

      situations.sort(compareSituations);

      expect(situations[0].label).toBe("Absent");
      expect(situations[1].label).toBe("Business Trip");
      expect(situations[2].label).toBe("On Site");
      expect(situations[3].label).toBe("Telework");
    });

    it("should handle special characters in labels", () => {
      const situationA = { label: "Café" };
      const situationB = { label: "Coffee" };

      expect(compareSituations(situationA, situationB)).toBeLessThan(0);
    });
  });
});
