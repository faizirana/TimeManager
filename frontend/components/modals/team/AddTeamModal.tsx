/**
 * AddTeamModal Component
 *
 * Modal for creating a new team with the current user as manager.
 * Allows selecting a timetable, optionally creating a new one, and adding initial members.
 *
 * **Features:**
 * - Auto-assigns current user as manager (non-editable)
 * - Timetable selection with inline creation option
 * - Optional member selection (multi-select checkboxes)
 * - Filters out current user from member list (auto-included as manager)
 * - Uses useTimetables and useUsers hooks for data management
 *
 * **Validation:**
 * - Team name is required
 * - Timetable selection is required
 * - Member selection is optional
 *
 * **Data Flow:**
 * - Fetches timetables and users automatically on mount
 * - Creates team with manager ID, timetable ID, and optional member IDs
 * - Supports creating new timetable without closing this modal
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSubmit - Callback with team data on submission
 * @param {string} props.onSubmit.name - Team name
 * @param {number} props.onSubmit.id_manager - Manager's user ID (current user)
 * @param {number} props.onSubmit.id_timetable - Selected timetable ID
 * @param {number[]} [props.onSubmit.memberIds] - Optional array of member user IDs
 *
 * @example
 * ```tsx
 * <AddTeamModal
 *   isOpen={addModal.isOpen}
 *   onClose={addModal.close}
 *   onSubmit={async (teamData) => {
 *     await createTeam(teamData);
 *     await refetchTeams();
 *   }}
 * />
 * ```
 */

"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/Label";
import { Select } from "@/components/UI/Select";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useTimetables } from "@/lib/hooks/useTimetables";
import { useUsers } from "@/lib/hooks/useUsers";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { VALIDATION_ERRORS, API_ERRORS } from "@/lib/types/errorMessages";
import { AddTimetableModal } from "@/components/modals/timetable/AddTimetableModal";
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
  const { timetables, loading: loadingTimetables, createNewTimetable } = useTimetables();
  const { users: allUsers, loading: loadingUsers } = useUsers();
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  // Filter out current user from the list (manager will be auto-added)
  const users = allUsers.filter((u) => u.id !== user?.id);

  // Auto-clear errors when user starts typing or selecting
  useEffect(() => {
    if (error && (name || selectedTimetableId || selectedMemberIds.length > 0)) {
      clearError();
    }
  }, [name, selectedTimetableId, selectedMemberIds]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedTimetableId(null);
      setSelectedMemberIds([]);
      clearError();
    }
  }, [isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name.trim()) {
      setError(VALIDATION_ERRORS.TEAM_REQUIRED);
      return;
    }

    if (!user?.id) {
      setError(VALIDATION_ERRORS.USER_NOT_CONNECTED);
      return;
    }

    if (!selectedTimetableId) {
      setError(VALIDATION_ERRORS.TIMETABLE_REQUIRED);
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
      setSelectedMemberIds([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : API_ERRORS.CREATE_TEAM_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setSelectedTimetableId(null);
      setSelectedMemberIds([]);
      clearError();
      onClose();
    }
  };

  const handleCreateTimetable = async (timetableData: {
    Shift_start: string;
    Shift_end: string;
  }) => {
    const newTimetable = await createNewTimetable(timetableData);
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
        <div className="flex items-center w-full gap-4">
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
            {isSubmitting ? "Création..." : "Créer l'équipe"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
