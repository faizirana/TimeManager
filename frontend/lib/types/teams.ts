/**
 * Team and Member Types
 * Consolidated type definitions for all team-related entities
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  mobileNumber: string;
  role: string;
}

// ============================================================================
// Member Types (for team members list display)
// ============================================================================

export type MemberStatus = "inProgress" | "onPause" | "late" | "planned";

export type SituationType = "onsite" | "absent";

export type ClockInStatus = "active" | "paused" | "none";

export interface MemberSituation {
  type: SituationType;
}

/**
 * Extended Member type for UI display with additional metadata
 *
 * @interface Member
 * @extends User
 * @property {boolean} isManager - Whether this member is the team manager
 * @property {object} situation - Work location information
 * @property {"onsite" | "telework"} situation.type - Type of work location
 * @property {"inProgress" | "onPause" | "late" | "planned"} status - Current work status
 * @property {string} shift - Formatted shift time (e.g., "09:00 - 17:00")
 * @property {Date | undefined} lastClockIn - Timestamp of last clock in
 * @property {Date | undefined} lastClockOut - Timestamp of last clock out
 * @property {"active" | "paused" | "none"} clockStatus - Current clock in/out status
 */
export interface Member extends User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  isManager: boolean;
  situation: MemberSituation;
  status: MemberStatus;
  shift: string;
  lastClockIn?: Date;
  lastClockOut?: Date;
  clockStatus: ClockInStatus;
}

// ============================================================================
// Team Types
// ============================================================================

export interface Team {
  id: number;
  name: string;
  id_manager: number;
  id_timetable: number | null;
  manager?: User;
  members?: User[];
}

/**
 * Team display format for list views
 *
 * @interface TeamDisplay
 * @property {number} id - Unique team identifier
 * @property {string} name - Team name
 * @property {string} shift - Formatted shift time
 * @property {number} members - Number of team members
 * @property {string} managerName - Manager's full name (name + surname)
 */
export interface TeamDisplay {
  id: number;
  name: string;
  shift: string;
  members: number;
  managerName: string;
}

// ============================================================================
// Team Statistics Types
// ============================================================================

export interface TeamMemberStats {
  user: User;
  totalHours: number;
  totalDays: number;
  averageHoursPerDay: number;
}

export interface TeamStatsAggregated {
  totalMembers: number;
  totalHours: number;
  averageDaysWorked: number;
  averageHoursPerDay: number;
}

export interface TeamStatsPeriod {
  start: string | null;
  end: string | null;
}

export interface TeamStatsResponse {
  team: {
    id: number;
    name: string;
    manager: User;
  };
  statistics: TeamMemberStats[];
  aggregated: TeamStatsAggregated;
  period: TeamStatsPeriod;
}
