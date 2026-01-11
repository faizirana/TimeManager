/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddUserModal } from "@/components/modals/user/AddUserModal";

describe("AddUserModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when closed", () => {
      render(<AddUserModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.queryByText("Ajouter un utilisateur")).not.toBeInTheDocument();
    });

    it("should render when open", () => {
      render(<AddUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Ajouter un utilisateur")).toBeInTheDocument();
      expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
      expect(screen.getByLabelText("Nom")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Rôle")).toBeInTheDocument();
      expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
      expect(screen.getByLabelText("Numéro de mobile")).toBeInTheDocument();
    });

    it("should render all role options", () => {
      render(<AddUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Manager")).toBeInTheDocument();
      expect(screen.getByText("Employé")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {});

  describe("Form Submission", () => {
    it("should submit valid form data", async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(<AddUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText("Prénom"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Nom"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Rôle"), {
        target: { value: "employee" },
      });
      fireEvent.change(screen.getByLabelText("Mot de passe"), {
        target: { value: "Password123!" },
      });
      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0612345678" },
      });

      const submitButton = screen.getByRole("button", {
        name: /créer l'utilisateur/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "John",
          surname: "Doe",
          email: "john@example.com",
          role: "employee",
          password: "Password123!",
          mobileNumber: "+33612345678",
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle submission error", async () => {
      const errorMessage = "Failed to create user";
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));

      render(<AddUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText("Prénom"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Nom"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Rôle"), {
        target: { value: "employee" },
      });
      fireEvent.change(screen.getByLabelText("Mot de passe"), {
        target: { value: "Password123!" },
      });
      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0612345678" },
      });

      const submitButton = screen.getByRole("button", {
        name: /créer l'utilisateur/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when cancel button is clicked", () => {
      render(<AddUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const cancelButton = screen.getByRole("button", { name: /annuler/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
