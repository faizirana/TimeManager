import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTeamModal } from "@/components/modals/team/AddTeamModal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useTimetables } from "@/lib/hooks/useTimetables";
import { useUsers } from "@/lib/hooks/useUsers";

jest.mock("@/lib/contexts/AuthContext");
jest.mock("@/lib/hooks/useTimetables");
jest.mock("@/lib/hooks/useUsers");

const mockUseTimetables = useTimetables as jest.MockedFunction<typeof useTimetables>;
const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockTimetables = [
  { id: 1, Shift_start: "08:00", Shift_end: "12:00" },
  { id: 2, Shift_start: "13:00", Shift_end: "17:00" },
];

const mockUsers = [
  {
    id: 1,
    name: "John",
    surname: "Doe",
    email: "john@test.com",
    role: "user",
    mobileNumber: "+33601020304",
  },
  {
    id: 2,
    name: "Jane",
    surname: "Smith",
    email: "jane@test.com",
    role: "user",
    mobileNumber: "+33605060708",
  },
  {
    id: 3,
    name: "Bob",
    surname: "Manager",
    email: "bob@test.com",
    role: "manager",
    mobileNumber: "+33609080706",
  },
];

describe("AddTeamModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockCreateNewTimetable = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 3, name: "Bob", surname: "Manager", email: "bob@test.com", role: "manager" },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
      accessToken: null,
      refreshAccessToken: function (): Promise<string | null> {
        throw new Error("Function not implemented.");
      },
    });

    mockUseTimetables.mockReturnValue({
      timetables: mockTimetables,
      loading: false,
      error: null,
      createNewTimetable: mockCreateNewTimetable,
      deleteTimetableById: jest.fn(),
      refetch: jest.fn(),
    });

    mockUseUsers.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      createNewUser: jest.fn(),
      updateExistingUser: jest.fn(),
      deleteExistingUser: jest.fn(),
      refetch: jest.fn(),
    });
  });

  it("should render modal when open", () => {
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText("Créer une nouvelle équipe")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(<AddTeamModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.queryByText("Créer une nouvelle équipe")).not.toBeInTheDocument();
  });

  it("should display team name input", () => {
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/nom de l'équipe/i)).toBeInTheDocument();
  });

  it("should display timetable select", () => {
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/^horaire$/i)).toBeInTheDocument();
  });

  it("should show validation error when submitting without team name", async () => {
    const user = userEvent.setup();
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Créer l'équipe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Équipe requis")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should submit successfully with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/nom de l'équipe/i);
    await user.type(nameInput, "Team A");

    const timetableSelect = screen.getByLabelText(/^horaire$/i);
    await user.selectOptions(timetableSelect, "1");

    const submitButton = screen.getByText("Créer l'équipe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Team A",
        id_manager: 3,
        id_timetable: 1,
        memberIds: [],
      });
    });
  });

  it("should display member selection checkboxes", () => {
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    // Should show John and Jane, but NOT Bob (current user)
    expect(screen.getByLabelText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jane smith/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bob manager/i)).not.toBeInTheDocument();
  });

  it("should toggle member selection when checkbox is clicked", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const johnCheckbox = screen.getByLabelText(/john doe/i);
    await user.click(johnCheckbox);

    expect(johnCheckbox).toBeChecked();

    await user.click(johnCheckbox);
    expect(johnCheckbox).not.toBeChecked();
  });

  it("should submit with selected members", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/nom de l'équipe/i);
    await user.type(nameInput, "Team A");

    const timetableSelect = screen.getByLabelText(/^horaire$/i);
    await user.selectOptions(timetableSelect, "1");

    const johnCheckbox = screen.getByLabelText(/john doe/i);
    await user.click(johnCheckbox);

    const janeCheckbox = screen.getByLabelText(/jane smith/i);
    await user.click(janeCheckbox);

    const submitButton = screen.getByText("Créer l'équipe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Team A",
        id_manager: 3,
        id_timetable: 1,
        memberIds: [1, 2],
      });
    });
  });

  it("should reset form when modal closes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    const nameInput = screen.getByLabelText(/nom de l'équipe/i);
    await user.type(nameInput, "Team A");

    rerender(<AddTeamModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    rerender(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/nom de l'équipe/i)).toHaveValue("");
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
