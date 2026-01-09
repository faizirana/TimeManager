/**
 * Modal for adding a new timetable
 */

"use client";

import { useState } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { TimePicker } from "@/components/UI/TimePicker";
import { Label } from "@/components/UI/Label";

interface AddTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (timetableData: { Shift_start: string; Shift_end: string }) => Promise<void>;
}

export function AddTimetableModal({ isOpen, onClose, onSubmit }: AddTimetableModalProps) {
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shiftStart || !shiftEnd) {
      setError("Les heures de début et de fin sont requises");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        Shift_start: shiftStart,
        Shift_end: shiftEnd,
      });

      // Reset form
      setShiftStart("");
      setShiftEnd("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'horaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShiftStart("");
      setShiftEnd("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un nouvel horaire"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer l'horaire"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="shift-start" variant="static">
            Heure de début
          </Label>
          <TimePicker
            id="shift-start"
            value={shiftStart}
            onChange={setShiftStart}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift-end" variant="static">
            Heure de fin
          </Label>
          <TimePicker
            id="shift-end"
            value={shiftEnd}
            onChange={setShiftEnd}
            disabled={isSubmitting}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
