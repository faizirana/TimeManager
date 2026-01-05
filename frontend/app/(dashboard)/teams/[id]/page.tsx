"use client";

import { useParams, useRouter } from "next/navigation";
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

interface Member {
  id: number;
  name: string;
  isManager: boolean;
  situation: {
    type: "onsite" | "telework";
  };
  status: "inProgress" | "onPause" | "late" | "planned";
  shift: string;
}

// Mapping of situation types to their labels
const situationLabels: Record<Member["situation"]["type"], string> = {
  onsite: "Sur Site",
  telework: "Télétravail",
};

// Mapping of situation types to their icons
const situationIcons: Record<Member["situation"]["type"], LucideIcon> = {
  onsite: MapPin,
  telework: Computer,
};

// Données de test
const mockMembers: Member[] = [
  {
    id: 1,
    name: "Chloé",
    isManager: false,
    situation: { type: "onsite" },
    status: "inProgress",
    shift: "8:00 - 17:00",
  },
  {
    id: 2,
    name: "Matthieu",
    isManager: true,
    situation: { type: "onsite" },
    status: "inProgress",
    shift: "8:00 - 17:00",
  },
  {
    id: 3,
    name: "Valentin",
    isManager: false,
    situation: { type: "telework" },
    status: "onPause",
    shift: "8:00 - 17:00",
  },
  {
    id: 4,
    name: "Clémence",
    isManager: false,
    situation: { type: "onsite" },
    status: "late",
    shift: "8:00 - 17:00",
  },
  {
    id: 5,
    name: "Hugo",
    isManager: false,
    situation: { type: "telework" },
    status: "planned",
    shift: "8:00 - 17:00",
  },
  {
    id: 6,
    name: "Julien",
    isManager: false,
    situation: { type: "onsite" },
    status: "planned",
    shift: "8:00 - 17:00",
  },
];

const statusLabels = {
  inProgress: "En cours",
  onPause: "On pause",
  late: "Late",
  planned: "Planned",
};

export default function TeamMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { data: members, sortColumn, sortDirection, handleSort } = useTableSort(mockMembers);

  // Get team name (temporary, will be replaced by API)
  const teamName = "IT"; // For example

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
          className="text-4xl font-bold text-gray-900 cursor-pointer hover:underline"
        >
          Teams
        </h1>
        <ChevronRight size={36} className="text-gray-900" />
        <h1 className="text-4xl font-bold text-gray-900">{teamName}</h1>
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
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      {member.isManager && <RoleBadge>Manager</RoleBadge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = situationIcons[member.situation.type];
                      return <Icon size={16} className="text-gray-600" />;
                    })()}
                    <span>{situationLabels[member.situation.type]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={member.status}>{statusLabels[member.status]}</StatusBadge>
                </TableCell>
                <TableCell>{member.shift}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
