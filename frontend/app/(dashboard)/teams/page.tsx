"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/UI/Button";
import {
  Plus,
  ArrowDownAZ,
  ArrowUpZA,
  ClockArrowDown,
  ClockArrowUp,
  ArrowDown01,
  ArrowUp10,
  Pencil,
} from "lucide-react";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useTeams } from "@/lib/hooks/useTeams";
import { compareShifts } from "@/lib/utils/sortHelpers";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import { getTeamById } from "@/lib/services/teams/teamsService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { TableSkeleton } from "@/components/UI/TableSkeleton";
import Toast from "@/components/UI/Toast";
import { AddTeamModal } from "@/components/teams/AddTeamModal";
import { EditTeamModal } from "@/components/teams/EditTeamModal";
import { Team } from "@/lib/types/teams";

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    teams,
    loading,
    error: teamsError,
    createNewTeam,
    updateExistingTeam,
  } = useTeams(user?.id);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  const { data: sortedTeams, sortColumn, sortDirection, handleSort } = useTableSort(teams);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Sync errors from hook
  useEffect(() => {
    if (teamsError) setError(teamsError);
  }, [teamsError]);

  const handleTeamClick = (teamId: number) => {
    router.push(`/teams/${teamId}`);
  };

  const handleCreateTeam = async (teamData: {
    name: string;
    id_manager: number;
    id_timetable: number;
    memberIds?: number[];
  }) => {
    try {
      await createNewTeam({
        ...teamData,
        memberIds: teamData.memberIds ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
      throw err;
    }
  };

  const handleEditTeam = async (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      const team = await getTeamById(teamId);
      setTeamToEdit(team);
      setIsEditModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team details");
    }
  };

  const handleUpdateTeam = async (teamData: { name: string; id_timetable: number }) => {
    if (!teamToEdit) return;

    try {
      await updateExistingTeam(teamToEdit.id, teamData);
      setIsEditModalOpen(false);
      setTeamToEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
      throw err;
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
        <div className="flex-1"></div>
        <Button
          variant="primary"
          icon={<Plus size={18} strokeWidth={3} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nouvelle équipe
        </Button>
      </div>

      {/* Error Toast */}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Add Team Modal */}
      <AddTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      {/* Edit Team Modal */}
      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTeamToEdit(null);
        }}
        team={teamToEdit}
        onSubmit={handleUpdateTeam}
      />

      {/* Table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Loading state */}
        {loading && <TableSkeleton rows={6} columns={3} />}

        {/* Teams table */}
        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-1/2"
                  sortable
                  sortDirection={sortColumn === "name" ? sortDirection : null}
                  onSort={() => handleSort("name")}
                  sortIcons={{
                    asc: ArrowDownAZ,
                    desc: ArrowUpZA,
                  }}
                >
                  Name
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "shift" ? sortDirection : null}
                  onSort={() => handleSort("shift", (a, b) => compareShifts(a.shift, b.shift))}
                  sortIcons={{
                    asc: ClockArrowDown,
                    desc: ClockArrowUp,
                  }}
                >
                  Shift
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "members" ? sortDirection : null}
                  onSort={() => handleSort("members")}
                  sortIcons={{
                    asc: ArrowDown01,
                    desc: ArrowUp10,
                  }}
                >
                  Members
                </TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((team) => (
                <TableRow key={team.id} onClick={() => handleTeamClick(team.id)}>
                  <TableCell className="w-1/2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {team.name}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{team.shift}</TableCell>
                  <TableCell className="dark:text-gray-300">{team.members}</TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => handleEditTeam(team.id, e)}
                      className="p-2 rounded-md text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/10 dark:hover:bg-[var(--color-primary)]/20 transition-colors"
                      aria-label="Modifier l'équipe"
                    >
                      <Pencil size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
