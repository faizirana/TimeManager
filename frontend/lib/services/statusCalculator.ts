/**
 * Status Calculator Service
 *
 * Calcule le statut et la situation d'un membre d'équipe basé sur ses time recordings
 * et l'horaire de son shift.
 */

import { Member } from "@/lib/types/teams";

export interface TimeRecording {
  id: number;
  id_user: number;
  timestamp: string;
  type: "Arrival" | "Departure";
}

interface ShiftTime {
  start: string; // Format: "HH:MM"
  end: string; // Format: "HH:MM"
}

/**
 * Parse un shift au format "HH:MM - HH:MM" en objet ShiftTime
 */
function parseShift(shift: string): ShiftTime | null {
  const match = shift.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  if (!match) return null;
  return { start: match[1], end: match[2] };
}

/**
 * Convertit une string "HH:MM" en minutes depuis minuit
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Calcule la différence en minutes entre deux timestamps
 */
function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60);
}

/**
 * Vérifie si une date est aujourd'hui
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Calcule le statut d'un membre basé sur ses time recordings et son shift
 * Les recordings sont des paires Arrival/Departure
 */
export function calculateMemberStatus(
  timeRecordings: TimeRecording[],
  shift: string,
  currentTime: Date = new Date(),
): Member["status"] {
  // Pas de time recordings = planifié
  if (!timeRecordings?.length) {
    return "planned";
  }

  // Récupérer le dernier time recording
  const lastRecording = timeRecordings[timeRecordings.length - 1];
  const lastTimestamp = new Date(lastRecording.timestamp);

  // Vérifier si le recording est d'aujourd'hui
  if (!isToday(lastTimestamp)) {
    return "planned";
  }

  // Si dernier recording est une Arrival (clock in actif)
  if (lastRecording.type === "Arrival") {
    return "inProgress";
  }

  // Si dernier recording est un Departure (clock out)
  // Vérifier si c'est récent (< 30 min) = pause
  const minutesSinceDeparture = getMinutesDifference(currentTime, lastTimestamp);

  if (minutesSinceDeparture < 30) {
    return "onPause";
  }

  // Parser le shift
  const shiftTime = parseShift(shift);
  if (!shiftTime) {
    return "planned";
  }

  // Vérifier si on est en retard (pas d'Arrival 15 min après début shift)
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const shiftStartMinutes = timeToMinutes(shiftTime.start);

  // Si on est après le début du shift + 15 min et dernier event est Departure
  if (currentMinutes > shiftStartMinutes + 15 && lastRecording.type === "Departure") {
    return "late";
  }

  return "planned";
}

/**
 * Calcule la situation basée sur le statut actuel
 * Si l'utilisateur a clock in (dernier event = Arrival) → onsite
 * Sinon → absent
 */
export function calculateSituation(timeRecordings: TimeRecording[]): Member["situation"] {
  if (!timeRecordings?.length) {
    return { type: "absent" };
  }

  // Vérifier si le dernier recording est une Arrival (= clock in actif)
  const lastRecording = timeRecordings[timeRecordings.length - 1];
  const lastTimestamp = new Date(lastRecording.timestamp);

  // Si c'est aujourd'hui et que c'est une Arrival → sur site
  if (isToday(lastTimestamp) && lastRecording.type === "Arrival") {
    return { type: "onsite" };
  }

  // Sinon → absent
  return { type: "absent" };
}

/**
 * Calcule le temps écoulé depuis un clock in
 */
export function getElapsedTime(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }
  return `${minutes}min`;
}

/**
 * Détermine si un membre a un clock in actif (dernier event = Arrival)
 */
export function hasActiveClockIn(timeRecordings: TimeRecording[]): boolean {
  if (!timeRecordings?.length) return false;

  const lastRecording = timeRecordings[timeRecordings.length - 1];
  const lastTimestamp = new Date(lastRecording.timestamp);

  return lastRecording.type === "Arrival" && isToday(lastTimestamp);
}
