"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { Skeleton } from "@/components/UI/Skeleton";

import { useTimeRecordings } from "@/lib/hooks/useTimeRecordings";
import { Button } from "@/components/UI/Button";
import { createTimeRecording } from "@/lib/services/timeRecording/timeRecordingService";
import { showSuccess, showError } from "@/lib/services/notificationService";
import { useState, useEffect } from "react";

export default function ClockInPage() {
  const { user, loading } = useProtectedRoute();

  const {
    timeRecordings,
    loading: timeRecordingsLoading,
    error: timeRecordingsError,
    refetch,
  } = useTimeRecordings({ userId: user?.id });

  const [actionLoading, setActionLoading] = useState(false);

  // Helper: get last type
  const lastType = timeRecordings.length > 0 ? timeRecordings[0].type : null;

  // Helper: get last timestamp (not used, removed to fix ESLint warning)

  // State for elapsed time
  const [elapsed, setElapsed] = useState<string>("");

  // Calculate elapsed time since last clock-in (Arrival)
  useEffect(() => {
    const lastArrival = timeRecordings.find((rec) => rec.type === "Arrival");
    if (!lastArrival) {
      setElapsed("");
      return undefined;
    }
    const start = new Date(lastArrival.timestamp).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      let diff = Math.floor((now - start) / 1000); // in seconds
      const hours = Math.floor(diff / 3600)
        .toString()
        .padStart(2, "0");
      diff %= 3600;
      const minutes = Math.floor(diff / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (diff % 60).toString().padStart(2, "0");
      setElapsed(`${hours}:${minutes}:${seconds}`);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [timeRecordings]);

  // Action: pointer (clock in/out)
  const handleClock = async (type: "Arrival" | "Departure") => {
    if (!user) return;
    setActionLoading(true);
    try {
      await createTimeRecording({
        timestamp: new Date().toISOString(),
        type,
        id_user: user.id,
      });
      showSuccess(type === "Arrival" ? "Pointage effectué !" : "Dépointage effectué !");
      await refetch();
    } catch (err: unknown) {
      // Type guard for error
      if (typeof err === "object" && err !== null && "response" in err) {
        // @ts-expect-error: dynamic error shape
        showError(err.response?.data?.message ?? "Erreur lors du pointage");
      } else {
        showError("Erreur lors du pointage");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Skeleton for personal stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        {/* Skeleton for manager section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    );
  }

  // Will redirect to login if not authenticated
  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pointer</h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-gray-700 dark:text-gray-300">
            Bienvenue, {user.name} {user.surname}
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.role === "manager"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            }`}
          >
            {user.role === "manager" ? "Manager" : user.role}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Vos heures de travail enregistrées via le système de pointage
        </p>

        <div className="flex gap-4 mb-6">
          <Button
            variant="primary"
            disabled={actionLoading || lastType === "Arrival"}
            onClick={() => handleClock("Arrival")}
          >
            Pointer l'arrivée
          </Button>
          <Button
            variant="secondary"
            disabled={actionLoading || lastType === "Departure" || !lastType}
            onClick={() => handleClock("Departure")}
          >
            Pointer le départ
          </Button>
        </div>

        {/* Affichage du temps écoulé depuis le dernier clock-in (Arrival) */}
        {lastType === "Arrival" && elapsed && (
          <div className="mb-4 text-lg font-semibold text-blue-600 dark:text-blue-300">
            Temps depuis le pointage : {elapsed}
          </div>
        )}

        {timeRecordingsLoading ? (
          <div>Chargement des pointages...</div>
        ) : timeRecordingsError ? (
          <div className="text-red-500">{timeRecordingsError}</div>
        ) : (
          <div>
            {timeRecordings.length === 0 ? (
              <div className="text-gray-500">Aucun pointage enregistré.</div>
            ) : (
              timeRecordings.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {record.type === "Arrival" ? "Arrivée" : "Départ"}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
