/**
 * Modal for confirming team member removal
 */

"use client";

import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { AlertTriangle } from "lucide-react";

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
  isLoading?: boolean;
}

export function DeleteMemberModal({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isLoading = false,
}: DeleteMemberModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Retirer un membre"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
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

        <p className="text-[var(--foreground)] dark:text-gray-300">
          Êtes-vous sûr de vouloir retirer <strong>{memberName}</strong> de l&apos;équipe ?
        </p>
      </div>
    </Modal>
  );
}
