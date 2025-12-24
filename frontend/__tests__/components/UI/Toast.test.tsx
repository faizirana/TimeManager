/**
 * @fileoverview Tests for Toast component
 *
 * These tests verify that the Toast component:
 * 1. Renders correctly with different types (success, error, info)
 * 2. Auto-closes after specified duration
 * 3. Handles manual close
 * 4. Displays correct icons and colors
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "@/components/UI/Toast";

describe("Toast Component", () => {
  /**
   * TEST 1: Renders with default props (info type)
   *
   * Scenario: Render Toast with only message
   * Expected: Toast is rendered with info styling and default duration
   */
  it("should render with default info type", () => {
    // ARRANGE & ACT: Render the Toast component
    render(<Toast message="Test notification" />);

    // ASSERT: Verify the toast message is displayed
    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  /**
   * TEST 2: Renders with success type
   *
   * Scenario: Render Toast with success type
   * Expected: Toast is rendered with success icon and green styling
   */
  it("should render with success type and correct styling", () => {
    // ARRANGE & ACT: Render the Toast component with success type
    const { container } = render(<Toast message="Success message" type="success" />);

    // ASSERT: Verify the message and success styling
    expect(screen.getByText("Success message")).toBeInTheDocument();
    const toastContainer = container.querySelector(".bg-green-50");
    expect(toastContainer).toBeInTheDocument();
  });

  /**
   * TEST 3: Renders with error type
   *
   * Scenario: Render Toast with error type
   * Expected: Toast is rendered with error icon and red styling
   */
  it("should render with error type and correct styling", () => {
    // ARRANGE & ACT: Render the Toast component with error type
    const { container } = render(<Toast message="Error message" type="error" />);

    // ASSERT: Verify the message and error styling
    expect(screen.getByText("Error message")).toBeInTheDocument();
    const toastContainer = container.querySelector(".bg-red-50");
    expect(toastContainer).toBeInTheDocument();
  });

  /**
   * TEST 4: Handles manual close
   *
   * Scenario: User clicks the close button
   * Expected: onClose callback is called
   */
  it("should call onClose when close button is clicked", async () => {
    // ARRANGE: Create a mock function for onClose
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(<Toast message="Test message" onClose={handleClose} />);

    // ACT: Click the close button
    const closeButton = screen.getByLabelText(/close notification/i);
    await user.click(closeButton);

    // ASSERT: Verify onClose was called (after animation delay)
    await waitFor(
      () => {
        expect(handleClose).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  /**
   * TEST 5: Auto-closes after duration
   *
   * Scenario: Toast is rendered with custom duration
   * Expected: onClose is called automatically after duration
   */
  it("should auto-close after specified duration", async () => {
    // ARRANGE: Create a mock function for onClose
    const handleClose = jest.fn();
    const duration = 1000; // 1 second

    // ACT: Render Toast with short duration
    render(<Toast message="Auto close test" duration={duration} onClose={handleClose} />);

    // ASSERT: Verify toast is visible initially
    expect(screen.getByText("Auto close test")).toBeInTheDocument();

    // ASSERT: Verify onClose is called after duration + animation time
    await waitFor(
      () => {
        expect(handleClose).toHaveBeenCalled();
      },
      { timeout: duration + 500 },
    );
  });

  /**
   * TEST 6: Close button has correct accessibility label
   *
   * Scenario: Render Toast and check close button
   * Expected: Close button has proper aria-label
   */
  it("should have accessible close button", () => {
    // ARRANGE & ACT: Render the Toast component
    render(<Toast message="Accessibility test" />);

    // ASSERT: Verify close button has aria-label
    const closeButton = screen.getByLabelText(/close notification/i);
    expect(closeButton).toBeInTheDocument();
  });

  /**
   * TEST 7: Renders with custom duration
   *
   * Scenario: Render Toast with custom duration
   * Expected: Toast uses the custom duration
   */
  it("should accept custom duration prop", () => {
    // ARRANGE & ACT: Render with custom duration
    const customDuration = 3000;
    const { container } = render(<Toast message="Custom duration" duration={customDuration} />);

    // ASSERT: Verify Toast is rendered (duration will be tested by auto-close test)
    expect(screen.getByText("Custom duration")).toBeInTheDocument();
  });
});
