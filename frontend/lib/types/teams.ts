/**
 * @fileoverview Team and User types
 *
 * Provides type definitions for team management features:
 * - User: Individual user/team member information
 * - Team: Team structure with manager and members
 *
 * These types match the backend API response format from the team controller.
 */

import { ApiError } from "@/lib/types/api";

/**
 * User (team member) information
 *
 * @interface User
 * @property {number} id - Unique user identifier
 * @property {string} name - User's first name
 * @property {string} surname - User's last name
 * @property {string} email - User's email address
 * @property {string} role - User's role in the system (e.g., "employee", "general_manager", "manager")
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: 1,
 *   name: "John",
 *   surname: "Doe",
 *   email: "john.doe@example.com",
 *   role: "employee"
 * };
 * ```
 */
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

/**
 * Team structure with manager and members
 *
 * @interface Team
 * @property {number} id - Unique team identifier
 * @property {string} name - Team name (e.g., "IT", "Sales", "HR")
 * @property {number} id_manager - Manager's user ID (references User.id)
 * @property {number} id_timetable - Associated timetable ID
 * @property {User} manager - Full manager user object
 * @property {User[]} members - Array of team members (including manager)
 *
 * @example
 * ```typescript
 * const team: Team = {
 *   id: 1,
 *   name: "Engineering",
 *   id_manager: 5,
 *   id_timetable: 10,
 *   manager: {
 *     id: 5,
 *     name: "Jane",
 *     surname: "Smith",
 *     email: "jane.smith@example.com",
 *     role: "manager"
 *   },
 *   members: [
 *     // ... array of User objects
 *   ]
 * };
 * ```
 */
export interface Team {
  id: number;
  name: string;
  id_manager: number;
  id_timetable: number;
  manager: User;
  members: User[];
}

// Re-export ApiError for convenience
export type { ApiError };
