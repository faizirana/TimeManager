import { render, screen } from "@testing-library/react";
import { RoleBadge } from "@/components/UI/RoleBadge";

describe("RoleBadge", () => {
  it("should render with children", () => {
    render(<RoleBadge>Admin</RoleBadge>);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("should render as a span element", () => {
    const { container } = render(<RoleBadge>Manager</RoleBadge>);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });

  it("should apply correct CSS classes", () => {
    const { container } = render(<RoleBadge>User</RoleBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-xs", "text-gray-500", "bg-gray-100", "px-2", "py-1", "rounded");
  });

  it("should render different role text", () => {
    render(<RoleBadge>Employee</RoleBadge>);
    expect(screen.getByText("Employee")).toBeInTheDocument();
  });
});
