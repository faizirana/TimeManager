/**
 * @fileoverview Tests for SidebarItem component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { LayoutDashboard } from "lucide-react";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe("SidebarItem Component", () => {
  const defaultProps = {
    label: "Dashboard",
    icon: LayoutDashboard,
  };

  /**
   * Basic rendering
   */
  it("should render with label and icon", () => {
    render(<SidebarItem {...defaultProps} />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    // Use data-testid or role lookup for the icon if needed,
    // here we check for the presence of the SVG.
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  /**
   * Wrapper logic (Link vs Button)
   */
  it("should render as a link when href is provided", () => {
    render(<SidebarItem {...defaultProps} href="/dashboard" />);
    const link = screen.getByRole("link", { name: /dashboard/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("should render as a button when href is absent", () => {
    render(<SidebarItem {...defaultProps} />);
    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
  });

  /**
   * Variant tests (CVA)
   */
  it.each([
    ["important", "bg-primary"],
    ["secondary", "bg-zinc-100"],
  ])("should apply correct classes for variant %s", (variant, expectedClass) => {
    render(<SidebarItem {...defaultProps} variant={variant as any} />);
    const item = screen.getByRole("button");
    expect(item).toHaveClass(expectedClass);
  });

  it("should apply icon size classes when size is 'icon'", () => {
    render(<SidebarItem {...defaultProps} size="icon" />);
    const item = screen.getByRole("button");
    expect(item).toHaveClass("px-3 py-3"); // Checks the class defined in CVA
  });

  /**
   * Conditional icon logic (Color)
   */
  it("should set icon color to white only when variant is important and NOT active", () => {
    const { rerender } = render(
      <SidebarItem {...defaultProps} variant="important" active={false} />,
    );

    // We verify the 'color' prop passed to the icon (Lucide icon)
    // Note: Lucide renders an SVG, we check the stroke attribute accordingly
    let icon = document.querySelector("svg");

    expect(icon).toHaveAttribute("stroke", "white");

    // If active, it should revert to default color even when variant is important
    rerender(<SidebarItem {...defaultProps} variant="important" active={true} />);
    icon = document.querySelector("svg");
    expect(icon).toHaveAttribute("stroke", "var(--color-primary)");
  });

  /**
   * Disabled state (Logic & UI)
   */
  it("should handle disabled state for links", () => {
    render(<SidebarItem {...defaultProps} href="/target" variant="disabled" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("pointer-events-none");
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<SidebarItem {...defaultProps} variant="disabled" onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  /**
   * Active state
   */
  it("should apply active styles and disable pointer events", () => {
    render(<SidebarItem {...defaultProps} active />);

    const item = screen.getByRole("button");
    expect(item).toHaveClass("bg-secondary", "pointer-events-none");
  });

  /**
   * Custom className
   */
  it("should merge custom className with tailwind-merge", () => {
    render(<SidebarItem {...defaultProps} className="custom-test-class" />);
    expect(screen.getByRole("button")).toHaveClass("custom-test-class");
  });
});
