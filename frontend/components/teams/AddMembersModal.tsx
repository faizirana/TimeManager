/**
 * Modal for adding members to an existing team
 */

"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";
import { getUsers } from "@/lib/services/users/usersService";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedMemberIds([]);
      setError(null);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      // Filter out users who are already in the team
      const availableUsers = data.filter((u) => !currentMemberIds.includes(u.id));
      setUsers(availableUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedMemberIds.length === 0}>
            {isSubmitting
              ? "Ajout..."
              : `Ajouter ${selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ""}`}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label variant="static">Sélectionnez les membres à ajouter</Label>

          <div className="max-h-96 overflow-y-auto border border-[var(--border)] rounded-lg p-3 space-y-2">
            {loadingUsers ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Chargement des utilisateurs...
              </p>
            ) : users.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Tous les utilisateurs sont déjà membres de cette équipe
                </p>
              </div>
            ) : (
              users.map((userItem) => (
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
