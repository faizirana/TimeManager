import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/UI/StatusBadge";

describe("StatusBadge", () => {
  it("should render with children", () => {
    render(<StatusBadge>Active</StatusBadge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should use planned variant as default", () => {
    const { container } = render(<StatusBadge>Test</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-gray-50", "text-gray-700", "border-gray-300");
  });

  it("should render inProgress variant correctly", () => {
    const { container } = render(<StatusBadge variant="inProgress">In Progress</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-green-50", "text-green-700", "border-green-300");
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should render onPause variant correctly", () => {
    const { container } = render(<StatusBadge variant="onPause">On Pause</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-yellow-50", "text-yellow-700", "border-yellow-300");
    expect(screen.getByText("On Pause")).toBeInTheDocument();
  });

  it("should render late variant correctly", () => {
    const { container } = render(<StatusBadge variant="late">Late</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-red-50", "text-red-700", "border-red-300");
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("should render planned variant correctly", () => {
    const { container } = render(<StatusBadge variant="planned">Planned</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-gray-50", "text-gray-700", "border-gray-300");
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  it("should accept and apply custom className", () => {
    const { container } = render(<StatusBadge className="ml-4">Custom</StatusBadge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("ml-4");
  });

  it("should merge custom className with variant classes", () => {
    const { container } = render(
      <StatusBadge variant="inProgress" className="extra-class">
        Test
      </StatusBadge>,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-green-50", "text-green-700", "border-green-300", "extra-class");
  });
});
