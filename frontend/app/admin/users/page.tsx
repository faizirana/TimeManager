"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useTablePagination } from "@/lib/hooks/useTablePagination";
import { useTableSearch } from "@/lib/hooks/useTableSearch";
import { useUsers } from "@/lib/hooks/useUsers";
import { useModal } from "@/lib/hooks/useModal";
import { useToast } from "@/lib/hooks/useToast";
import { isAdmin } from "@/lib/utils/permissions";
import { Button } from "@/components/UI/Button";
import { Avatar } from "@/components/UI/Avatar";
import { RoleBadge } from "@/components/UI/RoleBadge";
import Toast from "@/components/UI/Toast";
import { LoadingState } from "@/components/UI/LoadingState";
import { TablePagination } from "@/components/UI/TablePagination";
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowDown01,
  ArrowUp10,
  Search,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import type { User } from "@/lib/types/teams";
import { AddUserModal } from "@/components/modals/user/AddUserModal";
import { EditUserModal } from "@/components/modals/user/EditUserModal";
import { DeleteUserModal } from "@/components/modals/user/DeleteUserModal";
import { SUCCESS_MESSAGES, RESOURCES } from "@/lib/types/errorMessages";

/**
 * AdminUsersPage Component
 *
 * Admin-only page for comprehensive user management.
 * Provides a complete CRUD interface for managing system users.
 *
 * **Features:**
 * - View all users in a sortable, searchable, paginated table
 * - Create new users with AddUserModal
 * - Delete existing users with confirmation
 * - Real-time search across name, surname, email, role
 * - Sort by name (A-Z / Z-A)
 * - Pagination with 10 users per page
 * - Loading states and error handling
 *
 * **Access Control:**
 * - Protected route: requires admin role
 * - Non-admin users are redirected to home page
 * - Authentication state managed by useProtectedRoute hook
 *
 * **State Management:**
 * - useUsers: Manages user data and CRUD operations
 * - useModal: Controls AddUserModal and DeleteUserModal visibility
 * - useErrorHandler: Centralized error state management
 * - useTableSort: Handles column sorting logic
 * - useTablePagination: Manages pagination state
 * - useTableSearch: Debounced search with 300ms delay
 *
 * **User Actions:**
 * - Add User: Opens modal with validation (email, mobile, password, role)
 * - Delete User: Opens confirmation modal, then removes user from system
 * - Search: Filters users by name, surname, email, or role
 * - Sort: Toggle ascending/descending name order
 * - Paginate: Navigate through user pages
 *
 * @component
 * @returns {JSX.Element} The admin users management page
 *
 * @example
 * // Accessed via /admin/users route
 * // Only visible to users with role === 'admin'
 */
