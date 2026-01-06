/**
 * @fileoverview Tests for Sidebar component
 *
 * These tests verify that the Sidebar component:
 * - Renders correctly with items
 * - Handles collapsed / expanded state
 * - Renders SidebarItem components
 * - Displays the title conditionally
 * - Always renders DarkModeSwitcher
 */

import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";

// Mock SidebarItem to avoid testing its internal logic again
jest.mock("@/components/layout/Sidebar/SidebarItem", () => {
  return ({ label }: { label: string }) => <div data-testid="sidebar-item">{label}</div>;
});

// Mock DarkModeSwitcher
jest.mock("@/components/UI/DarkModeSwitcher", () => {
  return () => <div data-testid="dark-mode-switcher" />;
});

const mockItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/users" },
];

describe("Sidebar Component", () => {
  /**
   * TEST 1: Renders sidebar with items
   */
  it("should render all sidebar items", () => {
    render(<Sidebar items={mockItems} collapsed={false} />);

    const items = screen.getAllByTestId("sidebar-item");
    expect(items).toHaveLength(2);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  /**
   * TEST 2: Displays title when not collapsed
   */
  it("should display the title when sidebar is expanded", () => {
    render(<Sidebar items={mockItems} collapsed={false} />);

    expect(screen.getByText(/time manager/i)).toBeInTheDocument();
  });

  /**
   * TEST 3: Hides title when collapsed
   */
  it("should hide the title when sidebar is collapsed", () => {
    render(<Sidebar items={mockItems} collapsed />);

    expect(screen.queryByText(/time manager/i)).not.toBeInTheDocument();
  });

  /**
   * TEST 4: Applies collapsed width
   */
  it("should apply collapsed width class when collapsed", () => {
    const { container } = render(<Sidebar items={mockItems} collapsed />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("w-16");
  });

  /**
   * TEST 5: Applies expanded width when not collapsed
   */
  it("should apply expanded width class when not collapsed", () => {
    const { container } = render(<Sidebar items={mockItems} collapsed={false} />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("w-56");
  });

  /**
   * TEST 6: Always renders DarkModeSwitcher
   */
  it("should always render DarkModeSwitcher", () => {
    render(<Sidebar items={mockItems} collapsed={false} />);

    expect(screen.getByTestId("dark-mode-switcher")).toBeInTheDocument();
  });

  /**
   * TEST 7: Applies custom className
   */
  it("should apply custom className", () => {
    const { container } = render(
      <Sidebar items={mockItems} collapsed={false} className="custom-class" />,
    );

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("custom-class");
  });
});
