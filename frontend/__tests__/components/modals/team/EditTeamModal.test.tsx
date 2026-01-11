import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditTeamModal } from "@/components/modals/team/EditTeamModal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useTimetables } from "@/lib/hooks/useTimetables";
import { useUsers } from "@/lib/hooks/useUsers";
import { Team } from "@/lib/types/teams";

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

const mockTeam: Team = {
  id: 1,
  name: "Team A",
  id_manager: 3,
  id_timetable: 1,
  manager: mockUsers[2],
  members: [mockUsers[0]],
};

describe("EditTeamModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

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
      createNewTimetable: jest.fn(),
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
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );
    expect(screen.getByText("Modifier l'équipe")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(
      <EditTeamModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        team={mockTeam}
      />,
    );
    expect(screen.queryByText("Modifier l'équipe")).not.toBeInTheDocument();
  });

  it("should pre-fill form with team data", () => {
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const nameInput = screen.getByLabelText(/nom de l'équipe/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Team A");

    const timetableSelect = screen.getByLabelText(/^horaire$/i) as HTMLSelectElement;
    expect(timetableSelect.value).toBe("1");
  });

  it("should pre-select team members", () => {
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const johnCheckbox = screen.getByLabelText(/john doe/i) as HTMLInputElement;
    expect(johnCheckbox).toBeChecked();

    const janeCheckbox = screen.getByLabelText(/jane smith/i) as HTMLInputElement;
    expect(janeCheckbox).not.toBeChecked();
  });

  it("should update form when team prop changes", () => {
    const { rerender } = render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const updatedTeam: Team = {
      ...mockTeam,
      name: "Updated Team",
      id_timetable: 2,
      members: [mockUsers[1]],
    };

    rerender(
      <EditTeamModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        team={updatedTeam}
      />,
    );

    const nameInput = screen.getByLabelText(/nom de l'équipe/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Updated Team");

    const timetableSelect = screen.getByLabelText(/^horaire$/i) as HTMLSelectElement;
    expect(timetableSelect.value).toBe("2");

    const janeCheckbox = screen.getByLabelText(/jane smith/i) as HTMLInputElement;
    expect(janeCheckbox).toBeChecked();
  });

  it("should submit successfully with updated data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const nameInput = screen.getByLabelText(/nom de l'équipe/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Team Name");

    const timetableSelect = screen.getByLabelText(/^horaire$/i);
    await user.selectOptions(timetableSelect, "2");

    const submitButton = screen.getByText("Enregistrer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Updated Team Name",
        id_timetable: 2,
        memberIds: [1],
      });
    });
  });

  it("should toggle member selection", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const janeCheckbox = screen.getByLabelText(/jane smith/i);
    await user.click(janeCheckbox);

    const johnCheckbox = screen.getByLabelText(/john doe/i);
    await user.click(johnCheckbox);

    const submitButton = screen.getByText("Enregistrer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Team A",
        id_timetable: 1,
        memberIds: [2],
      });
    });
  });

  it("should display error message on submission failure", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce(new Error("Update failed"));

    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const submitButton = screen.getByText("Enregistrer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should not include manager in member selection", () => {
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    expect(screen.getByLabelText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jane smith/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bob manager/i)).not.toBeInTheDocument();
  });

  it("should show loading state when fetching users", () => {
    mockUseUsers.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      createNewUser: jest.fn(),
      updateExistingUser: jest.fn(),
      deleteExistingUser: jest.fn(),
      refetch: jest.fn(),
    });

    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );
    expect(screen.getByText(/chargement des utilisateurs/i)).toBeInTheDocument();
  });

  it("should reset form when modal is closed and reopened", () => {
    const { rerender } = render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    rerender(
      <EditTeamModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        team={mockTeam}
      />,
    );
    rerender(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const nameInput = screen.getByLabelText(/nom de l'équipe/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Team A");
  });

  it("should display member count when members are selected", () => {
    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    expect(screen.getByText(/1 membre\(s\) sélectionné\(s\)/i)).toBeInTheDocument();
  });

  it("should submit with empty memberIds when no members selected", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <EditTeamModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} team={mockTeam} />,
    );

    const johnCheckbox = screen.getByLabelText(/john doe/i);
    await user.click(johnCheckbox); // Uncheck John

    const submitButton = screen.getByText("Enregistrer");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Team A",
        id_timetable: 1,
        memberIds: [],
      });
    });
  });
});
