/**
 * Tests for Button component
 *
 * These tests verify that the Button component:
 * 1. Renders correctly with different props
 * 2. Handles click events
 * 3. Applies styles based on props
 */

import { render, screen } from "@testing-library/react";
import { Button } from "@/components/UI/Button";
import userEvent from "@testing-library/user-event";

describe("Button Component", () => {
  /**
   * TEST 1: Renders with default props
   *
   * Scenario: Render Button without any props
   * Expected: Button is rendered with default text and styles
   */
  it("should render with default props", () => {
    // ARRANGE & ACT: Render the Button component
    render(<Button>Click Me</Button>);

    // ASSERT: Verify the button is in the document with correct text
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  /**
   * TEST 2: Handles click events
   *
   * Scenario: User clicks the Button
   * Expected: onClick handler is called
   */
  it("should handle click events", async () => {
    // ARRANGE: Create a mock function for onClick
    const handleClick = jest.fn();
    // ARRANGE: Use userEvent for simulating user interactions
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click Me</Button>);

    // ACT: Simulate user clicking the button
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    await user.click(buttonElement);

    // ASSERT: Verify the onClick handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * TEST 3: Disabled state
   *
   * Scenario: Render Button with disabled prop
   * Expected: Button is disabled and does not respond to clicks
   */
  it("should render as disabled when disabled prop is true", async () => {
    // ARRANGE: Create a mock function for onClick
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>,
    );

    // ACT: Try to click the disabled button
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeDisabled();
    await user.click(buttonElement);

    // ASSERT: Verify the onClick handler was not called
    expect(handleClick).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Custom className prop
   *
   * Scenario: Render Button with a custom className
   * Expected: Button has both default and custom classes applied
   */
  it("should apply custom className prop", () => {
    // ARRANGE & ACT: Render the Button with a custom class
    render(<Button className="custom-class">Click Me</Button>);

    // ASSERT: Verify the button has both default and custom classes
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toHaveClass("bg-blue-600"); // Default class
    expect(buttonElement).toHaveClass("custom-class"); // Custom class
  });
});
