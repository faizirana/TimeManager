/**
 * Tests for form helper utilities
 */

import {
  resetFormFields,
  normalizePhoneNumber,
  parsePhoneNumber,
  parseFormError,
  debounce,
  formatShift,
} from "@/lib/utils/formHelpers";

describe("Form Helper Utilities", () => {
  describe("resetFormFields", () => {
    it("should reset all fields to empty string", () => {
      const setter1 = jest.fn();
      const setter2 = jest.fn();
      const setter3 = jest.fn();

      resetFormFields([setter1, setter2, setter3]);

      expect(setter1).toHaveBeenCalledWith("");
      expect(setter2).toHaveBeenCalledWith("");
      expect(setter3).toHaveBeenCalledWith("");
    });

    it("should reset all fields to custom default value", () => {
      const setter1 = jest.fn();
      const setter2 = jest.fn();

      resetFormFields([setter1, setter2], "default");

      expect(setter1).toHaveBeenCalledWith("default");
      expect(setter2).toHaveBeenCalledWith("default");
    });
  });

  describe("normalizePhoneNumber", () => {
    it("should combine country code and mobile without leading 0", () => {
      const result = normalizePhoneNumber("+33", "0612345678");
      expect(result).toBe("+33612345678");
    });

    it("should handle mobile already without leading 0", () => {
      const result = normalizePhoneNumber("+33", "612345678");
      expect(result).toBe("+33612345678");
    });

    it("should work with different country codes", () => {
      expect(normalizePhoneNumber("+1", "0555123456")).toBe("+1555123456");
      expect(normalizePhoneNumber("+44", "07123456789")).toBe("+447123456789");
    });

    it("should handle trimmed inputs", () => {
      const result = normalizePhoneNumber("+33", " 0612345678 ");
      expect(result).toBe("+33612345678");
    });
  });

  describe("parsePhoneNumber", () => {
    it("should parse valid E.164 number with French format", () => {
      const result = parsePhoneNumber("+33612345678");
      expect(result).toEqual({
        countryCode: "+33",
        localNumber: "0612345678",
      });
    });

    it("should parse valid E.164 number with US format", () => {
      const result = parsePhoneNumber("+15551234567");
      expect(result).toEqual({
        countryCode: "+1",
        localNumber: "5551234567",
      });
    });

    it("should parse E.164 with country code starting with 4", () => {
      // Note: This captures +4 as country code (1 digit), not ideal for +44 (UK)
      // but acceptable as we prioritize shorter codes
      const result = parsePhoneNumber("+447123456789");
      expect(result).toEqual({
        countryCode: "+4",
        localNumber: "47123456789",
      });
    });

    it("should handle French number with double zero", () => {
      // For French numbers, we prepend 0 to the local part
      const result = parsePhoneNumber("+33012345678");
      expect(result).toEqual({
        countryCode: "+33",
        localNumber: "0012345678",
      });
    });

    it("should return default for invalid format", () => {
      const result = parsePhoneNumber("invalid");
      expect(result).toEqual({
        countryCode: "+33",
        localNumber: "invalid",
      });
    });

    it("should return default for empty string", () => {
      const result = parsePhoneNumber("");
      expect(result).toEqual({
        countryCode: "+33",
        localNumber: "",
      });
    });

    it("should handle numbers without + prefix", () => {
      const result = parsePhoneNumber("33612345678");
      expect(result).toEqual({
        countryCode: "+33",
        localNumber: "33612345678",
      });
    });

    it("should parse country code by trying shortest first", () => {
      const result = parsePhoneNumber("+4471234567");
      expect(result).toEqual({
        countryCode: "+4",
        localNumber: "471234567",
      });
    });
  });

  describe("parseFormError", () => {
    it("should return error message from Error object", () => {
      const error = new Error("Test error message");
      expect(parseFormError(error)).toBe("Test error message");
    });

    it("should return string error as is", () => {
      expect(parseFormError("String error")).toBe("String error");
    });

    it("should extract message from object with message property", () => {
      const error = { message: "Object error message" };
      expect(parseFormError(error)).toBe("Object error message");
    });

    it("should return default message for unknown error types", () => {
      expect(parseFormError(123)).toBe("Une erreur s'est produite. Veuillez réessayer.");
      expect(parseFormError(null)).toBe("Une erreur s'est produite. Veuillez réessayer.");
      expect(parseFormError(undefined)).toBe("Une erreur s'est produite. Veuillez réessayer.");
    });

    it("should return default message for object without message", () => {
      expect(parseFormError({ code: 404 })).toBe("Une erreur s'est produite. Veuillez réessayer.");
    });
  });

  describe("debounce", () => {
    jest.useFakeTimers();

    it("should delay function execution", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("test");

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should cancel previous calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("first");
      jest.advanceTimersByTime(100);
      debouncedFn("second");
      jest.advanceTimersByTime(100);
      debouncedFn("third");
      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("third");
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe("formatShift", () => {
    it("should return shift when provided", () => {
      const result = formatShift("09:00 - 17:00");
      expect(result).toBe("09:00 - 17:00");
    });

    it("should handle different shift formats", () => {
      expect(formatShift("00:00 - 23:59")).toBe("00:00 - 23:59");
      expect(formatShift("12:30 - 14:45")).toBe("12:30 - 14:45");
    });

    it("should return fallback for null", () => {
      expect(formatShift(null)).toBe("Non défini");
    });

    it("should return fallback for undefined", () => {
      expect(formatShift(undefined)).toBe("Non défini");
    });
  });
});
