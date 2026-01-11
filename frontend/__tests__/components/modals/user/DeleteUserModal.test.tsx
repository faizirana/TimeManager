import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserModal } from "@/components/modals/user/DeleteUserModal";

const mockUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@test.com",
  role: "user" as const,
  mobileNumber: "+33612345678",
};

describe("DeleteUserModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render modal when open", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );
    expect(screen.getByText("Supprimer l'utilisateur")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(
      <DeleteUserModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );
    expect(screen.queryByText("Supprimer l'utilisateur")).not.toBeInTheDocument();
  });

  it("should display user name and email in confirmation message", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@test.com/i)).toBeInTheDocument();
  });

  it("should display warning message", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );
    expect(screen.getByText("Cette action est irréversible")).toBeInTheDocument();
  });

  it("should call onConfirm when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle null user gracefully", () => {
    render(
      <DeleteUserModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} user={null} />,
    );

    expect(screen.getByText("Supprimer l'utilisateur")).toBeInTheDocument();
    expect(screen.queryByText(/Êtes-vous sûr/i)).not.toBeInTheDocument();
  });

  it("should not call onConfirm or onClose when modal is closed", () => {
    render(
      <DeleteUserModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should display AlertTriangle icon", () => {
    const { container } = render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have destructive button variant for delete action", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    expect(deleteButton).toBeInTheDocument();
  });

  it("should have outline button variant for cancel action", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={mockUser}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    expect(cancelButton).toBeInTheDocument();
  });
});
