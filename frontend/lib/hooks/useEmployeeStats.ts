import { useState, useEffect } from "react";
import { getTimeRecordingStats } from "@/lib/services/timeRecording/timeRecordingService";

interface HoursData {
  date: string;
  hours: number;
}

interface EmployeeStatsData {
  hoursTimeline: HoursData[];
  punctualityRate: number;
  totalHours: number;
  averageHours: number;
}

interface UseEmployeeStatsResult {
  data: EmployeeStatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEmployeeStats(
  userId: number,
  startDate?: string,
  endDate?: string,
): UseEmployeeStatsResult {
  const [data, setData] = useState<EmployeeStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTimeRecordingStats({
        id_user: userId,
        start_date: startDate,
        end_date: endDate,
      });

      // Transform API response to component data structure
      const userStats =
        response.statistics.find((stat) => stat.user.id === userId) ?? response.statistics[0];

      if (userStats) {
        const transformedData: EmployeeStatsData = {
          hoursTimeline: userStats.workSessions.map((session) => ({
            date: session.date,
            hours: session.hours,
          })),
          punctualityRate: 85, // TODO: Calculate from arrival times
          totalHours: userStats.totalHours,
          averageHours: userStats.averageHoursPerDay,
        };
        setData(transformedData);
      } else {
        setData(null);
      }
    } catch (err: unknown) {
      console.error("Error fetching employee stats:", err);
      let errorMessage = "An error occurred while fetching stats";
      if (typeof err === "object" && err !== null) {
        if (
          "response" in err &&
          typeof (err as any).response === "object" &&
          (err as any).response?.data?.message
        ) {
          errorMessage = (err as any).response.data.message;
        } else if ("message" in err && typeof (err as any).message === "string") {
          errorMessage = (err as any).message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId, startDate, endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}
