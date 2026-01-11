import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteTimetableModal } from "@/components/modals/timetable/DeleteTimetableModal";

const mockTimetable = {
  id: 1,
  shift: "09:00 - 17:00",
};

describe("DeleteTimetableModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render modal when open", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );
    expect(screen.getByText("Supprimer l'horaire")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(
      <DeleteTimetableModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );
    expect(screen.queryByText("Supprimer l'horaire")).not.toBeInTheDocument();
  });

  it("should display timetable shift in confirmation message", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );
    expect(screen.getByText(/09:00 - 17:00/i)).toBeInTheDocument();
  });

  it("should display warning message", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );
    expect(screen.getByText("Cette action est irréversible")).toBeInTheDocument();
  });

  it("should call onConfirm when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle null timetable gracefully", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={null}
      />,
    );

    expect(screen.getByText("Supprimer l'horaire")).toBeInTheDocument();
    expect(screen.queryByText(/Êtes-vous sûr/i)).not.toBeInTheDocument();
  });

  it("should not call onConfirm or onClose when modal is closed", () => {
    render(
      <DeleteTimetableModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should display AlertTriangle icon", () => {
    const { container } = render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have destructive button variant for delete action", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    expect(deleteButton).toBeInTheDocument();
  });

  it("should have outline button variant for cancel action", () => {
    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={mockTimetable}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    expect(cancelButton).toBeInTheDocument();
  });

  it("should display different shift times correctly", () => {
    const differentTimetable = {
      id: 2,
      shift: "06:00 - 14:00",
    };

    render(
      <DeleteTimetableModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        timetable={differentTimetable}
      />,
    );

    expect(screen.getByText(/06:00 - 14:00/i)).toBeInTheDocument();
  });
});
