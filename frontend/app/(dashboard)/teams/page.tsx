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
} from "lucide-react";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { compareShifts } from "@/lib/utils/sortHelpers";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import { getTeams } from "@/lib/services/teams/teamsService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { TableSkeleton } from "@/components/UI/TableSkeleton";
import Toast from "@/components/UI/Toast";

interface TeamDisplay {
  id: number;
  name: string;
  shift: string;
  members: number;
}

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<TeamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: sortedTeams, sortColumn, sortDirection, handleSort } = useTableSort(teams);

  // Fetch teams on component mount
  useEffect(() => {
    // Wait for auth to load before fetching teams
    if (authLoading) return;

    // Redirect if not authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchTeams() {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        const teamsData = await getTeams(user.id);

        // Transform API data to display format
        const displayTeams: TeamDisplay[] = await Promise.all(
          teamsData.map(async (team) => {
            let shift = "No shift assigned";

            // Fetch timetable if team has one
            if (team.id_timetable) {
              try {
                const timetable = await getTimetableById(team.id_timetable);
                shift = `${timetable.Shift_start} - ${timetable.Shift_end}`;
              } catch (_e) {
                shift = "Shift unavailable";
              }
            }

            return {
              id: team.id,
              name: team.name,
              shift,
              members: team.members.length,
            };
          }),
        );

        setTeams(displayTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, [authLoading, user, router]);

  const handleTeamClick = (teamId: number) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
