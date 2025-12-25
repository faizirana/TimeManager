"use client";

import { useRouter } from "next/navigation";
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

interface Team {
  id: number;
  name: string;
  icon: string;
  shift: string;
  members: number;
}

// Données de test
const mockTeams: Team[] = [
  { id: 1, name: "Administration", icon: "🏢", shift: "8:00 - 16:00", members: 12 },
  { id: 2, name: "IT", icon: "💻", shift: "9:00 - 17:00", members: 23 },
  { id: 3, name: "R&D", icon: "🔬", shift: "7:00 - 15:00", members: 9 },
  { id: 4, name: "Maintenance", icon: "🔧", shift: "19:00 - 4:00", members: 11 },
  { id: 5, name: "Security", icon: "🔒", shift: "21:00 - 7:00", members: 28 },
  { id: 6, name: "HR", icon: "🔑", shift: "10:00 - 15:00", members: 6 },
];

export default function TeamsPage() {
  const router = useRouter();
  const { data: teams, sortColumn, sortDirection, handleSort } = useTableSort(mockTeams);

  const handleTeamClick = (teamId: number) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Teams</h1>
        <div className="flex-1"></div>
        <Button className="w-auto bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
          Add new <Plus size={18} strokeWidth={3} />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
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
            {teams.map((team) => (
              <TableRow key={team.id} onClick={() => handleTeamClick(team.id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{team.icon}</span>
                    <span className="font-medium text-gray-900">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell>{team.shift}</TableCell>
                <TableCell>{team.members}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
