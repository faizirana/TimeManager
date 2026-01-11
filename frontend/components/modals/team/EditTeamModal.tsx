/**
 * EditTeamModal Component
 *
 * Modal for editing an existing team's name, timetable, and members.
 * Manager cannot be changed through this interface.
 *
 * **Features:**
 * - Edit team name
 * - Change team timetable
 * - Edit team members (multi-select checkboxes)
 * - View current manager (read-only)
 * - Inline timetable creation option
 * - Uses useTimetables and useUsers hooks for data management
 *
 * **Validation:**
 * - Team name is required
 * - Timetable selection is required
 * - Members selection is optional
 *
 * **Restrictions:**
 * - Manager is displayed but cannot be modified
 * - Current user (manager) is filtered from member selection list
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Team | null} props.team - Team object to edit, or null
 * @param {Function} props.onSubmit - Callback with updated team data
 * @param {string} props.onSubmit.name - Updated team name
 * @param {number} props.onSubmit.id_timetable - Updated timetable ID
 * @param {number[]} [props.onSubmit.memberIds] - Optional array of member user IDs
 *
 * @example
 * ```tsx
 * <EditTeamModal
 *   isOpen={editModal.isOpen}
 *   onClose={editModal.close}
 *   team={selectedTeam}
 *   onSubmit={async (teamData) => {
 *     await updateTeam(selectedTeam.id, teamData);
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
import { useTimetables } from "@/lib/hooks/useTimetables";
import { useUsers } from "@/lib/hooks/useUsers";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { VALIDATION_ERRORS, API_ERRORS } from "@/lib/types/errorMessages";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Team } from "@/lib/types/teams";
import { AddTimetableModal } from "@/components/modals/timetable/AddTimetableModal";
import { Plus } from "lucide-react";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSubmit: (teamData: {
    name: string;
    id_timetable: number;
    memberIds?: number[];
  }) => Promise<void>;
}

export function EditTeamModal({ isOpen, onClose, team, onSubmit }: EditTeamModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const { timetables, loading: loadingTimetables, createNewTimetable } = useTimetables();
  const { users: allUsers, loading: loadingUsers } = useUsers();
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  // Filter out current user from the list (manager will be auto-added)
  const users = allUsers.filter((u) => u.id !== user?.id);

  // Initialize form with team data when modal opens or team changes
  useEffect(() => {
    if (isOpen && team) {
      setName(team.name);
      setSelectedTimetableId(team.id_timetable);
      // Initialize selected members with current team members
      const currentMemberIds = team.members?.map((m) => m.id) ?? [];
      setSelectedMemberIds(currentMemberIds);
      clearError();
    }
  }, [isOpen, team, clearError]);

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name.trim()) {
      setError(VALIDATION_ERRORS.TEAM_NAME_REQUIRED);
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
        id_timetable: selectedTimetableId,
        memberIds: selectedMemberIds,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : API_ERRORS.UPDATE_TEAM_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier l'équipe"
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
            {isSubmitting ? "Modification..." : "Enregistrer"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="edit-team-name" variant="static">
            Nom de l'équipe
          </Label>
          <Input
            id="edit-team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Administration"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-manager-name" variant="static">
            Manager
          </Label>
          <Input
            id="edit-manager-name"
            type="text"
            value={team.manager ? `${team.manager.name} ${team.manager.surname}` : ""}
            disabled
            className="opacity-75"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Le manager ne peut pas être modifié depuis cette fenêtre
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-timetable-select" variant="static">
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
            id="edit-timetable-select"
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
          <Label variant="static">Membres</Label>
          <p className="text-xs text-[var(--muted-foreground)]">
            Le manager est déjà présent dans l'équipe et ne peut pas être retiré.
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
