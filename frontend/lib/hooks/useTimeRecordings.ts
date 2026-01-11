/**
 * useTimeRecording Hook
 *
 * Manages time recording  with loading and error states.
 */

import { useState, useEffect } from "react";
import { getTimeRecordings } from "@/lib/services/timeRecording/timeRecordingService";
import { TimeRecording } from "@/lib/types/timeRecording";

interface UseTimeRecordingsParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
  type?: "Arrival" | "Departure";
}

interface UseTimeRecordingsReturn {
  timeRecordings: TimeRecording[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage time recordings with optionnal paramaters
 *
 * @param params - Filter parameters
 * @returns Time recordings with loading and error states
 */
export function useTimeRecordings({
  userId,
  startDate,
  endDate,
  type,
}: UseTimeRecordingsParams = {}): UseTimeRecordingsReturn {
  const [timeRecordings, setTimeRecordings] = useState<TimeRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTimeRecordings({
        id_user: userId,
        start_date: startDate,
        end_date: endDate,
        type,
      });

      setTimeRecordings(response);
    } catch (_err) {
      setError("Impossible de charger les shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeRecordings();
  }, [userId, startDate, endDate, type]);

  return {
    timeRecordings,
    loading,
    error,
    refetch: fetchTimeRecordings,
  };
}
