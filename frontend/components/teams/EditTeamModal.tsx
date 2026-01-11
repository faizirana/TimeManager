/**
 * Modal for editing an existing team
 */

"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/Label";
import { Select } from "@/components/UI/Select";
import { getTimetables, createTimetable } from "@/lib/services/timetable/timetableService";
import { Timetable } from "@/lib/types/timetable";
import { Team } from "@/lib/types/teams";
import { AddTimetableModal } from "@/components/timetable/AddTimetableModal";
import { Plus } from "lucide-react";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSubmit: (teamData: { name: string; id_timetable: number }) => Promise<void>;
}

export function EditTeamModal({ isOpen, onClose, team, onSubmit }: EditTeamModalProps) {
  const [name, setName] = useState("");
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with team data when modal opens or team changes
  useEffect(() => {
    if (isOpen && team) {
      setName(team.name);
      setSelectedTimetableId(team.id_timetable ?? null);
      fetchTimetables();
    }
  }, [isOpen, team]);

  const fetchTimetables = async () => {
    try {
      setLoadingTimetables(true);
      const data = await getTimetables();
      // Remove duplicates based on ID
      const uniqueTimetables = data.filter(
        (timetable, index, self) => index === self.findIndex((t) => t.id === timetable.id),
      );
      setTimetables(uniqueTimetables);
    } finally {
      setLoadingTimetables(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom de l'équipe est requis");
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
        id_timetable: selectedTimetableId,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification de l'équipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier l'équipe"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Modification..." : "Enregistrer"}
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
