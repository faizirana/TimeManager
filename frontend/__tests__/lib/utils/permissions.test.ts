/**
 * Tests for permission utilities
 *
 * Tests role-based permission checks for:
 * - Team management permissions (manager/admin)
 * - Admin-only permissions
 */

import { canManageTeams, isAdmin } from "@/lib/utils/permissions";

describe("Permission Utilities", () => {
  describe("canManageTeams", () => {
    it("should return true for manager role", () => {
      expect(canManageTeams("manager")).toBe(true);
    });

    it("should return true for admin role", () => {
      expect(canManageTeams("admin")).toBe(true);
    });

    it("should return false for employee role", () => {
      expect(canManageTeams("employee")).toBe(false);
    });

    it("should return false for undefined role", () => {
      expect(canManageTeams(undefined)).toBe(false);
    });

    it("should return false when no role is provided", () => {
      expect(canManageTeams()).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin role", () => {
      expect(isAdmin("admin")).toBe(true);
    });

    it("should return false for manager role", () => {
      expect(isAdmin("manager")).toBe(false);
    });

    it("should return false for employee role", () => {
      expect(isAdmin("employee")).toBe(false);
    });

    it("should return false for undefined role", () => {
      expect(isAdmin(undefined)).toBe(false);
    });

    it("should return false when no role is provided", () => {
      expect(isAdmin()).toBe(false);
    });
  });
});
