/**
 * EditUserModal Component
 *
 * Modal for editing an existing user in the admin area.
 * Features strict validation and international mobile phone formatting (E.164).
 * Password field is optional - only updated if provided.
 *
 * **Validation Rules:**
 * - All fields except password are required (name, surname, email, role, mobile)
 * - Email: Standard format (user@domain.com)
 * - Mobile: 10 digits (format: 0601020304)
 * - Role: Must be admin, manager, or employee
 *
 * **Mobile Phone Handling:**
 * - User inputs mobile number directly (0601020304)
 * - Stored as-is in the database
 *
 * **Error Handling:**
 * - Uses useErrorHandler hook for centralized error state
 * - Displays errors using ErrorDisplay component
 * - Validation errors shown in modal footer
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSubmit - Callback with user data on successful validation
 * @param {Object|null} props.user - User to edit
 *
 * @example
 * ```tsx
 * <EditUserModal
 *   isOpen={editModal.isOpen}
 *   onClose={editModal.close}
 *   onSubmit={async (userData) => {
 *     await updateUser(selectedUser.id, userData);
 *     await refetchUsers();
 *   }}
 *   user={selectedUser}
 * />
 * ```
 */

import { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { Label } from "@/components/UI/Label";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { validateEmail, validateMobile } from "@/lib/utils/validation";
import { API_ERRORS } from "@/lib/types/errorMessages";
import type { User } from "@/lib/types/teams";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    surname: string;
    email: string;
    role: string;
    mobileNumber: string;
  }) => Promise<void>;
  user: User | null;
}

export function EditUserModal({ isOpen, onClose, onSubmit, user }: EditUserModalProps) {
  // Controlled state for each form field
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  // Initialize form fields when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setSurname(user.surname);
      setEmail(user.email);
      setRole(user.role);
      setMobileNumber(user.mobileNumber);

      // Clear any existing errors when loading a new user
      clearError();
    }
  }, [user, clearError]);

  /**
   * Validates all user form fields using validation utilities
   * @returns {boolean} true if valid, false otherwise
   */
  const validate = () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !role.trim() || !mobileNumber.trim()) {
      setError("Tous les champs sont requis.");
      return false;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error ?? "Email invalide");
      return false;
    }

    const mobileValidation = validateMobile(mobileNumber);
    if (!mobileValidation.valid) {
      setError(mobileValidation.error ?? "Mobile invalide");
      return false;
    }

    if (!["admin", "manager", "employee"].includes(role)) {
      setError("Le rôle doit être admin, manager ou employé.");
      return false;
    }

    return true;
  };

  /**
   * Handles user form submission
   * - Removes leading 0 from mobile (all countries)
   * - Concatenates country code + mobile (E.164)
   * - Displays errors on failure
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        role: role.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : API_ERRORS.UPDATE_USER_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resets the form and closes the modal
   */
  const handleClose = () => {
    if (!isSubmitting) {
      clearError();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier l'utilisateur"
      footer={
        <div className="flex items-center w-full gap-4">
          {error ? (
            <div className="flex-1">
              <ErrorDisplay error={error} variant="inline" />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Modification..." : "Enregistrer"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="edit-user-name" variant="static">
            Prénom
          </Label>
          <Input
            id="edit-user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alice"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-surname" variant="static">
            Nom
          </Label>
          <Input
            id="edit-user-surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Ex: Martin"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-email" variant="static">
            Email
          </Label>
          <Input
            id="edit-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: alice@email.com"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-role" variant="static">
            Rôle
          </Label>
          <Select
            id="edit-user-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="" disabled>
              Sélectionner un rôle
            </option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employé</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-mobile" variant="static">
            Numéro de mobile
          </Label>
          <Input
            id="edit-user-mobile"
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Ex: 0601020304"
            disabled={isSubmitting}
            required
            maxLength={10}
          />
        </div>
      </form>
    </Modal>
  );
}
