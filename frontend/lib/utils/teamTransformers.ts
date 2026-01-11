/**
 * @fileoverview Team Data Transformers
 * Pure functions for transforming API data to UI-friendly formats
 */

import { Member, User } from "@/lib/types/teams";

/**
 * Format timetable shift for display
 */
export function formatShift(shiftStart?: string, shiftEnd?: string): string {
  if (!shiftStart || !shiftEnd) {
    return "No shift assigned";
  }
  return `${shiftStart} - ${shiftEnd}`;
}

/**
 * Transform API member data to UI Member format
 */
export function transformMember(apiMember: User, managerId: number, shift: string): Member {
  return {
    id: apiMember.id,
    name: apiMember.name,
    surname: apiMember.surname,
    email: apiMember.email,
    mobileNumber: apiMember.mobileNumber,
    role: apiMember.role,
    isManager: apiMember.id === managerId,
    situation: { type: "onsite" as const }, // Placeholder - will be from timerecording
    status: "planned" as const, // Placeholder - will be from timerecording
    shift,
  };
}

/**
 * Transform array of API members to UI Members
 */
export function transformMembers(apiMembers: User[], managerId: number, shift: string): Member[] {
  return apiMembers.map((member) => transformMember(member, managerId, shift));
}

/**
 * Get full name from member
 */
export function getMemberFullName(member: Member | { name: string; surname: string }): string {
  return `${member.name} ${member.surname}`;
}

/**
 * Check if user can be removed from team (cannot remove manager)
 */
export function canRemoveMember(member: Member): boolean {
  return !member.isManager;
}
