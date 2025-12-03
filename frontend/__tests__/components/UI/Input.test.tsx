/**
 * @fileoverview Tests for Input component
 *
 * These tests verify that the Input component:
 * 1. Renders correctly with different props
 * 2. Handles user input
 * 3. Applies styles based on props
 */

import { render, screen } from "@testing-library/react";
import { Input } from "@/components/UI/Input";
import userEvent from "@testing-library/user-event";

describe("Input Component", () => {
  /**
   * TEST 1: Renders with default props
   *
   * Scenario: Render Input without any props
   * Expected: Input is rendered with default attributes and styles
   */
  it("should render with default props & placeholder", () => {
    // ARRANGE & ACT: Render the Input component
    render(<Input placeholder="Enter your email" />);

    // ASSERT: Verify the input is in the document with correct placeholder
    const inputElement = screen.getByPlaceholderText("Enter your email");
    expect(inputElement).toBeInTheDocument();
  });

  /**
   * TEST 2: Handles user input (typing)
   *
   * Scenario: User types into the Input
   * Expected: Input value updates correctly
   */
  it("should handle user input", async () => {
    // ARRANGE: Create a mock function for onChange
    const handleChange = jest.fn();
    // ARRANGE: Use userEvent for simulating user interactions
    const user = userEvent.setup();
    // ARRANGE: Define the text to type
    const text = "test@example.com";
    // ARRANGE: Render the Input component
    render(<Input onChange={handleChange} placeholder="Enter your email" />);

    // ACT: Simulate user typing into the input
    const inputElement = screen.getByPlaceholderText("Enter your email");
    await user.type(inputElement, text);

    // ASSERT: Verify the input value has been updated
    expect(handleChange).toHaveBeenCalledTimes(text.length);
    expect(inputElement).toHaveValue(text);
  });

  /**
   * TEST 3: Disabled state
   *
   * Scenario: Render Input with disabled prop
   * Expected: Input is disabled and does not respond to user input
   */
  it("should render as disabled when disabled prop is true", async () => {
    // ARRANGE: Create a mock function for onChange
    const handleChange = jest.fn();
    // ARRANGE: Use userEvent for simulating user interactions
    const user = userEvent.setup();
    // ARRANGE: Define the text to type
    const text = "test@example.com";
    // ARRANGE: Render the Input component with disabled prop
    render(<Input onChange={handleChange} disabled placeholder="Enter your email" />);

    // ACT: Try to type into the disabled input
    const inputElement = screen.getByPlaceholderText("Enter your email");
    expect(inputElement).toBeDisabled();
    await user.type(inputElement, text);

    // ASSERT: Verify the onChange handler was not called and value is unchanged
    expect(handleChange).not.toHaveBeenCalled();
    expect(inputElement).toHaveValue("");
  });

  /**
   * TEST 4: Custom className prop
   *
   * Scenario: Render Input with a custom className
   * Expected: Input has the custom class applied
   */
  it("should apply custom className prop", () => {
    // ARRANGE & ACT: Render the Input component with custom className
    render(<Input className="my-custom-input" placeholder="Enter your email" />);

    // ASSERT: Verify the input has the custom class applied
    const inputElement = screen.getByPlaceholderText("Enter your email");
    expect(inputElement).toHaveClass("border-b-2"); // Default class check
    expect(inputElement).toHaveClass("my-custom-input"); // Custom class check
  });

  /**
   * TEST 5: Render with type="email"
   *
   * Scenario: Render Input with type="email" prop
   * Expected: Input has type attribute set to email
   */
  it('should render with type="email" attribute', () => {
    // ARRANGE & ACT: Render the Input component with type="email"
    render(<Input type="email" placeholder="Enter your email" />);

    // ASSERT: Verify the input has the type attribute set to email
    const inputElement = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
    // HTML5 validity API
    expect(inputElement.type).toBe("email");
  });

  /**
   * TEST 6: HTML5 email validation
   *
   * Scenario: Render Input with type="email" and test validation
   * Expected: Input validates email format correctly
   */
  it("should use HTML5 email validation", () => {
    // ARRANGE & ACT: Render the Input component with type="email"
    render(<Input type="email" placeholder="Enter your email" />);

    // ASSERT: Verify the input enforces email format
    const inputElement = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
    // HTML5 validity API
    expect(inputElement.type).toBe("email");
    // Test invalid email
    inputElement.value = "invalid-email";
    expect(inputElement.validity.valid).toBe(false);
    // Test valid email
    inputElement.value = "valid@email.com";
    expect(inputElement.validity.valid).toBe(true);
  });

  /**
   * TEST 7: Render with type="password"
   *
   * Scenario: Render Input with type="password" prop
   * Expected: Input has type attribute set to password
   */
  it('should render with type="password" attribute', () => {
    // ARRANGE & ACT: Render the Input component with type="password"
    render(<Input type="password" placeholder="Enter your password" />);

    // ASSERT: Verify the input has the type attribute set to password
    const inputElement = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;
    // HTML5 validity API
    expect(inputElement.type).toBe("password");
  });

  /**
   * TEST 8: Apply Required attribute
   *
   * Scenario: Render Input with required prop
   * Expected: Input is marked as required
   */
  it("should apply required attribute", () => {
    // ARRANGE & ACT: Render the Input component with required prop
    render(<Input required placeholder="Enter your email" />);

    // ASSERT: Verify the input is marked as required
    const inputElement = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
    expect(inputElement).toBeRequired();
  });
});
