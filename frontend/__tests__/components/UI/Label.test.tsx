/**
 * @fileoverview Tests for Label component
 *
 * These tests verify that the Label component:
 * 1. Renders correctly with different props
 * 2. Associates correctly with input elements
 * 3. Applies styles based on props
 * 4. Text content is displayed correctly
 */

import { render, screen } from "@testing-library/react";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import userEvent from "@testing-library/user-event";

describe("Label Component", () => {
  /**
   * TEST 1: Renders with text content
   *
   * Scenario: Render Label with text content
   * Expected: Label is rendered with correct text
   */
  it("should render with text content", () => {
    // ARRANGE & ACT: Render the Label component
    render(<Label>Email Address</Label>);

    // ASSERT: Verify the label is in the document with correct text
    const labelElement = screen.getByText("Email Address");
    expect(labelElement).toBeInTheDocument();
  });

  /**
   * TEST 2: Associates with input element
   *
   * Scenario: Render Label with htmlFor prop linked to an Input
   * Expected: Clicking the label focuses the associated input
   */
  it("should associate with input element via htmlFor", async () => {
    // ARRANGE: Use userEvent for simulating user interactions
    const user = userEvent.setup();
    // ARRANGE: Render the Label and Input components
    render(
      <>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="Enter email" />
      </>,
    );

    // ACT: try clicking the label focuses the input
    const labelElement = screen.getByText("Email Address");
    await user.click(labelElement);

    // ASSERT: Verify the input is focused
    const inputElement = screen.getByLabelText("Email Address");
    expect(inputElement).toHaveFocus();
  });

  /**
   * TEST 3: Applies custom className
   *
   * Scenario: Render Label with custom className prop
   * Expected: Label has the custom class applied
   */
  it("should apply custom className", () => {
    // ARRANGE & ACT: Render the Label component with custom className
    render(<Label className="custom-label-class">Email</Label>);

    // ASSERT: Verify the label has the custom class
    const labelElement = screen.getByText("Email");
    expect(labelElement).toHaveClass("text-[var(--muted-foreground)]"); // Default class from Label component (floating variant)
    expect(labelElement).toHaveClass("custom-label-class"); // Custom class
  });
});
