/**
 * DeleteUserModal Component
 *
 * Confirmation modal for deleting a user from the system (admin only).
 * Displays a warning message with user details and requires confirmation.
 * This is an irreversible action.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onConfirm - Callback to confirm user deletion
 * @param {User | null} props.user - User object to delete, or null
 *
 * @example
 * ```tsx
 * <DeleteUserModal
 *   isOpen={deleteModal.isOpen}
 *   onClose={deleteModal.close}
 *   onConfirm={handleDeleteUser}
 *   user={selectedUser}
 * />
 * ```
 */

import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { AlertTriangle } from "lucide-react";
import type { User } from "@/lib/types/teams";

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer l'utilisateur"
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
        {user && (
          <p className="text-[var(--foreground)] dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer{" "}
            <strong>
              {user.name} {user.surname}
            </strong>{" "}
            ({user.email}) ?
          </p>
        )}
      </div>
    </Modal>
  );
}
