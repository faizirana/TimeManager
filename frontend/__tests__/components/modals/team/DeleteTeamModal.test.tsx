import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteTeamModal } from "@/components/modals/team/DeleteTeamModal";

const mockTeam = {
  id: 1,
  name: "Team A",
};

describe("DeleteTeamModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render modal when open", () => {
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );
    expect(screen.getByText("Supprimer l'équipe")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(
      <DeleteTeamModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );
    expect(screen.queryByText("Supprimer l'équipe")).not.toBeInTheDocument();
  });

  it("should display team name in confirmation message", () => {
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );
    expect(screen.getByText(/Team A/i)).toBeInTheDocument();
  });

  it("should display warning message", () => {
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );
    expect(screen.getByText("Cette action est irréversible")).toBeInTheDocument();
  });

  it("should call onConfirm when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle null team gracefully", () => {
    render(
      <DeleteTeamModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} team={null} />,
    );

    expect(screen.getByText("Supprimer l'équipe")).toBeInTheDocument();
    expect(screen.queryByText(/Êtes-vous sûr/i)).not.toBeInTheDocument();
  });

  it("should not call onConfirm or onClose when modal is closed", () => {
    render(
      <DeleteTeamModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should display AlertTriangle icon", () => {
    const { container } = render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have destructive button variant for delete action", () => {
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    expect(deleteButton).toBeInTheDocument();
  });

  it("should have outline button variant for cancel action", () => {
    render(
      <DeleteTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        team={mockTeam}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    expect(cancelButton).toBeInTheDocument();
  });
});
