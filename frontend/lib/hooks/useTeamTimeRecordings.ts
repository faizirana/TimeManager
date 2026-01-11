/**
 * useTeamTimeRecordings Hook
 *
 * Gère la récupération des time recordings pour tous les membres d'une équipe.
 * Auto-refresh toutes les 60 secondes pour garder les données à jour.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/utils/apiClient";

export interface TeamTimeRecording {
  id: number;
  id_user: number;
  timestamp: string;
  type: "Arrival" | "Departure";
}

interface UseTeamTimeRecordingsReturn {
  recordings: Record<number, TeamTimeRecording[]>; // userId -> recordings
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTeamTimeRecordings(teamId: number): UseTeamTimeRecordingsReturn {
  const [recordings, setRecordings] = useState<Record<number, TeamTimeRecording[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      setError(null);
      const today = new Date().toISOString().split("T")[0];

      const response = await apiClient.get<{
        teamId: number;
        date: string;
        recordings: TeamTimeRecording[];
      }>(`/timerecordings/team/${teamId}?date=${today}`);

      // Grouper les recordings par userId
      const groupedRecordings: Record<number, TeamTimeRecording[]> = {};

      response.recordings.forEach((recording: TeamTimeRecording) => {
        if (!groupedRecordings[recording.id_user]) {
          groupedRecordings[recording.id_user] = [];
        }
        groupedRecordings[recording.id_user].push(recording);
      });

      // Trier les recordings par date pour chaque utilisateur
      Object.keys(groupedRecordings).forEach((userId) => {
        groupedRecordings[Number(userId)].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      });

      // Comparer avec les recordings actuels pour éviter les re-renders inutiles
      setRecordings((prevRecordings) => {
        const prevJson = JSON.stringify(prevRecordings);
        const newJson = JSON.stringify(groupedRecordings);

        // Ne mettre à jour que si les données ont changé
        if (prevJson === newJson) {
          return prevRecordings;
        }
        return groupedRecordings;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la récupération des pointages";

      // Si erreur d'authentification, ne pas loguer (l'utilisateur est probablement déconnecté)
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        setError(null); // Ne pas afficher d'erreur à l'utilisateur
      } else {
        console.error("Error fetching time recordings:", err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchRecordings();

      // Auto-refresh toutes les 60 secondes
      const interval = setInterval(fetchRecordings, 60000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [teamId, fetchRecordings]);

  return {
    recordings,
    loading,
    error,
    refetch: fetchRecordings,
  };
}
