/**
 * Team types
 */

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role?: string;
}

export interface Team {
  id: number;
  name: string;
  id_manager: number;
  id_timetable?: number | null;
  manager?: User;
  members?: User[];
}

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
