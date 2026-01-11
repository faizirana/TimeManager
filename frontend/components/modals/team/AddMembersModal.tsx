/**
 * AddMembersModal Component
 *
 * Modal for adding new members to an existing team.
 * Displays available users (excluding current team members) in a multi-select list.
 *
 * **Features:**
 * - Multi-select checkboxes for user selection
 * - Filters out users already in the team
 * - Shows user name, email, and role for each option
 * - Live counter of selected members
 * - Uses useUsers hook for automatic user fetching
 *
 * **Validation:**
 * - At least one member must be selected
 * - Empty state shown if all users are already team members
 *
 * **Performance:**
 * - Uses useMemo to filter available users efficiently
 * - Prevents unnecessary re-renders on user list changes
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSubmit - Callback with array of selected user IDs
 * @param {number[]} props.currentMemberIds - IDs of users already in the team
 *
 * @example
 * ```tsx
 * <AddMembersModal
 *   isOpen={addMembersModal.isOpen}
 *   onClose={addMembersModal.close}
 *   onSubmit={async (memberIds) => {
 *     await addTeamMembers(teamId, memberIds);
 *     await refetchTeamMembers();
 *   }}
 *   currentMemberIds={team.members.map(m => m.id)}
 * />
 * ```
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";
import { useUsers } from "@/lib/hooks/useUsers";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberIds: number[]) => Promise<void>;
  currentMemberIds: number[];
}

export function AddMembersModal({
  isOpen,
  onClose,
  onSubmit,
  currentMemberIds,
}: AddMembersModalProps) {
  const { users: allUsers, loading: loadingUsers } = useUsers();
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  // Filter out users who are already in the team
  const availableUsers = useMemo(
    () => allUsers.filter((u) => !currentMemberIds.includes(u.id)),
    [allUsers, currentMemberIds],
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedMemberIds([]);
      clearError();
    }
  }, [isOpen, clearError]);

  // Auto-clear errors when user selects members
  useEffect(() => {
    if (error && selectedMemberIds.length > 0) {
      clearError();
    }
  }, [selectedMemberIds]);

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (selectedMemberIds.length === 0) {
      setError("Veuillez sélectionner au moins un membre");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(selectedMemberIds);
      setSelectedMemberIds([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout des membres");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter des membres"
      footer={
        <div className="flex items-center w-full gap-4">
          {error ? (
            <div className="flex-1">
              <ErrorDisplay error={error} variant="inline" />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedMemberIds.length === 0}>
            {isSubmitting
              ? "Ajout..."
              : `Ajouter ${selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ""}`}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label variant="static">Sélectionnez les membres à ajouter</Label>

          <div className="max-h-96 overflow-y-auto border border-[var(--border)] rounded-lg p-3 space-y-2">
            {loadingUsers ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Chargement des utilisateurs...
              </p>
            ) : availableUsers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Tous les utilisateurs sont déjà membres de cette équipe
                </p>
              </div>
            ) : (
              availableUsers.map((userItem) => (
                <label
                  key={userItem.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer transition-colors border border-transparent hover:border-[var(--border)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(userItem.id)}
                    onChange={() => toggleMember(userItem.id)}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {userItem.name} {userItem.surname}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {userItem.email} • {userItem.role}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>

          {selectedMemberIds.length > 0 && (
            <p className="text-sm text-[var(--color-primary)] font-medium">
              {selectedMemberIds.length} membre{selectedMemberIds.length > 1 ? "s" : ""} sélectionné
              {selectedMemberIds.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
