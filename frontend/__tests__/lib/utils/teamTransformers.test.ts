/**
 * @fileoverview Tests for teamTransformers utility functions
 */

import {
  formatShift,
  transformMember,
  transformMembers,
  getMemberFullName,
  canRemoveMember,
} from "@/lib/utils/teamTransformers";
import { User, Member } from "@/lib/types/teams";

describe("teamTransformers", () => {
  describe("formatShift", () => {
    it("should format shift with start and end times", () => {
      expect(formatShift("09:00", "17:00")).toBe("09:00 - 17:00");
    });

    it("should return default message when no shift start", () => {
      expect(formatShift(undefined, "17:00")).toBe("No shift assigned");
    });

    it("should return default message when no shift end", () => {
      expect(formatShift("09:00", undefined)).toBe("No shift assigned");
    });

    it("should return default message when both are undefined", () => {
      expect(formatShift(undefined, undefined)).toBe("No shift assigned");
    });
  });

  describe("transformMember", () => {
    const apiMember: User = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      role: "employee",
      mobileNumber: "+33601020304",
    };

    it("should transform API member to UI Member", () => {
      const result = transformMember(apiMember, 2, "09:00 - 17:00");

      expect(result).toEqual({
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        role: "employee",
        isManager: false,
        situation: { type: "onsite" },
        status: "planned",
        shift: "09:00 - 17:00",
      });
    });

    it("should mark member as manager when ID matches", () => {
      const result = transformMember(apiMember, 1, "09:00 - 17:00");

      expect(result.isManager).toBe(true);
    });

    it("should not mark member as manager when ID does not match", () => {
      const result = transformMember(apiMember, 999, "09:00 - 17:00");

      expect(result.isManager).toBe(false);
    });
  });

  describe("transformMembers", () => {
    const apiMembers: User[] = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        role: "employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane.smith@example.com",
        role: "manager",
        mobileNumber: "+33605060708",
      },
    ];

    it("should transform array of API members to UI Members", () => {
      const result = transformMembers(apiMembers, 2, "09:00 - 17:00");

      expect(result).toHaveLength(2);
      expect(result[0].isManager).toBe(false);
      expect(result[1].isManager).toBe(true);
      expect(result[0].shift).toBe("09:00 - 17:00");
      expect(result[1].shift).toBe("09:00 - 17:00");
    });

    it("should handle empty array", () => {
      const result = transformMembers([], 1, "09:00 - 17:00");

      expect(result).toEqual([]);
    });
  });

  describe("getMemberFullName", () => {
    it("should return full name from member object", () => {
      const member: Member = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        mobileNumber: "+33601020304",
        role: "employee",
        isManager: false,
        situation: { type: "onsite" },
        status: "planned",
        shift: "09:00 - 17:00",
      };

      expect(getMemberFullName(member)).toBe("John Doe");
    });

    it("should work with partial object containing name and surname", () => {
      const person = { name: "Jane", surname: "Smith" };

      expect(getMemberFullName(person)).toBe("Jane Smith");
    });
  });

  describe("canRemoveMember", () => {
    it("should return false for manager", () => {
      const manager: Member = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        mobileNumber: "+33601020304",
        role: "manager",
        isManager: true,
        situation: { type: "onsite" },
        status: "planned",
        shift: "09:00 - 17:00",
      };

      expect(canRemoveMember(manager)).toBe(false);
    });

    it("should return true for non-manager", () => {
      const employee: Member = {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        mobileNumber: "+33605060708",
        role: "employee",
        isManager: false,
        situation: { type: "telework" },
        status: "inProgress",
        shift: "09:00 - 17:00",
      };

      expect(canRemoveMember(employee)).toBe(true);
    });
  });
});
