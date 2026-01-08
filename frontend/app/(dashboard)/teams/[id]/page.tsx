"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useTeamDetails } from "@/lib/hooks/useTeamDetails";
import { useTeamMembers } from "@/lib/hooks/useTeamMembers";
import { Button } from "@/components/UI/Button";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { RoleBadge } from "@/components/UI/RoleBadge";
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
import { TableSkeleton } from "@/components/UI/TableSkeleton";
import Toast from "@/components/UI/Toast";
import { DeleteMemberModal } from "@/components/teams/DeleteMemberModal";
import { AddMembersModal } from "@/components/teams/AddMembersModal";
import { Member } from "@/lib/types/teams";
import { canRemoveMember, getMemberFullName } from "@/lib/utils/teamTransformers";

// Mapping of situation types to their icons
const situationIcons: Record<Member["situation"]["type"], LucideIcon> = {
  onsite: MapPin,
  telework: Computer,
};

const statusLabels = {
  inProgress: "En cours",
  onPause: "On pause",
  late: "Late",
  planned: "Planned",
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: sortedMembers, sortColumn, sortDirection, handleSort } = useTableSort(members);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Sync errors from hooks
  useEffect(() => {
    if (detailsError) setError(detailsError);
    if (membersError) setError(membersError);
  }, [detailsError, membersError]);

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
      setError("Impossible de supprimer le manager de l'équipe");
      return;
    }

    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeMember(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la suppression du membre");
    }
  };

  const handleAddMembers = async (memberIds: number[]) => {
    try {
      await addMembers(memberIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'ajout des membres");
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
        <Button
          variant="primary"
          icon={<Plus size={18} strokeWidth={3} />}
          onClick={() => setIsAddMembersModalOpen(true)}
        >
          Ajouter des membres
        </Button>
      </div>

      {/* Error Toast */}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Loading state */}
        {loading && <TableSkeleton rows={8} columns={4} />}

        {/* Members table */}
        {!loading && (
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
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} surname={member.surname} />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {member.name} {member.surname}
                        </span>
                        {member.isManager && <RoleBadge>Manager</RoleBadge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 dark:text-gray-300">
                      {(() => {
                        const Icon = situationIcons[member.situation.type];
                        return <Icon size={16} className="text-gray-600 dark:text-gray-400" />;
                      })()}
                      <span>{member.situation.type === "onsite" ? "Sur Site" : "Télétravail"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={member.status}>{statusLabels[member.status]}</StatusBadge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{teamShift}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Member Modal */}
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmRemoveMember}
        memberName={memberToDelete ? getMemberFullName(memberToDelete) : ""}
      />

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        onSubmit={handleAddMembers}
        currentMemberIds={members.map((m) => m.id)}
      />
    </div>
  );
}
