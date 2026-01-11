/**
 * TeamDetailPage Component
 *
 * Detailed view of a specific team and its members.
 * Displays team information, member list with status, and management actions.
 *
 * **Features:**
 * - View team details (name, manager, timetable)
 * - View all team members with status and situation
 * - Add new members to the team (managers only)
 * - Remove members from the team (managers only)
 * - Sort members by name, role, status, or situation
 * - Real-time status badges (Présent, Absent, En congé)
 * - Situation icons (Sur site, Télétravail)
 *
 * **Access Control:**
 * - All authenticated users can view team details
 * - Only team managers can add/remove members
 * - Managers cannot remove themselves
 * - Permission checks via canManageTeams and canRemoveMember
 *
 * **State Management:**
 * - useTeamDetails: Fetches team information
 * - useTeamMembers: Manages member list and CRUD operations
 * - useModal: Controls AddMembersModal and DeleteMemberModal visibility
 * - useErrorHandler: Centralized error state management
 * - useTableSort: Handles multi-field member sorting
 * - useAuth: Provides current user context for permissions
 *
 * **Member Information:**
 * - Avatar and full name
 * - Role badge (Admin, Manager, Employee)
 * - Status badge (Présent, Absent, En congé)
 * - Situation (Sur site with MapPin icon, Télétravail with Computer icon)
 * - Remove button (managers only, not for self)
 *
 * **Sorting:**
 * - Name: Alphabetical A-Z / Z-A
 * - Role: Admin > Manager > Employee
 * - Status: Present > Absent > On leave (custom handleSituationSort)
 * - Situation: Onsite > Telework
 *
 * **Navigation:**
 * - Breadcrumb trail: Équipes > [Team Name]
 * - Back to teams list via breadcrumb link
 *
 * @component
 * @returns {JSX.Element} The team detail page
 *
 * @example
 * // Accessed via /teams/[id] route
 * // Example: /teams/5 shows details for team with ID 5
 * // Members can view, managers can add/remove members
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useModal } from "@/lib/hooks/useModal";
import { useToast } from "@/lib/hooks/useToast";
import { useTableSearch } from "@/lib/hooks/useTableSearch";
import { useTablePagination } from "@/lib/hooks/useTablePagination";
import {
  LucideIcon,
  ChevronRight,
  Plus,
  ArrowDownAZ,
  ArrowUpZA,
  ClockArrowDown,
  ClockArrowUp,
  MapPin,
  Computer,
  Trash2,
  Search,
} from "lucide-react";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useTeamDetails } from "@/lib/hooks/useTeamDetails";
import { useTeamMembers } from "@/lib/hooks/useTeamMembers";
import { Button } from "@/components/UI/Button";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { RoleBadge } from "@/components/UI/RoleBadge";
import Toast from "@/components/UI/Toast";
import { LoadingState } from "@/components/UI/LoadingState";
import { TablePagination } from "@/components/UI/TablePagination";
import { compareShifts } from "@/lib/utils/sortHelpers";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Avatar } from "@/components/UI/Avatar";
import { DeleteMemberModal } from "@/components/modals/team/DeleteMemberModal";
import { AddMembersModal } from "@/components/modals/team/AddMembersModal";
import { Member } from "@/lib/types/teams";
import { canRemoveMember, getMemberFullName } from "@/lib/utils/teamTransformers";
import { ClockStatusIndicator } from "@/components/UI/ClockStatusIndicator";
import { getElapsedTime } from "@/lib/services/statusCalculator";
import { canManageTeams } from "@/lib/utils/permissions";
import { SUCCESS_MESSAGES } from "@/lib/types/errorMessages";

// Mapping of situation types to their icons
const situationIcons: Record<Member["situation"]["type"], LucideIcon> = {
  onsite: MapPin,
  absent: Computer,
};

const statusLabels: Record<Member["status"], string> = {
  inProgress: "En cours",
  onPause: "On pause",
  late: "En retard",
  planned: "Planifié",
};

export default function TeamMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const teamId = parseInt(params.id as string);

  // Custom hooks for data management
  const {
    teamName,
    teamShift,
    managerId,
    loading: detailsLoading,
    error: detailsError,
  } = useTeamDetails(teamId);
  const {
    members,
    loading: membersLoading,
    error: membersError,
    addMembers,
    removeMember,
  } = useTeamMembers(teamId, managerId, teamShift);

  // UI state
  const deleteModal = useModal();
  const addMembersModal = useModal();
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const { toast, showSuccess, showError, clearToast } = useToast();

  // Search hook with debouncing
  const { searchQuery, setSearchQuery, filteredData } = useTableSearch(
    members,
    ["name", "surname"],
    300,
  );

  // Table sorting
  const { data: sortedMembers, sortColumn, sortDirection, handleSort } = useTableSort(filteredData);

  // Pagination
  const { page, totalPages, start, end, nextPage, prevPage, goToPage } = useTablePagination(
    sortedMembers.length,
    10,
  );
  const paginatedMembers = sortedMembers.slice(start, end);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Sync errors from hooks
  useEffect(() => {
    if (detailsError) showError(detailsError);
    if (membersError) showError(membersError);
  }, [detailsError, membersError, showError]);

  const loading = detailsLoading || membersLoading;

  // Custom comparison function for situation column
  const handleSituationSort = () => {
    handleSort("situation", (a, b) => {
      return a.situation.type.localeCompare(b.situation.type);
    });
  };

  const handleRemoveMember = (memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    // Don't allow removing the manager
    if (!canRemoveMember(member)) {
      showError("Impossible de supprimer le manager de l'équipe");
      return;
    }

    setMemberToDelete(member);
    deleteModal.open();
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeMember(memberToDelete.id);
      setMemberToDelete(null);
      showSuccess(SUCCESS_MESSAGES.REMOVED("Membre"));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erreur lors de la suppression du membre");
    }
  };

  const handleAddMembers = async (memberIds: number[]) => {
    try {
      await addMembers(memberIds);
      showSuccess(SUCCESS_MESSAGES.ADDED(memberIds.length > 1 ? "Membres" : "Membre"));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erreur lors de l'ajout des membres");
      throw err;
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1
          onClick={() => router.push("/teams")}
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
        >
          Teams
        </h1>
        <ChevronRight size={36} className="text-gray-900 dark:text-gray-100" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {teamName || "Loading..."}
        </h1>
        <div className="flex-1"></div>
        {canManageTeams(user?.role) && (
          <Button
            variant="primary"
            icon={<Plus size={18} strokeWidth={3} />}
            onClick={addMembersModal.open}
          >
            Ajouter des membres
          </Button>
        )}
      </div>

      {/* Toast notifications */}
      {toast && <Toast {...toast} onClose={clearToast} />}

      {/* Table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Search input */}
        <div className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un membre par nom..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Search members"
            />
          </div>
        </div>

        <LoadingState isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "name" ? sortDirection : null}
                  onSort={() => handleSort("name")}
                  sortIcons={{
                    asc: ArrowDownAZ,
                    desc: ArrowUpZA,
                  }}
                >
                  Employee
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "situation" ? sortDirection : null}
                  onSort={handleSituationSort}
                  sortIcons={{
                    asc: ArrowDownAZ,
                    desc: ArrowUpZA,
                  }}
                >
                  Situation
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortColumn === "status" ? sortDirection : null}
                  onSort={() => handleSort("status")}
                  sortIcons={{
                    asc: ArrowDownAZ,
                    desc: ArrowUpZA,
                  }}
                >
                  Status
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
                {canManageTeams(user?.role) && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} surname={member.surname} />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {member.name} {member.surname}
                        </span>
                        {member.isManager && <RoleBadge>Manager</RoleBadge>}
                        {/* Clock status indicator */}
                        <ClockStatusIndicator
                          status={member.clockStatus}
                          elapsedTime={
                            member.lastClockIn
                              ? getElapsedTime(member.lastClockIn.toISOString())
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 dark:text-gray-300">
                      {(() => {
                        const Icon = situationIcons[member.situation.type];
                        return <Icon size={16} className="text-gray-600 dark:text-gray-400" />;
                      })()}
                      <span>{member.situation.type === "onsite" ? "Sur Site" : "Absent"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={member.status}>{statusLabels[member.status]}</StatusBadge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{teamShift}</TableCell>
                  {canManageTeams(user?.role) && (
                    <TableCell>
                      <button
                        onClick={(e) => handleRemoveMember(member.id, e)}
                        disabled={member.isManager}
                        className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Retirer le membre"
                        title={
                          member.isManager
                            ? "Impossible de supprimer le manager"
                            : "Retirer de l'équipe"
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  )}
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
            endItem={Math.min(end, sortedMembers.length)}
            totalItems={sortedMembers.length}
          />
        </LoadingState>
      </div>

      {/* Delete Member Modal */}
      <DeleteMemberModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setMemberToDelete(null);
        }}
        onConfirm={confirmRemoveMember}
        memberName={memberToDelete ? getMemberFullName(memberToDelete) : ""}
      />

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={addMembersModal.isOpen}
        onClose={addMembersModal.close}
        onSubmit={handleAddMembers}
        currentMemberIds={members.map((m) => m.id)}
      />
    </div>
  );
}
