/**
 * DeleteTimetableModal Component
 *
 * Confirmation modal for deleting a timetable from the system (admin only).
 * Displays a warning message with timetable details and requires confirmation.
 * This is an irreversible action.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onConfirm - Callback to confirm timetable deletion
 * @param {Object | null} props.timetable - Timetable object to delete, or null
 * @param {number} props.timetable.id - Timetable ID
 * @param {string} props.timetable.shift - Timetable shift display (e.g., "09:00 - 17:00")
 *
 * @example
 * ```tsx
 * <DeleteTimetableModal
 *   isOpen={deleteModal.isOpen}
 *   onClose={deleteModal.close}
 *   onConfirm={handleDeleteTimetable}
 *   timetable={selectedTimetable}
 * />
 * ```
 */

import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { AlertTriangle } from "lucide-react";

interface DeleteTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  timetable: {
    id: number;
    shift: string;
  } | null;
}

export function DeleteTimetableModal({
  isOpen,
  onClose,
  onConfirm,
  timetable,
}: DeleteTimetableModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer l'horaire"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="text-red-600 dark:text-red-500 flex-shrink-0" size={24} />
          <p className="text-sm text-red-900 dark:text-red-200">Cette action est irréversible</p>
        </div>
        {timetable && (
          <p className="text-[var(--foreground)] dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer l'horaire <strong>{timetable.shift}</strong> ?
          </p>
        )}
      </div>
    </Modal>
  );
}
