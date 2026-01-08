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
} from "lucide-react";
import { useTableSort } from "@/lib/hooks/useTableSort";
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
import { getTeamById } from "@/lib/services/teams/teamsService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";
import { Avatar } from "@/components/UI/Avatar";
import { TableSkeleton } from "@/components/UI/TableSkeleton";
import Toast from "@/components/UI/Toast";

interface Member {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  isManager: boolean;
  situation: {
    type: "onsite" | "telework";
  };
  status: "inProgress" | "onPause" | "late" | "planned";
  shift: string;
}

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
  const [teamName, setTeamName] = useState<string>("");
  const [teamShift, setTeamShift] = useState<string>("No shift assigned");
  const [managerId, setManagerId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: sortedMembers, sortColumn, sortDirection, handleSort } = useTableSort(members);

  // Fetch team data on component mount
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchTeamData() {
      try {
        setLoading(true);
        setError(null);

        const teamId = parseInt(params.id as string);
        const teamData = await getTeamById(teamId);

        setTeamName(teamData.name);
        setManagerId(teamData.id_manager);

        // Fetch timetable for team shift
        let shift = "No shift assigned";
        if (teamData.id_timetable) {
          try {
            const timetable = await getTimetableById(teamData.id_timetable);
            shift = `${timetable.Shift_start} - ${timetable.Shift_end}`;
          } catch (_e) {
            shift = "Shift unavailable";
          }
        }
        setTeamShift(shift);

        // Transform members data (status and situation will be placeholders for now)
        const transformedMembers: Member[] = teamData.members.map((member: any) => ({
          id: member.id,
          name: member.name,
          surname: member.surname,
          email: member.email,
          role: member.role,
          isManager: member.id === teamData.id_manager,
          situation: { type: "onsite" as const }, // Placeholder - will be from timerecording
          status: "planned" as const, // Placeholder - will be from timerecording
          shift,
        }));

        setMembers(transformedMembers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load team data");
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [authLoading, user, router, params.id]);

  // Custom comparison function for situation column
  const handleSituationSort = () => {
    handleSort("situation", (a, b) => {
      // Sort by type (which will be displayed via label)
      return a.situation.type.localeCompare(b.situation.type);
    });
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
        <Button className="w-auto bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
          Add new <Plus size={18} strokeWidth={3} />
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
