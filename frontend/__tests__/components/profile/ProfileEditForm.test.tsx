import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { UserProfile } from "@/lib/types/user";

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

const mockProfile: UserProfile = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john.doe@example.com",
  mobileNumber: "0612345678",
  role: "employee",
  id_manager: 2,
};

const mockProfileWithoutPhone: UserProfile = {
  id: 1,
  name: "Jane",
  surname: "Smith",
  email: "jane.smith@example.com",
  mobileNumber: undefined,
  role: "manager",
  id_manager: null,
};

describe("ProfileEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with all form fields", () => {
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Annuler/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Enregistrer/i })).toBeInTheDocument();
    });

    it("should populate form fields with profile data", () => {
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Prénom/i)).toHaveValue("John");
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toHaveValue("john.doe@example.com");
      expect(screen.getByLabelText(/Téléphone/i)).toHaveValue("0612345678");
    });

    it("should handle profile with undefined mobileNumber", () => {
      render(
        <ProfileEditForm
          profile={mockProfileWithoutPhone}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByLabelText(/Prénom/i)).toHaveValue("Jane");
      expect(screen.getByLabelText(/Téléphone/i)).toHaveValue("");
    });

    it("should display read-only role field", () => {
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const roleInput = screen.getByDisplayValue("Employee");
      expect(roleInput).toBeDisabled();
    });

    it("should display read-only manager ID when present", () => {
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const managerInput = screen.getByDisplayValue("2");
      expect(managerInput).toBeDisabled();
    });
  });

  describe("Form Validation - Required Fields", () => {
    it("should show error when name is empty", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/Prénom/i);
      await user.clear(nameInput);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(await screen.findByText("Le prénom est requis")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should show error when surname is empty", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const surnameInput = screen.getByDisplayValue("Doe");
      await user.clear(surnameInput);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(await screen.findByText("Le nom est requis")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should show error when email is empty", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const emailInput = screen.getByLabelText(/Email/i);
      await user.clear(emailInput);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(await screen.findByText("L'email est requis")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const emailInput = screen.getByLabelText(/Email/i);
      await user.clear(emailInput);
      await user.type(emailInput, "invalid@email"); // No TLD (.com, .fr, etc)

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      // Check that onSave was not called due to validation error
      expect(mockOnSave).not.toHaveBeenCalled();

      // Verify error message is displayed
      expect(screen.getByText("Format d'email invalide")).toBeInTheDocument();
    });
  });

  describe("Form Validation - Optional Phone Number", () => {
    it("should allow empty mobile number (optional field)", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const phoneInput = screen.getByLabelText(/Téléphone/i);
      await user.clear(phoneInput);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      expect(screen.queryByText(/téléphone est requis/i)).not.toBeInTheDocument();
    });

    it("should show error for invalid phone format when provided", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const phoneInput = screen.getByLabelText(/Téléphone/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, "123"); // Too short

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(await screen.findByText("Le numéro doit contenir 10 chiffres")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should accept valid 10-digit phone number", async () => {
      const user = userEvent.setup();
      render(
        <ProfileEditForm
          profile={mockProfileWithoutPhone}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const phoneInput = screen.getByLabelText(/Téléphone/i);
      await user.type(phoneInput, "0612345678");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      expect(screen.queryByText(/numéro doit contenir 10 chiffres/i)).not.toBeInTheDocument();
    });

    it("should reject phone number with letters", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const phoneInput = screen.getByLabelText(/Téléphone/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, "06abc12345");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(await screen.findByText("Le numéro doit contenir 10 chiffres")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe("Password Validation", () => {
    it("should not require password for profile update", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Password fields should be empty and not cause errors
      expect(screen.getByLabelText(/Nouveau mot de passe/i)).toHaveValue("");
    });

    it("should validate password format when provided", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
      await user.type(passwordInput, "weak"); // No uppercase, no digit, too short

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      const errorMessages = await screen.findAllByText(
        /Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre/i,
      );
      // Should find both the error message and the hint text
      expect(errorMessages.length).toBeGreaterThan(0);
      // Verify the error message (red text) is present
      const errorMessage = errorMessages.find((el) => el.className.includes("text-red-500"));
      expect(errorMessage).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should require password confirmation to match", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
      const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);

      await user.type(passwordInput, "Password123!");
      await user.type(confirmInput, "Different123!");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(
        await screen.findByText(/Les mots de passe ne correspondent pas/i),
      ).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should accept valid password with confirmation", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
      const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);

      await user.type(passwordInput, "Password123!");
      await user.type(confirmInput, "Password123!");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            password: "Password123!",
          }),
        );
      });
    });
  });

  describe("Form Submission", () => {
    it("should call onSave with form data on valid submission", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: "John",
          surname: "Doe",
          email: "john.doe@example.com",
          mobileNumber: "0612345678",
        });
      });
    });

    it("should include password in update data when provided", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
      const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);

      await user.type(passwordInput, "NewPassword123!");
      await user.type(confirmInput, "NewPassword123!");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            password: "NewPassword123!",
          }),
        );
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      expect(screen.getByRole("button", { name: /Enregistrement.../i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Enregistrement.../i })).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it("should handle submission error gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockOnSave.mockRejectedValue(new Error("Update failed"));

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Enregistrer/i })).not.toBeDisabled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Cancel Functionality", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole("button", { name: /Annuler/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should disable cancel button during submission", async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      const cancelButton = screen.getByRole("button", { name: /Annuler/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Field Updates", () => {
    it("should update form fields on user input", async () => {
      const user = userEvent.setup();
      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/Prénom/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Jane");

      expect(nameInput).toHaveValue("Jane");
    });

    it("should update only changed fields", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/Prénom/i);
      await user.clear(nameInput);
      await user.type(nameInput, "UpdatedName");

      const submitButton = screen.getByRole("button", { name: /Enregistrer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "UpdatedName",
            surname: "Doe",
            email: "john.doe@example.com",
            mobileNumber: "0612345678",
          }),
        );
      });
    });
  });
});
