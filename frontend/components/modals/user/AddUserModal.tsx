/**
 * AddUserModal Component
 *
 * Modal for creating a new user in the admin area.
 * Features strict validation and international mobile phone formatting (E.164).
 *
 * **Validation Rules:**
 * - All fields are required (name, surname, email, role, password, mobile)
 * - Email: Standard format (user@domain.com)
 * - Mobile: 10 digits (format: 0601020304)
 * - Password: Min 8 chars, 1 uppercase, 1 digit, 1 special character
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
 * @param {string} props.onSubmit.name - User's first name
 * @param {string} props.onSubmit.surname - User's last name
 * @param {string} props.onSubmit.email - User's email address
 * @param {string} props.onSubmit.role - User's role (admin/manager/employee)
 * @param {string} props.onSubmit.password - User's password
 * @param {string} props.onSubmit.mobileNumber - E.164 formatted mobile number
 *
 * @example
 * ```tsx
 * <AddUserModal
 *   isOpen={addModal.isOpen}
 *   onClose={addModal.close}
 *   onSubmit={async (userData) => {
 *     await createUser(userData);
 *     await refetchUsers();
 *   }}
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
import { validateEmail, validateMobile, validatePassword } from "@/lib/utils/validation";
import { VALIDATION_ERRORS, API_ERRORS } from "@/lib/types/errorMessages";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    surname: string;
    email: string;
    role: string;
    password: string;
    mobileNumber: string;
  }) => Promise<void>;
}

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  // Controlled state for each form field
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, setError, clearError } = useErrorHandler();

  // Auto-clear errors when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [name, surname, email, role, password, mobileNumber]);

  /**
   * Validates all user form fields using validation utilities
   * @returns {boolean} true if valid, false otherwise
   */
  const validate = () => {
    if (
      !name.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !role.trim() ||
      !password.trim() ||
      !mobileNumber.trim()
    ) {
      setError(VALIDATION_ERRORS.ALL_FIELDS_REQUIRED);
      return false;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error ?? VALIDATION_ERRORS.INVALID_EMAIL);
      return false;
    }

    const mobileValidation = validateMobile(mobileNumber);
    if (!mobileValidation.valid) {
      setError(mobileValidation.error ?? VALIDATION_ERRORS.INVALID_MOBILE);
      return false;
    }

    if (!["admin", "manager", "employee"].includes(role)) {
      setError(VALIDATION_ERRORS.INVALID_ROLE);
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error ?? VALIDATION_ERRORS.WEAK_PASSWORD);
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
        password,
        mobileNumber: mobileNumber.trim(),
      });
      setName("");
      setSurname("");
      setEmail("");
      setRole("");
      setPassword("");
      setMobileNumber("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : API_ERRORS.CREATE_USER_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resets the form and closes the modal
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setSurname("");
      setEmail("");
      setRole("");
      setPassword("");
      clearError();
      setMobileNumber("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ajouter un utilisateur"
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
            {isSubmitting ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="user-name" variant="static">
            Prénom
          </Label>
          <Input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alice"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-surname" variant="static">
            Nom
          </Label>
          <Input
            id="user-surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Ex: Martin"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email" variant="static">
            Email
          </Label>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: alice@email.com"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role" variant="static">
            Rôle
          </Label>
          <Select
            id="user-role"
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
          <Label htmlFor="user-mobile" variant="static">
            Numéro de mobile
          </Label>
          <Input
            id="user-mobile"
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Ex: 0601020304"
            disabled={isSubmitting}
            required
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-password" variant="static">
            Mot de passe
          </Label>
          <Input
            id="user-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            disabled={isSubmitting}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
