import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTimetableModal } from "@/components/modals/timetable/AddTimetableModal";

describe("AddTimetableModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render modal when open", () => {
    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText("Ajouter un horaire")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(<AddTimetableModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.queryByText("Ajouter un horaire")).not.toBeInTheDocument();
  });

  it("should submit successfully with valid times", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("should display error message on submission failure", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce(new Error("Creation failed"));

    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creation failed")).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Création...")).toBeInTheDocument();
    });

    resolveSubmit!();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle non-Error exceptions during submission", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce("String error");

    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Erreur lors de la création de l'horaire.")).toBeInTheDocument();
    });
  });

  it("should close modal after successful submission", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<AddTimetableModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
