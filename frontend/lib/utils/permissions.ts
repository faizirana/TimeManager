/**
 * @fileoverview Permission utilities
 *
 * Helper functions to check user permissions based on roles
 */

type UserRole = "manager" | "employee" | "admin";

/**
 * Check if user has manager or admin role
 * @param role - User role
 * @returns true if user is manager or admin
 */
export function canManageTeams(role?: UserRole): boolean {
  return role === "manager" || role === "admin";
}

/**
 * Check if user has admin role
 * @param role - User role
 * @returns true if user is admin
 */
export function isAdmin(role?: UserRole): boolean {
  return role === "admin";
}