export default function AdminUsersPage() {
  // Get current user and loading state from protected route hook
  const { user, loading: authLoading } = useProtectedRoute();
  const router = useRouter();

  // Custom hooks for state management
  const {
    users,
    loading,
    error: fetchError,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
  } = useUsers();
  const { toast, showSuccess, showError, clearToast } = useToast();
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // User selected for editing or deletion
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Search hook with 300ms debouncing
  const { searchQuery, setSearchQuery, filteredData } = useTableSearch<User>(
    users,
    ["name", "surname", "email"],
    300,
  );

  // Table sorting hook
  const {
    data: sortedUsers,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTableSort<User>(filteredData);

  // Pagination hook for sorted users
  const { page, totalPages, start, end, nextPage, prevPage, goToPage } = useTablePagination(
    sortedUsers.length,
    10,
  );

  // Memoize paginated users to avoid recalculating on every render
  const paginatedUsers = useMemo(() => sortedUsers.slice(start, end), [sortedUsers, start, end]);

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
   * Handles user creation
   */
  const handleCreateUser = useCallback(
    async (userData: {
      name: string;
      surname: string;
      email: string;
      role: string;
      password: string;
      mobileNumber: string;
    }) => {
      try {
        await createNewUser(userData);
        addModal.close();
        showSuccess(SUCCESS_MESSAGES.CREATED("Utilisateur"));
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur",
        );
      }
    },
    [createNewUser, addModal, showSuccess, showError],
  );

  /**
   * Handles user update
   */
  const handleUpdateUser = useCallback(
    async (userData: {
      name: string;
      surname: string;
      email: string;
      role: string;
      mobileNumber: string;
    }) => {
      if (!userToEdit) return;
      try {
        await updateExistingUser(userToEdit.id, userData);
        editModal.close();
        setUserToEdit(null);
        showSuccess(SUCCESS_MESSAGES.UPDATED("Utilisateur"));
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'utilisateur",
        );
      }
    },
    [userToEdit, updateExistingUser, editModal, showSuccess, showError],
  );

  /**
   * Handles user deletion
   */
  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteExistingUser(userToDelete.id);
      deleteModal.close();
      setUserToDelete(null);
      showSuccess(SUCCESS_MESSAGES.DELETED("Utilisateur"));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }, [userToDelete, deleteExistingUser, deleteModal, showSuccess, showError]);

  /**
   * Opens edit modal for specific user
   */
  const openEditModal = useCallback(
    (selectedUser: User) => {
      setUserToEdit(selectedUser);
      editModal.open();
    },
    [editModal],
  );

  /**
   * Opens delete modal for specific user
   */
  const openDeleteModal = useCallback(
    (selectedUser: User) => {
      setUserToDelete(selectedUser);
      deleteModal.open();
    },
    [deleteModal],
  );

  /**
   * Closes edit modal and clears selected user
   */
  function closeEditModal() {
    editModal.close();
    setUserToEdit(null);
  }

  /**
   * Closes delete modal and clears selected user
   */
  function closeDeleteModal() {
    deleteModal.close();
    setUserToDelete(null);
  }

  return (
    <div className="flex-1 p-8">
      {/* Page header with navigation and add user button */}
      <div className="flex items-center gap-4 mb-8">
        {/* Back to admin dashboard */}
        <h1
          onClick={() => router.push("/admin")}
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
        >
          Admin
        </h1>
        <ChevronRight size={36} className="text-gray-900 dark:text-gray-100" />
        {/* Current page title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Utilisateurs</h1>
        <div className="flex-1"></div>
        {/* Add user button opens modal */}
        <Button variant="primary" icon={<Plus size={18} strokeWidth={3} />} onClick={addModal.open}>
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Modal for adding a new user */}
      <AddUserModal isOpen={addModal.isOpen} onClose={addModal.close} onSubmit={handleCreateUser} />

      {/* Modal for editing an existing user */}
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateUser}
        user={userToEdit}
      />

      {/* Modal for confirming user deletion */}
      <DeleteUserModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        user={userToDelete}
      />

      {/* Toast notifications */}
      {toast && <Toast {...toast} onClose={clearToast} />}

      {/* Users table section */}
      <div className="bg-[var(--background-2)] rounded-lg shadow">
        {/* Search input for filtering users */}
        <div className="p-4 flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Search users"
            />
          </div>
        </div>

        {/* Loading state with default spinner */}
        <LoadingState isLoading={loading}>
          {/* Main users table with sorting and actions */}
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
                {/* Sortable name column */}
                <TableHead
                  className="w-1/3"
                  sortable
                  sortDirection={sortColumn === "name" ? sortDirection : null}
                  onSort={() => handleSort("name")}
                  sortIcons={{ asc: ArrowDownAZ, desc: ArrowUpZA }}
                >
                  Nom
                </TableHead>
                {/* Sortable email column */}
                <TableHead
                  className="w-1/3"
                  sortable
                  sortDirection={sortColumn === "email" ? sortDirection : null}
                  onSort={() => handleSort("email")}
                  sortIcons={{ asc: ArrowDownAZ, desc: ArrowUpZA }}
                >
                  Email
                </TableHead>
                {/* Sortable role column */}
                <TableHead
                  className="w-1/3"
                  sortable
                  sortDirection={sortColumn === "role" ? sortDirection : null}
                  onSort={() => handleSort("role")}
                  sortIcons={{ asc: ArrowDownAZ, desc: ArrowUpZA }}
                >
                  Rôle
                </TableHead>
                {/* Actions column */}
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Render each user row */}
              {paginatedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-gray-700 dark:text-gray-300">{u.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* User avatar and name */}
                      <Avatar name={u.name} surname={u.surname} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {u.name} {u.surname}
                      </span>
                    </div>
                  </TableCell>
                  {/* User email */}
                  <TableCell className="text-gray-700 dark:text-gray-300">{u.email}</TableCell>
                  {/* User role badge */}
                  <TableCell>
                    <RoleBadge>{u.role}</RoleBadge>
                  </TableCell>
                  {/* Action buttons: edit and delete */}
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Edit button opens edit modal */}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openEditModal(u)}
                        icon={<Pencil size={16} />}
                        iconPosition="right"
                      >
                        Modifier
                      </Button>
                      {/* Delete button opens confirmation modal */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteModal(u)}
                        icon={<Trash2 size={16} />}
                        iconPosition="right"
                        disabled={user && u.id === user.id}
                        title={
                          user && u.id === user.id
                            ? "Vous ne pouvez pas vous supprimer vous-même."
                            : undefined
                        }
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination controls below the table */}
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
            startItem={start + 1}
            endItem={Math.min(end, sortedUsers.length)}
            totalItems={sortedUsers.length}
          />
        </LoadingState>
      </div>
    </div>
  );
}
