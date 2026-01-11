/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditUserModal } from "@/components/modals/user/EditUserModal";

const mockUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@example.com",
  role: "employee",
  mobileNumber: "+33612345678",
};

describe("EditUserModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when closed", () => {
      render(
        <EditUserModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      expect(screen.queryByText("Modifier l'utilisateur")).not.toBeInTheDocument();
    });

    it("should render when open with user data", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      expect(screen.getByText("Modifier l'utilisateur")).toBeInTheDocument();
      expect(screen.getByLabelText("Prénom")).toHaveValue("John");
      expect(screen.getByLabelText("Nom")).toHaveValue("Doe");
      expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
      expect(screen.getByLabelText("Numéro de mobile")).toHaveValue("0612345678");
    });

    it("should not render when user is null", () => {
      render(
        <EditUserModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} user={null} />,
      );

      expect(screen.queryByText("Modifier l'utilisateur")).not.toBeInTheDocument();
    });

    it("should parse phone number correctly", () => {
      const userWithPhone = {
        ...mockUser,
        mobileNumber: "+33601020304",
      };

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={userWithPhone}
        />,
      );

      expect(screen.getByLabelText("Numéro de mobile")).toHaveValue("0601020304");
    });
  });

  describe("Form Validation", () => {
    it("should show error when all fields are empty", async () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Prénom"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText("Nom"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Tous les champs sont requis.")).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error for invalid email", async () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "invalid-email" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("L'email n'est pas valide.")).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error for invalid mobile", async () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "123" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Le numéro de mobile doit comporter 10 chiffres et commencer par 0."),
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("should submit valid updated data", async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Prénom"), {
        target: { value: "Jane" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jane@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0612345678" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "Jane",
          surname: "Doe",
          email: "jane@example.com",
          role: "employee",
          mobileNumber: "+33612345678",
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle submission error", async () => {
      const errorMessage = "Failed to update user";
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0612345678" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to update user/i)).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should disable form during submission", async () => {
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0612345678" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      expect(screen.getByLabelText("Prénom")).toBeDisabled();
      expect(screen.getByLabelText("Nom")).toBeDisabled();
    });

    it("should normalize phone number on submit", async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      fireEvent.change(screen.getByLabelText("Numéro de mobile"), {
        target: { value: "0701020304" },
      });

      const submitButton = screen.getByRole("button", { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mobileNumber: "+33701020304",
          }),
        );
      });
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when cancel button is clicked", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /annuler/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should update form when user prop changes", () => {
      const { rerender } = render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={mockUser}
        />,
      );

      expect(screen.getByLabelText("Prénom")).toHaveValue("John");

      const newUser = {
        ...mockUser,
        id: 2,
        name: "Jane",
        surname: "Smith",
      };

      rerender(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          user={newUser}
        />,
      );

      expect(screen.getByLabelText("Prénom")).toHaveValue("Jane");
      expect(screen.getByLabelText("Nom")).toHaveValue("Smith");
    });
  });
});
