/**
 * AdminTimetablesPage Component
 *
 * Admin-only page for managing work shift timetables.
 * Allows creating and viewing timetable schedules used across teams.
 *
 * **Features:**
 * - View all timetables in a sortable, searchable, paginated table
 * - Create new timetables with AddTimetableModal
 * - Search by shift times or computed shift field (e.g., "Matin", "Jour")
 * - Sort by shift start/end times or computed shift field
 * - Pagination with 10 timetables per page
 * - Real-time validation for time ranges
 *
 * **Access Control:**
 * - Protected route: requires admin role
 * - Non-admin users are redirected to home page
 *
 * **State Management:**
 * - useTimetables: Manages timetable data and CRUD operations
 * - useModal: Controls AddTimetableModal visibility
 * - useErrorHandler: Centralized error state management
 * - useTableSort: Handles multi-field sorting (shift times, shift field)
 * - useTablePagination: Manages pagination state
 * - useTableSearch: Debounced search with 300ms delay
 *
 * **Timetable Data:**
 * - Shift_start: Start time (HH:MM format)
 * - Shift_end: End time (HH:MM format)
 * - Computed shift field: Derived from times (Matin, Jour, Soir, Nuit)
 * - Used by teams to define working hours
 *
 * @component
 * @returns {JSX.Element} The admin timetables management page
 *
 * @example
 * // Accessed via /admin/timetables route
 * // Only visible to users with role === 'admin'
 */

"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTimetables } from "@/lib/hooks/useTimetables";
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
  ClockArrowDown,
  ClockArrowUp,
  Clock,
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
import { AddTimetableModal } from "@/components/modals/timetable/AddTimetableModal";
import { DeleteTimetableModal } from "@/components/modals/timetable/DeleteTimetableModal";
import { SUCCESS_MESSAGES, RESOURCES } from "@/lib/types/errorMessages";

export default function AdminTimetablesPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const router = useRouter();

  // Timetables hook for data and CRUD operations
  const {
    timetables,
    loading,
    error: fetchError,
    createNewTimetable,
    deleteTimetableById,
  } = useTimetables();

  // Error handler
  const { toast, showSuccess, showError, clearToast } = useToast();

  // Modal state
  const addModal = useModal();
  const deleteModal = useModal();
  const [selectedTimetable, setSelectedTimetable] = useState<{
    id: number;
    shift: string;
  } | null>(null);

  // Add computed shift display field for search/sort
  const timetablesWithShift = timetables.map((t) => ({
    ...t,
    shift: `${t.Shift_start} - ${t.Shift_end}`,
  }));

  // Search hook with debouncing
  const { searchQuery, setSearchQuery, filteredData } = useTableSearch(
    timetablesWithShift,
    ["shift"],
    300,
  );

  // Table sorting
  const {
    data: sortedTimetables,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTableSort(filteredData);

  // Pagination
  const { page, totalPages, start, end, nextPage, prevPage, goToPage } = useTablePagination(
    sortedTimetables.length,
    10,
  );
  const paginatedTimetables = sortedTimetables.slice(start, end);

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
   * Handles timetable creation
   */
  async function handleCreateTimetable(timetableData: { Shift_start: string; Shift_end: string }) {
    try {
      await createNewTimetable(timetableData);
      addModal.close();
      showSuccess(SUCCESS_MESSAGES.CREATED("Horaire"));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erreur lors de la création de l'horaire");
    }
  }

  /**
   * Opens delete confirmation modal
   */
  function openDeleteModal(timetable: { id: number; shift: string }) {
    setSelectedTimetable(timetable);
    deleteModal.open();
  }

  /**
   * Handles timetable deletion
   */
  async function handleDeleteTimetable() {
    if (!selectedTimetable) return;

    try {
      await deleteTimetableById(selectedTimetable.id);
      deleteModal.close();
      setSelectedTimetable(null);
      showSuccess(SUCCESS_MESSAGES.DELETED("Horaire"));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'horaire");
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Horaires</h1>
        <div className="flex-1"></div>
        <Button variant="primary" icon={<Plus size={18} strokeWidth={3} />} onClick={addModal.open}>
          Ajouter un horaire
        </Button>
      </div>

      {/* Modals */}
      <AddTimetableModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSubmit={handleCreateTimetable}
      />
      <DeleteTimetableModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteTimetable}
        timetable={selectedTimetable}
      />

      {/* Toast notifications */}
      {toast && <Toast {...toast} onClose={clearToast} />}

      {/* Timetables table */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Search input */}
        <div className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un horaire..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Search timetables"
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
                  className="w-1/3"
                  sortable
                  sortDirection={sortColumn === "Shift_start" ? sortDirection : null}
                  onSort={() => handleSort("Shift_start")}
                  sortIcons={{ asc: ClockArrowDown, desc: ClockArrowUp }}
                >
                  Heure de début
                </TableHead>
                <TableHead
                  className="w-1/3"
                  sortable
                  sortDirection={sortColumn === "Shift_end" ? sortDirection : null}
                  onSort={() => handleSort("Shift_end")}
                  sortIcons={{ asc: ClockArrowDown, desc: ClockArrowUp }}
                >
                  Heure de fin
                </TableHead>
                <TableHead className="w-1/3">Horaire complet</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTimetables.map((timetable) => (
                <TableRow key={timetable.id}>
                  <TableCell className="text-gray-700 dark:text-gray-300">{timetable.id}</TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                    {timetable.Shift_start}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                    {timetable.Shift_end}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[var(--color-secondary)] font-medium">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{timetable.shift}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => openDeleteModal(timetable)}
                        aria-label="Supprimer l'horaire"
                      />
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
            endItem={Math.min(end, sortedTimetables.length)}
            totalItems={sortedTimetables.length}
          />
        </LoadingState>
      </div>
    </div>
  );
}
