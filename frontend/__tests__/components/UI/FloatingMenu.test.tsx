/**
 * @fileoverview Tests for FloatingMenu component
 * * These tests verify:
 * - Opening/Closing the menu on click
 * - Execution of menu item callbacks
 * - Closing the menu when clicking outside
 * - Application of direction-based styles
 * - Application of custom item colors
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FloatingMenu from "@/components/UI/FloatingMenu";

describe("FloatingMenu Component", () => {
  const mockItems = [
    { label: "Edit", onClick: jest.fn() },
    { label: "Delete", onClick: jest.fn(), color: "text-red-500" },
  ];

  const defaultProps = {
    menuItems: mockItems,
    buttonContent: <span>Open Menu</span>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Basic rendering and toggling
   */
  it("should render the button content and hide menu by default", () => {
    render(<FloatingMenu {...defaultProps} />);

    expect(screen.getByText("Open Menu")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should toggle the menu when clicking the trigger button", async () => {
    const user = userEvent.setup();
    render(<FloatingMenu {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /open menu/i });

    // Open
    await user.click(trigger);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // Close
    await user.click(trigger);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  /**
   * TEST 2: Menu Item Interactions
   */
  it("should call the item onClick handler and close menu when an item is clicked", async () => {
    const user = userEvent.setup();
    render(<FloatingMenu {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    const editButton = screen.getByRole("button", { name: "Edit" });
    await user.click(editButton);

    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should apply custom color class to menu items if provided", async () => {
    const user = userEvent.setup();
    render(<FloatingMenu {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    expect(deleteButton).toHaveClass("text-red-500");

    const editButton = screen.getByRole("button", { name: "Edit" });
    expect(editButton).toHaveClass("text-black"); // Default color
  });

  /**
   * TEST 3: Click Outside Logic
   */
  it("should close the menu when clicking outside the component", async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <FloatingMenu {...defaultProps} />
      </div>,
    );

    // Open menu
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("list")).toBeInTheDocument();

    // Click outside
    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  /**
   * TEST 4: Directions and Styling
   */
  it.each([
    ["top", "bottom-full mb-2"],
    ["right", "left-full bottom-0 ml-2"],
    ["bottom", "top-full mt-2"],
    ["left", "right-full bottom-0 mr-2"],
  ])("should apply correct classes for direction: %s", async (direction, expectedClass) => {
    const user = userEvent.setup();
    render(<FloatingMenu {...defaultProps} direction={direction as any} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    // On cherche le conteneur du menu (le parent du <ul>)
    const menuContainer = screen.getByRole("list").parentElement;

    // On vérifie que les classes correspondantes sont présentes
    expectedClass.split(" ").forEach((cls) => {
      expect(menuContainer).toHaveClass(cls);
    });
  });

  /**
   * TEST 5: Edge case - No items
   */
  it("should not show cursor-pointer if menuItems is empty", () => {
    render(<FloatingMenu menuItems={[]} buttonContent="No Items" />);
    const trigger = screen.getByRole("button");
    expect(trigger).not.toHaveClass("cursor-pointer");
  });
});
