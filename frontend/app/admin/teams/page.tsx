/**
 * AdminTeamsPage component
 *
 * Admin page for managing all teams in the system
 * - Protected route: only accessible by admin users
 * - Displays teams with sorting, search, and pagination
 * - Allows creating and editing teams via modals
 * - Integrates with useTeams hook for CRUD operations
 *
 * @returns {JSX.Element} The admin teams management page
 */

"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTeams } from "@/lib/hooks/useTeams";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useTablePagination } from "@/lib/hooks/useTablePagination";
import { useTableSearch } from "@/lib/hooks/useTableSearch";
import { useModal } from "@/lib/hooks/useModal";
import { useToast } from "@/lib/hooks/useToast";
import { isAdmin } from "@/lib/utils/permissions";
import { Button } from "@/components/UI/Button";
import Toast from "@/components/UI/Toast";
import { LoadingState } from "@/components/UI/LoadingState";
import { TablePagination } from "@/components/UI/TablePagination";
import {
  ChevronRight,
  Plus,
  Pencil,
  ArrowDownAZ,
  ArrowUpZA,
  ClockArrowDown,
  ClockArrowUp,
  ArrowDown01,
  ArrowUp10,
  Search,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import { AddTeamModal } from "@/components/modals/team/AddTeamModal";
import { EditTeamModal } from "@/components/modals/team/EditTeamModal";
import { DeleteTeamModal } from "@/components/modals/team/DeleteTeamModal";
import type { Team, TeamDisplay } from "@/lib/types/teams";
import { getTeamById } from "@/lib/services/teams/teamsService";
import { SUCCESS_MESSAGES, API_ERRORS } from "@/lib/types/errorMessages";

export default function AdminTeamsPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const router = useRouter();

  // Teams hook for data and CRUD operations
  const {
    teams,
    loading,
    error: fetchError,
    createNewTeam,
    updateExistingTeam,
    deleteTeamById,
  } = useTeams();

  // Error handler
  const { toast, showSuccess, showError, clearToast } = useToast();

  // Modal states
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<{ id: number; name: string } | null>(null);

  // Search hook with debouncing (using TeamDisplay type)
  const { searchQuery, setSearchQuery, filteredData } = useTableSearch<TeamDisplay>(
    teams,
    ["name", "shift", "managerName"],
    300,
  );

  // Table sorting
  const {
    data: sortedTeams,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTableSort<TeamDisplay>(filteredData);

  // Pagination
  const { page, totalPages, start, end, nextPage, prevPage, goToPage } = useTablePagination(
    sortedTeams.length,
    10,
  );
  const paginatedTeams = sortedTeams.slice(start, end);

  // Set error from fetch hook
  useEffect(() => {
    if (fetchError) {
      showError(fetchError);
    }
  }, [fetchError, showError]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin(user.role))) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [authLoading, user, router]);

  // Show empty page while loading or if not admin
  if (authLoading || !user || !isAdmin(user.role)) {
    return <div className="flex-1 p-8" />;
  }

  /**
   * Handles team creation
   */
  async function handleCreateTeam(teamData: {
    name: string;
    id_manager: number;
    id_timetable: number;
  }) {
    try {
      await createNewTeam({
        ...teamData,
        memberIds: [],
      });
      addModal.close();
      showSuccess(SUCCESS_MESSAGES.CREATED("Équipe"));
    } catch (err) {
      showError(err instanceof Error ? err.message : API_ERRORS.CREATE_TEAM_FAILED);
    }
  }

  /**
   * Handles team update
   */
  async function handleUpdateTeam(teamData: { name: string; id_timetable: number }) {
    if (!teamToEdit) return;
    try {
      await updateExistingTeam(teamToEdit.id, teamData);
      editModal.close();
      setTeamToEdit(null);
      showSuccess(SUCCESS_MESSAGES.UPDATED("Équipe"));
    } catch (err) {
      showError(err instanceof Error ? err.message : API_ERRORS.UPDATE_TEAM_FAILED);
    }
  }

  /**
   * Opens edit modal for specific team
   * Fetches full team data including manager and timetable
   */
  async function openEditModal(teamDisplay: TeamDisplay) {
    try {
      const fullTeam = await getTeamById(teamDisplay.id);
      setTeamToEdit(fullTeam);
      editModal.open();
    } catch (err) {
      showError(err instanceof Error ? err.message : API_ERRORS.FETCH_FAILED(teamDisplay.name));
    }
  }

  /**
   * Closes edit modal and clears selected team
   */
  function closeEditModal() {
    editModal.close();
    setTeamToEdit(null);
  }

  /**
   * Opens delete modal for specific team
   */
  function openDeleteModal(team: TeamDisplay) {
    setSelectedTeam({ id: team.id, name: team.name });
    deleteModal.open();
  }

  /**
   * Handles team deletion
   */
  async function handleDeleteTeam() {
    if (!selectedTeam) return;
    try {
      await deleteTeamById(selectedTeam.id);
      deleteModal.close();
      setSelectedTeam(null);
      showSuccess(SUCCESS_MESSAGES.DELETED("Équipe"));
    } catch (err) {
      showError(err instanceof Error ? err.message : API_ERRORS.DELETE_FAILED(selectedTeam.name));
    }
  }

  return (
    <div className="flex-1 p-8">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <h1
          onClick={() => router.push("/admin")}
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
        >
          Admin
        </h1>
        <ChevronRight size={36} className="text-gray-900 dark:text-gray-100" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Équipes</h1>
        <div className="flex-1"></div>
        <Button variant="primary" icon={<Plus size={18} strokeWidth={3} />} onClick={addModal.open}>
          Ajouter une équipe
        </Button>
      </div>

      {/* Modals */}
      <AddTeamModal isOpen={addModal.isOpen} onClose={addModal.close} onSubmit={handleCreateTeam} />

      <EditTeamModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateTeam}
        team={teamToEdit}
      />

      <DeleteTeamModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteTeam}
        team={selectedTeam}
      />

      {/* Toast notifications */}
      {toast && <Toast {...toast} onClose={clearToast} />}

      {/* Teams table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Search input */}
        <div className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom d'équipe, manager ou horaire..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Search teams"
            />
          </div>
        </div>

        <LoadingState isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-auto"
                  sortable
                  sortDirection={sortColumn === "id" ? sortDirection : null}
                  onSort={() => handleSort("id")}
                  sortIcons={{ asc: ArrowDown01, desc: ArrowUp10 }}
                >
                  ID
                </TableHead>
                <TableHead
                  className="w-full"
                  sortable
                  sortDirection={sortColumn === "name" ? sortDirection : null}
                  onSort={() => handleSort("name")}
                  sortIcons={{ asc: ArrowDownAZ, desc: ArrowUpZA }}
                >
                  Nom de l'équipe
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "managerName" ? sortDirection : null}
                  onSort={() => handleSort("managerName")}
                  sortIcons={{ asc: ArrowDownAZ, desc: ArrowUpZA }}
                >
                  Manager
                </TableHead>
                <TableHead
                  className="w-auto"
                  sortable
                  sortDirection={sortColumn === "members" ? sortDirection : null}
                  onSort={() => handleSort("members")}
                  sortIcons={{ asc: ArrowDown01, desc: ArrowUp10 }}
                >
                  Membres
                </TableHead>
                <TableHead
                  className="w-auto whitespace-nowrap text-right"
                  sortable
                  sortDirection={sortColumn === "shift" ? sortDirection : null}
                  onSort={() => handleSort("shift")}
                  sortIcons={{ asc: ClockArrowDown, desc: ClockArrowUp }}
                >
                  Horaire
                </TableHead>
                <TableHead className="w-64 whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeams.map((teamDisplay) => (
                <TableRow key={teamDisplay.id}>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {teamDisplay.id}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {teamDisplay.name}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {teamDisplay.managerName}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {teamDisplay.members}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {teamDisplay.shift ?? "Non défini"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openEditModal(teamDisplay)}
                        icon={<Pencil size={16} />}
                        iconPosition="right"
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteModal(teamDisplay)}
                        icon={<Trash2 size={16} />}
                        iconPosition="left"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
            startItem={start + 1}
            endItem={Math.min(end, sortedTeams.length)}
            totalItems={sortedTeams.length}
          />
        </LoadingState>
      </div>
    </div>
  );
}
