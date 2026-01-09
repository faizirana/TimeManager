import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/UI/Avatar";

describe("Avatar", () => {
  it("should render with initials when name and surname are provided", () => {
    const { container } = render(<Avatar name="John" surname="Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();

    const avatar = container.querySelector("div");
    expect(avatar).toHaveClass("w-10", "h-10", "bg-gray-500", "rounded-full");
  });

  it("should render User icon when name is missing", () => {
    const { container } = render(<Avatar name="" surname="Doe" />);

    // Should not have text initials
    expect(screen.queryByText("D")).not.toBeInTheDocument();

    // Should have User icon (lucide icon renders as svg)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render User icon when surname is missing", () => {
    const { container } = render(<Avatar name="John" surname="" />);

    // Should not have text initials
    expect(screen.queryByText("J")).not.toBeInTheDocument();

    // Should have User icon
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render User icon when both name and surname are missing", () => {
    const { container } = render(<Avatar name="" surname="" />);

    // Should have User icon
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply custom size", () => {
    const { container } = render(<Avatar name="John" surname="Doe" size="w-20 h-20" />);

    const avatar = container.querySelector("div");
    expect(avatar).toHaveClass("w-20", "h-20");
  });

  it("should apply custom className", () => {
    const { container } = render(<Avatar name="John" surname="Doe" className="custom-class" />);

    const avatar = container.querySelector("div");
    expect(avatar).toHaveClass("custom-class");
  });

  it("should render uppercase initials", () => {
    render(<Avatar name="john" surname="doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should use first character of name and surname", () => {
    render(<Avatar name="Alexander" surname="Smith-Jones" />);
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("should apply default size when not specified", () => {
    const { container } = render(<Avatar name="John" surname="Doe" />);

    const avatar = container.querySelector("div");
    expect(avatar).toHaveClass("w-10", "h-10");
  });

  it("should render User icon with size 16", () => {
    const { container } = render(<Avatar name="" surname="" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });
});
