/**
 * Time Recording types
 */

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export interface TimeRecording {
  id: number;
  timestamp: string;
  type: "Arrival" | "Departure";
  id_user: number;
  user?: User;
}

export interface WorkSession {
  date: string;
  arrival: string;
  departure: string;
  hours: number;
}

export interface UserStatistics {
  user: User;
  totalHours: number;
  totalDays: number;
  averageHoursPerDay: number;
  workSessions: WorkSession[];
}

export interface StatisticsPeriod {
  start: string | null;
  end: string | null;
}

export interface TimeRecordingStatsResponse {
  statistics: UserStatistics[];
  period: StatisticsPeriod;
}

export interface TimeRecordingFilters {
  id_user?: number;
  start_date?: string;
  end_date?: string;
  type?: "Arrival" | "Departure";
}
