/**
 * Modal for adding a new team
 */

"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/Label";
import { Select } from "@/components/UI/Select";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getTimetables, createTimetable } from "@/lib/services/timetable/timetableService";
import { Timetable } from "@/lib/types/timetable";
import { getUsers } from "@/lib/services/users/usersService";
import { User } from "@/lib/types/teams";
import { AddTimetableModal } from "@/components/timetable/AddTimetableModal";
import { Plus } from "lucide-react";

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: {
    name: string;
    id_manager: number;
    id_timetable: number;
    memberIds?: number[];
  }) => Promise<void>;
}

export function AddTeamModal({ isOpen, onClose, onSubmit }: AddTeamModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch timetables and users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTimetables();
      fetchUsers();
    }
  }, [isOpen]);

  const fetchTimetables = async () => {
    try {
      setLoadingTimetables(true);
      const data = await getTimetables();
      // Remove duplicates based on ID
      const uniqueTimetables = data.filter(
        (timetable, index, self) => index === self.findIndex((t) => t.id === timetable.id),
      );
      setTimetables(uniqueTimetables);
    } catch (err) {
      console.error("Failed to fetch timetables:", err);
    } finally {
      setLoadingTimetables(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      // Filter out current user from the list (manager will be auto-added)
      const filteredUsers = data.filter((u) => u.id !== user?.id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom de l'équipe est requis");
      return;
    }

    if (!user?.id) {
      setError("Utilisateur non connecté");
      return;
    }

    if (!selectedTimetableId) {
      setError("Vous devez sélectionner un horaire");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        id_manager: user.id,
        id_timetable: selectedTimetableId,
        memberIds: selectedMemberIds,
      });

      // Reset form
      setName("");
      setSelectedTimetableId(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'équipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setSelectedTimetableId(null);
      setSelectedMemberIds([]);
      setError(null);
      onClose();
    }
  };

  const handleCreateTimetable = async (timetableData: {
    Shift_start: string;
    Shift_end: string;
  }) => {
    const newTimetable = await createTimetable(timetableData);
    setTimetables((prev) => [...prev, newTimetable]);
    setSelectedTimetableId(newTimetable.id);
  };

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une nouvelle équipe"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer l'équipe"}
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
          <Label htmlFor="team-name" variant="static">
            Nom de l'équipe
          </Label>
          <Input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Administration"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-name" variant="static">
            Manager
          </Label>
          <Input
            id="manager-name"
            type="text"
            value={user ? `${user.name} ${user.surname} (Me l'assigner)` : ""}
            disabled
            className="opacity-75"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="timetable-select" variant="static">
              Horaire
            </Label>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={16} />}
              iconPosition="left"
              onClick={() => setIsTimetableModalOpen(true)}
              type="button"
              disabled={isSubmitting}
            >
              Nouveau
            </Button>
          </div>
          <Select
            id="timetable-select"
            value={selectedTimetableId ?? ""}
            onChange={(e) => setSelectedTimetableId(e.target.value ? Number(e.target.value) : null)}
            disabled={isSubmitting || loadingTimetables}
            required
          >
            <option value="" disabled>
              Sélectionner un horaire
            </option>
            {timetables.map((timetable) => (
              <option key={timetable.id} value={timetable.id}>
                {timetable.Shift_start} - {timetable.Shift_end}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label variant="static">Membres (optionnel)</Label>
          <p className="text-xs text-[var(--muted-foreground)]">
            Le manager sera automatiquement ajouté à l'équipe
          </p>
          <div className="max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg p-3 space-y-2">
            {loadingUsers ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Chargement des utilisateurs...
              </p>
            ) : users.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucun utilisateur disponible</p>
            ) : (
              users.map((userItem) => (
                <label
                  key={userItem.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(userItem.id)}
                    onChange={() => toggleMember(userItem.id)}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {userItem.name} {userItem.surname}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {userItem.email} • {userItem.role}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          {selectedMemberIds.length > 0 && (
            <p className="text-xs text-[var(--color-primary)]">
              {selectedMemberIds.length} membre(s) sélectionné(s)
            </p>
          )}
        </div>
      </form>

      {/* Add Timetable Modal */}
      <AddTimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        onSubmit={handleCreateTimetable}
      />
    </Modal>
  );
}
