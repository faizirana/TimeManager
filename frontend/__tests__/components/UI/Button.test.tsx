import { render, screen } from "@testing-library/react";
import { Button } from "@/components/UI/Button";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";

describe("Button Component", () => {
  it("should render with default props", () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const buttonElement = screen.getByRole("button", { name: /click me/i });
    await user.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render as disabled when disabled prop is true", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>,
    );

    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeDisabled();
    await user.click(buttonElement);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should apply custom className prop", () => {
    render(<Button className="custom-class">Click Me</Button>);

    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toHaveClass("bg-[var(--color-primary)]");
    expect(buttonElement).toHaveClass("custom-class");
  });

  // Variant tests
  it("should render with primary variant", () => {
    render(<Button variant="primary">Primary</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("bg-[var(--color-primary)]");
  });

  it("should render with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("bg-[var(--color-secondary)]");
  });

  it("should render with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("bg-red-600");
  });

  it("should render with outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("border", "border-[var(--border)]");
  });

  it("should render with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("hover:bg-[var(--surface-hover)]");
  });

  // Size tests
  it("should render with small size", () => {
    render(<Button size="sm">Small</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("px-3", "py-1.5", "text-sm");
  });

  it("should render with medium size (default)", () => {
    render(<Button size="md">Medium</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("px-4", "py-2", "text-sm");
  });

  it("should render with large size", () => {
    render(<Button size="lg">Large</Button>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveClass("px-6", "py-3", "text-base");
  });

  // Icon tests
  it("should render icon on the right by default", () => {
    const { container } = render(<Button icon={<Plus data-testid="icon" />}>With Icon</Button>);

    const button = container.querySelector("button");
    const icon = screen.getByTestId("icon");
    const text = screen.getByText("With Icon");

    // Icon should be after text (right position)
    expect(button?.innerHTML.indexOf(text.textContent!)).toBeLessThan(
      button?.innerHTML.indexOf(icon.outerHTML) || 0,
    );
  });

  it("should render icon on the left when iconPosition is left", () => {
    const { container } = render(
      <Button icon={<Plus data-testid="icon" />} iconPosition="left">
        With Icon
      </Button>,
    );

    const button = container.querySelector("button");
    const icon = screen.getByTestId("icon");
    const text = screen.getByText("With Icon");

    // Icon should be before text (left position)
    expect(button?.innerHTML.indexOf(icon.outerHTML)).toBeLessThan(
      button?.innerHTML.indexOf(text.textContent!) || 0,
    );
  });

  it("should render without icon when icon prop is not provided", () => {
    const { container } = render(<Button>No Icon</Button>);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });

  it("should render icon on the right when iconPosition is right", () => {
    const { container } = render(
      <Button icon={<Plus data-testid="icon" />} iconPosition="right">
        With Icon
      </Button>,
    );

    const icon = screen.getByTestId("icon");
    expect(icon).toBeInTheDocument();
  });

  it("should pass HTML button attributes", () => {
    render(
      <Button type="submit" id="submit-btn" aria-label="Submit form">
        Submit
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("id", "submit-btn");
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });
});
