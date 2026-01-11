/**
 * @fileoverview Tests for AddMembersModal component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddMembersModal } from "@/components/modals/team/AddMembersModal";
import { getUsers } from "@/lib/services/users/usersService";

// Mock the service
jest.mock("@/lib/services/users/usersService");

const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;

describe("AddMembersModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <AddMembersModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    expect(screen.queryByText("Ajouter des membres")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", async () => {
    mockGetUsers.mockResolvedValue([]);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter des membres")).toBeInTheDocument();
    });
  });

  it("should fetch users on mount", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        role: "Employee",
        mobileNumber: "+33605060708",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("should filter out current members", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        role: "Employee",
        mobileNumber: "+33605060708",
      },
      {
        id: 3,
        name: "Bob",
        surname: "Wilson",
        email: "bob@example.com",
        role: "Employee",
        mobileNumber: "+33609080706",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[1, 3]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Wilson")).not.toBeInTheDocument();
    });
  });

  it("should show empty state when all users are members", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[1]}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Tous les utilisateurs sont déjà membres de cette équipe"),
      ).toBeInTheDocument();
    });
  });

  it("should select and deselect users", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        role: "Employee",
        mobileNumber: "+33605060708",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const checkbox1 = checkboxes[0];
    const checkbox2 = checkboxes[1];

    fireEvent.click(checkbox1);
    expect(checkbox1).toBeChecked();

    fireEvent.click(checkbox2);
    expect(checkbox2).toBeChecked();

    fireEvent.click(checkbox1);
    expect(checkbox1).not.toBeChecked();
  });

  it("should display selected count", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        role: "Employee",
        mobileNumber: "+33605060708",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // No counter when nothing selected
    expect(screen.queryByText(/\d+ membre/)).not.toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText("1 membre sélectionné")).toBeInTheDocument();

    fireEvent.click(checkboxes[1]);

    expect(screen.getByText("2 membres sélectionnés")).toBeInTheDocument();
  });

  it("should call onSubmit with selected member IDs", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
      {
        id: 2,
        name: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        role: "Employee",
        mobileNumber: "+33605060708",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const addButton = screen.getByText(/Ajouter \(2\)/);
    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith([1, 2]);
  });

  it("should call onClose when cancel button is clicked", async () => {
    mockGetUsers.mockResolvedValue([]);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter des membres")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should disable add button when no members selected", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const addButton = screen.getByText("Ajouter");
    expect(addButton).toBeDisabled();
  });

  it("should enable add button when members are selected", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "Employee",
        mobileNumber: "+33601020304",
      },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const addButton = screen.getByText(/Ajouter \(1\)/);
    expect(addButton).not.toBeDisabled();
  });

  it("should show loading state", () => {
    mockGetUsers.mockImplementation(() => new Promise(() => {}));

    render(
      <AddMembersModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        currentMemberIds={[]}
      />,
    );

    expect(screen.getByText("Chargement des utilisateurs...")).toBeInTheDocument();
  });
});
