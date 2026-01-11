/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorDisplay } from "@/components/UI/ErrorDisplay";

describe("ErrorDisplay", () => {
  it("should not render when error is null", () => {
    const { container } = render(<ErrorDisplay error={null} variant="inline" />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when error is empty string", () => {
    const { container } = render(<ErrorDisplay error="" variant="inline" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render inline error message", () => {
    render(<ErrorDisplay error="Test error message" variant="inline" />);
    const errorElement = screen.getByText("Test error message");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass("text-red-600");
  });

  it("should render toast error message", () => {
    render(<ErrorDisplay error="Toast error" variant="toast" />);
    const errorElement = screen.getByText("Toast error");
    expect(errorElement).toBeInTheDocument();
    // Toast variant has a fixed positioning wrapper with bg-red-50
    const wrapper = errorElement.closest(".fixed");
    expect(wrapper).toHaveClass("bg-red-50");
  });

  it("should use inline variant by default", () => {
    render(<ErrorDisplay error="Default variant" />);
    const errorElement = screen.getByText("Default variant");
    expect(errorElement).toHaveClass("text-red-600");
    expect(errorElement).toHaveClass("text-sm");
  });

  it("should apply custom className to container", () => {
    const { container } = render(
      <ErrorDisplay error="Custom class error" variant="inline" className="custom-class" />,
    );
    // className is applied to the container div, not the inner text element
    const errorContainer = container.querySelector(".custom-class");
    expect(errorContainer).toBeInTheDocument();
  });

  it("should render toast with border and padding", () => {
    render(<ErrorDisplay error="Toast with styles" variant="toast" />);
    const wrapper = screen.getByText("Toast with styles").closest(".fixed");
    expect(wrapper).toHaveClass("border");
    expect(wrapper).toHaveClass("border-red-200");
    expect(wrapper).toHaveClass("p-4");
    expect(wrapper).toHaveClass("rounded-lg");
  });
});
