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
  role?: string;
}

// ============================================================================
// Member Types (for team members list display)
// ============================================================================

export type MemberStatus = "inProgress" | "onPause" | "late" | "planned";

export type SituationType = "onsite" | "telework";

export interface MemberSituation {
  type: SituationType;
}

export interface Member {
  id: number;
  name: string;
  surname: string;
  email: string;
  role?: string;
  isManager: boolean;
  situation: MemberSituation;
  status: MemberStatus;
  shift: string;
}

// ============================================================================
// Team Types
// ============================================================================

export interface Team {
  id: number;
  name: string;
  id_manager: number;
  id_timetable?: number | null;
  manager?: User;
  members?: User[];
}

export interface TeamDisplay {
  id: number;
  name: string;
  shift: string;
  members: number;
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
