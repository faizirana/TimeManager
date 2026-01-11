/**
 * TeamsPage Component
 *
 * User's team management dashboard.
 * Displays teams where the current user is a manager or member.
 *
 * **Features:**
 * - View all user's teams with details (name, manager, timetable, member count)
 * - Create new teams (if user has management permissions)
 * - Edit existing teams (if user is the manager)
 * - Navigate to team detail pages
 * - Sort by name, shift, or member count
 * - Role-based action visibility
 *
 * **Access Control:**
 * - All authenticated users can view their teams
 * - Only managers and admins can create teams
 * - Only team managers can edit their teams
 * - Permissions checked via canManageTeams utility
 *
 * **State Management:**
 * - useTeams: Fetches teams for current user, provides CRUD operations
 * - useModal: Controls AddTeamModal and EditTeamModal visibility
 * - useErrorHandler: Centralized error state management
 * - useTableSort: Handles multi-field sorting
 * - useAuth: Provides current user context
 *
 * **Team Display:**
 * - Team name and manager information
 * - Timetable shift times (e.g., "09:00 - 17:00")
 * - Member count with icon
 * - Edit button for team managers
 * - Click row to navigate to team details
 *
 * **Sorting:**
 * - Name: Alphabetical A-Z / Z-A
 * - Shift: By timetable times (custom compareShifts)
 * - Members: By member count ascending/descending
 *
 * @component
 * @returns {JSX.Element} The teams dashboard page
 *
 * @example
 * // Accessed via /teams route
 * // Shows only teams where user is manager or member
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/UI/Button";
import { useModal } from "@/lib/hooks/useModal";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";
import { LoadingState } from "@/components/UI/LoadingState";
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
import { AddTeamModal } from "@/components/modals/team/AddTeamModal";
import { EditTeamModal } from "@/components/modals/team/EditTeamModal";
import { Team } from "@/lib/types/teams";
import { canManageTeams } from "@/lib/utils/permissions";

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
  const { error, setError, handleError } = useErrorHandler();
  const addModal = useModal();
  const editModal = useModal();
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
      handleError(err);
      throw err;
    }
  };

  const handleEditTeam = async (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      const team = await getTeamById(teamId);
      setTeamToEdit(team);
      editModal.open();
    } catch (err) {
      handleError(err);
    }
  };

  const handleUpdateTeam = async (teamData: { name: string; id_timetable: number }) => {
    if (!teamToEdit) return;

    try {
      await updateExistingTeam(teamToEdit.id, teamData);
      editModal.close();
      setTeamToEdit(null);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
        <div className="flex-1"></div>
        {canManageTeams(user?.role) && (
          <Button
            variant="primary"
            icon={<Plus size={18} strokeWidth={3} />}
            onClick={addModal.open}
          >
            Nouvelle équipe
          </Button>
        )}
      </div>

      {/* Error Display */}
      <ErrorDisplay error={error} variant="toast" onDismiss={() => setError(null)} />

      {/* Add Team Modal */}
      <AddTeamModal isOpen={addModal.isOpen} onClose={addModal.close} onSubmit={handleCreateTeam} />

      {/* Edit Team Modal */}
      <EditTeamModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.close();
          setTeamToEdit(null);
        }}
        team={teamToEdit}
        onSubmit={handleUpdateTeam}
      />

      {/* Table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        <LoadingState isLoading={loading}>
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
                  Horaires
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
                  Membres
                </TableHead>
                {canManageTeams(user?.role) && <TableHead className="w-24">Actions</TableHead>}
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
                  {canManageTeams(user?.role) && (
                    <TableCell>
                      <button
                        onClick={(e) => handleEditTeam(team.id, e)}
                        className="p-2 rounded-md text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/10 dark:hover:bg-[var(--color-primary)]/20 transition-colors"
                        aria-label="Modifier l'équipe"
                      >
                        <Pencil size={18} />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </LoadingState>
      </div>
    </div>
  );
}
