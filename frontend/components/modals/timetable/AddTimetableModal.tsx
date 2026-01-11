/**
 * AddTimetableModal Component
 *
 * Modal for creating a new timetable with shift start and end times
 * - Validates time format (HH:MM)
 * - Validates that end time is after start time
 * - Uses TimePicker component for time selection
 * - Integrates with useErrorHandler and form validation utilities
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler to close the modal
 * @param {Function} props.onSubmit - Handler for form submission
 */

"use client";

import { useState } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";
import { TimePicker } from "@/components/UI/TimePicker";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { validateTimeFormat, validateTimeRange } from "@/lib/utils/validation";
import { VALIDATION_ERRORS } from "@/lib/types/errorMessages";

interface AddTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { Shift_start: string; Shift_end: string }) => Promise<void>;
}

export function AddTimetableModal({ isOpen, onClose, onSubmit }: AddTimetableModalProps) {
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  /**
   * Validates the timetable form data
   */
  function validate(): boolean {
    clearError();

    // Validate start time format
    const startValidation = validateTimeFormat(shiftStart);
    if (!startValidation.valid) {
      setError(startValidation.error ?? VALIDATION_ERRORS.INVALID_TIME_FORMAT);
      return false;
    }

    // Validate end time format
    const endValidation = validateTimeFormat(shiftEnd);
    if (!endValidation.valid) {
      setError(endValidation.error ?? VALIDATION_ERRORS.INVALID_TIME_FORMAT);
      return false;
    }

    // Validate time range
    const rangeValidation = validateTimeRange(shiftStart, shiftEnd);
    if (!rangeValidation.valid) {
      setError(rangeValidation.error ?? VALIDATION_ERRORS.TIME_RANGE_INVALID);
      return false;
    }

    return true;
  }

  /**
   * Handles form submission
   */
  async function handleSubmit() {
    if (!validate()) return;

    setIsSubmitting(true);
    clearError();

    try {
      await onSubmit({
        Shift_start: shiftStart,
        Shift_end: shiftEnd,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'horaire.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Resets form and closes modal
   */
  function handleClose() {
    if (!isSubmitting) {
      setShiftStart("09:00");
      setShiftEnd("17:00");
      clearError();
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ajouter un horaire">
      <div className="space-y-4">
        {/* Shift start time */}
        <div>
          <Label htmlFor="shift-start">Heure de début</Label>
          <TimePicker
            id="shift-start"
            value={shiftStart}
            onChange={setShiftStart}
            disabled={isSubmitting}
          />
        </div>

        {/* Shift end time */}
        <div>
          <Label htmlFor="shift-end">Heure de fin</Label>
          <TimePicker
            id="shift-end"
            value={shiftEnd}
            onChange={setShiftEnd}
            disabled={isSubmitting}
          />
        </div>

        {/* Preview */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aperçu de l'horaire :</p>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {shiftStart} - {shiftEnd}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center w-full gap-4 pt-4">
          {error ? (
            <div className="flex-1">
              <ErrorDisplay error={error} variant="inline" />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
