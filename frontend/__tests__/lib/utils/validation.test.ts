/**
 * Tests for validation utilities
 */

import {
  validateRequired,
  validateEmail,
  validatePassword,
  validateMobile,
  validateCountryCode,
  validateTimeFormat,
  validateTimeRange,
} from "@/lib/utils/validation";

describe("Validation Utilities", () => {
  describe("validateRequired", () => {
    it("should pass for non-empty values", () => {
      const result = validateRequired("value", "Field");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail for empty string", () => {
      const result = validateRequired("", "Field");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Le champ Field est requis.");
    });

    it("should fail for whitespace only", () => {
      const result = validateRequired("   ", "Field");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Le champ Field est requis.");
    });
  });

  describe("validateEmail", () => {
    it("should pass for valid email", () => {
      const result = validateEmail("test@example.com");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should pass for email with subdomain", () => {
      const result = validateEmail("user@mail.example.com");
      expect(result.valid).toBe(true);
    });

    it("should fail for email without @", () => {
      const result = validateEmail("testexample.com");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("L'email n'est pas valide.");
    });

    it("should fail for email without domain", () => {
      const result = validateEmail("test@");
      expect(result.valid).toBe(false);
    });

    it("should fail for email without extension", () => {
      const result = validateEmail("test@example");
      expect(result.valid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should pass for valid password", () => {
      const result = validatePassword("Password1!");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail for password without uppercase", () => {
      const result = validatePassword("password1!");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("au moins 8 caractères");
    });

    it("should fail for password without digit", () => {
      const result = validatePassword("Password!");
      expect(result.valid).toBe(false);
    });

    it("should fail for password without special char", () => {
      const result = validatePassword("Password1");
      expect(result.valid).toBe(false);
    });

    it("should fail for short password", () => {
      const result = validatePassword("Pass1!");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateMobile", () => {
    it("should pass for valid French mobile", () => {
      const result = validateMobile("0612345678");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should pass for various French mobile prefixes", () => {
      expect(validateMobile("0601020304").valid).toBe(true);
      expect(validateMobile("0712345678").valid).toBe(true);
      expect(validateMobile("0987654321").valid).toBe(true);
    });

    it("should fail for mobile not starting with 0", () => {
      const result = validateMobile("1612345678");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10 chiffres");
    });

    it("should fail for mobile starting with 00", () => {
      const result = validateMobile("0012345678");
      expect(result.valid).toBe(false);
    });

    it("should fail for too short mobile", () => {
      const result = validateMobile("061234567");
      expect(result.valid).toBe(false);
    });

    it("should fail for too long mobile", () => {
      const result = validateMobile("06123456789");
      expect(result.valid).toBe(false);
    });

    it("should fail for non-numeric mobile", () => {
      const result = validateMobile("06abc45678");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateCountryCode", () => {
    it("should pass for valid country codes", () => {
      expect(validateCountryCode("+33").valid).toBe(true);
      expect(validateCountryCode("+1").valid).toBe(true);
      expect(validateCountryCode("+44").valid).toBe(true);
      expect(validateCountryCode("+999").valid).toBe(true);
    });

    it("should fail for code without +", () => {
      const result = validateCountryCode("33");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("+00 à +999");
    });

    it("should fail for code with too many digits", () => {
      const result = validateCountryCode("+9999");
      expect(result.valid).toBe(false);
    });

    it("should fail for non-numeric code", () => {
      const result = validateCountryCode("+ab");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateTimeFormat", () => {
    it("should pass for valid times", () => {
      expect(validateTimeFormat("09:00").valid).toBe(true);
      expect(validateTimeFormat("23:59").valid).toBe(true);
      expect(validateTimeFormat("00:00").valid).toBe(true);
      expect(validateTimeFormat("12:30").valid).toBe(true);
    });

    it("should fail for invalid hour", () => {
      expect(validateTimeFormat("24:00").valid).toBe(false);
      expect(validateTimeFormat("25:30").valid).toBe(false);
    });

    it("should fail for invalid minute", () => {
      expect(validateTimeFormat("12:60").valid).toBe(false);
      expect(validateTimeFormat("09:99").valid).toBe(false);
    });

    it("should fail for wrong format", () => {
      expect(validateTimeFormat("9:00").valid).toBe(false);
      expect(validateTimeFormat("09:0").valid).toBe(false);
      expect(validateTimeFormat("9:0").valid).toBe(false);
    });

    it("should fail for non-time strings", () => {
      expect(validateTimeFormat("abc").valid).toBe(false);
      expect(validateTimeFormat("12-30").valid).toBe(false);
    });
  });

  describe("validateTimeRange", () => {
    it("should pass for valid time range", () => {
      const result = validateTimeRange("09:00", "17:00");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail when start equals end", () => {
      const result = validateTimeRange("09:00", "09:00");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("après");
    });

    it("should fail when end is before start", () => {
      const result = validateTimeRange("17:00", "09:00");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("après");
    });

    it("should handle edge cases", () => {
      expect(validateTimeRange("00:00", "23:59").valid).toBe(true);
      expect(validateTimeRange("23:59", "00:00").valid).toBe(false);
    });
  });
});
