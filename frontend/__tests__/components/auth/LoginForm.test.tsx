/**
 * @fileoverview Tests for the LoginForm component
 *
 * These tests verify that the LoginForm component:
 * 1. Renders correctly with all necessary fields and buttons
 * 2. Handles user input correctly
 * 3. Displays loading state during submission
 * 4. Shows error messages when login fails
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/hooks/useAuth";

// Mock the useAuth hook
jest.mock("@/lib/hooks/useAuth");

// TypeScript cast
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("LoginForm Component", () => {
  // Default mock implementation before each test
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      handleSubmit: jest.fn(),
      loading: false,
      error: "",
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Renders with all fields and buttons
   *
   * Scenario: Render the LoginForm component
   * Expected: Email and password fields and submit button are present
   */
  it("should render login form with email and password fields and submit button", () => {
    // ARRANGE & ACT: Render the LoginForm component
    render(<LoginForm />);

    // ASSERT: Verify the email field is present
    const emailField = screen.getByLabelText(/Email/i);
    expect(emailField).toBeInTheDocument();

    // ASSERT: Verify the password field is present
    const passwordField = screen.getByLabelText(/Mot de passe/i);
    expect(passwordField).toBeInTheDocument();

    // ASSERT: Verify the submit button is present
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });
    expect(submitButton).toBeInTheDocument();
  });

  /**
   * TEST 2: Handles user input correctly
   *
   * Scenario: User types into email and password fields
   * Expected: The input values should update accordingly
   */
  it("should handle user input correctly", async () => {
    // ARRANGE: Render the LoginForm component
    render(<LoginForm />);

    // ACT: Simulate user typing into email and password fields
    const user = userEvent.setup();
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);

    await user.type(emailField, "test@example.com");
    await user.type(passwordField, "password123");

    // ASSERT: Verify the input values have been updated
    expect(emailField).toHaveValue("test@example.com");
    expect(passwordField).toHaveValue("password123");
  });

  /**
   * TEST 3: Submits the form and calls handleSubmit
   *
   * Scenario: User fills the form and submits it
   * Expected: handleSubmit is called with correct parameters
   */
  it("should call handleSubmit on form submission", async () => {
    // ARRANGE: Prepare mock handleSubmit
    const mockHandleSubmit = jest.fn();
    mockUseAuth.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      loading: false,
      error: "",
      logout: jest.fn(),
    });

    // ARRANGE: Render the LoginForm component
    render(<LoginForm />);

    // ACT: Simulate user typing and form submission
    const user = userEvent.setup();
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await user.type(emailField, "test@example.com");
    await user.type(passwordField, "password123");
    await user.click(submitButton);

    // ASSERT: Verify handleSubmit was called with correct arguments
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        preventDefault: expect.any(Function),
      }),
      "test@example.com",
      "password123",
    );
  });

  /**
   * TEST 4: Displays loading state during submission
   *
   * Scenario: The form is in loading state
   * Expected: Submit button is disabled and shows loading text
   */
  it("should display loading state during submission", () => {
    // ARRANGE: Set loading state to true
    mockUseAuth.mockReturnValue({
      handleSubmit: jest.fn(),
      loading: true,
      error: "",
      logout: jest.fn(),
    });

    // ARRANGE & ACT: Render the LoginForm component
    render(<LoginForm />);

    // ASSERT: Verify the submit button is disabled and shows loading text
    const submitButton = screen.getByRole("button", { name: /Connexion\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  /**
   * TEST 5: Shows error message when login fails
   *
   * Scenario: An error occurs during login
   * Expected: Error message is displayed to the user
   */
  it("should show error message when login fails", () => {
    // ARRANGE: Set an error message
    const errorMessage = "Identifiants incorrects";

    mockUseAuth.mockReturnValue({
      handleSubmit: jest.fn(),
      loading: false,
      error: errorMessage,
      logout: jest.fn(),
    });

    // ARRANGE & ACT: Render the LoginForm component
    render(<LoginForm />);

    // ASSERT: Verify the error message is displayed
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass("text-red-500");
  });

  /**
   * TEST 6: Allows resubmission after an error
   *
   * Scenario: User sees an error, corrects input, and submits again
   * Expected: handleSubmit is called with the corrected values
   */
  it("should allow resubmission after an error", async () => {
    // ARRANGE: Setup mock with initial error state
    const errorMessage = "Identifiants incorrects";
    const mockHandleSubmit = jest.fn();

    mockUseAuth.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      loading: false,
      error: errorMessage,
      logout: jest.fn(),
    });

    // ARRANGE: Render the LoginForm with error displayed
    render(<LoginForm />);

    // ASSERT: Verify the initial error is visible (pre-condition check)
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // ACT: User corrects input and resubmits
    const user = userEvent.setup();
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await user.clear(emailField);
    await user.type(emailField, "corrected@example.com");
    await user.clear(passwordField);
    await user.type(passwordField, "correctedPassword");
    await user.click(submitButton);

    // ASSERT: Verify handleSubmit was called with corrected values
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        preventDefault: expect.any(Function),
      }),
      "corrected@example.com",
      "correctedPassword",
    );

    // ASSERT: Verify it was called exactly once (no duplicate submission)
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  /**
   * TEST 7: Error message disappears when error is cleared
   *
   * Scenario: Error state changes from error to no error
   * Expected: Error message is no longer displayed
   */
  it("should hide error message when error is cleared", () => {
    // ARRANGE: Initial render with error
    const errorMessage = "Identifiants incorrects";
    mockUseAuth.mockReturnValue({
      handleSubmit: jest.fn(),
      loading: false,
      error: errorMessage,
      logout: jest.fn(),
    });

    const { rerender } = render(<LoginForm />);

    // ASSERT: Error is initially visible
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // ACT: Update mock to clear the error
    mockUseAuth.mockReturnValue({
      handleSubmit: jest.fn(),
      loading: false,
      error: "", // Error cleared
      logout: jest.fn(),
    });

    rerender(<LoginForm />);

    // ASSERT: Error is no longer in the document
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  /**
   * TEST 8: Prevents submission when fields are empty
   *
   * Scenario: User tries to submit the form without filling in fields
   * Expected: handleSubmit is not called
   */
  it("should prevent submission when fields are empty", async () => {
    // ARRANGE: Setup mock
    const mockHandleSubmit = jest.fn();
    mockUseAuth.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      loading: false,
      error: "",
      logout: jest.fn(),
    });

    // ARRANGE: Render
    render(<LoginForm />);

    // ACT: Try to submit without filling fields
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });
    await user.click(submitButton);

    // ASSERT: handleSubmit should NOT be called
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  /**
   * TEST 9: Validates email format
   *
   * Scenario: User enters an invalid email format
   * Expected: handleSubmit is not called
   */
  it("should prevent submission with invalid email format", async () => {
    // ARRANGE: Setup mock
    const mockHandleSubmit = jest.fn();
    mockUseAuth.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      loading: false,
      error: "",
      logout: jest.fn(),
    });

    // ARRANGE: Render
    render(<LoginForm />);

    // ACT: Fill with invalid email and valid password
    const user = userEvent.setup();
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await user.type(emailField, "invalidemail"); // Invalid email format
    await user.type(passwordField, "password123");
    await user.click(submitButton);

    // ASSERT: handleSubmit should NOT be called
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  /**
   * TEST 10: TAB navigation between fields
   *
   * Scenario: User uses TAB key to navigate between fields
   * Expected: Focus moves correctly between email, password, and submit button
   */
  it("should navigate through form fields with Tab key", async () => {
    // ARRANGE: Render
    render(<LoginForm />);

    // ARRANGE: Get elements
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);
    const togglePasswordButton = screen.getByRole("button", { name: /Afficher/i });
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    // ASSERT: Initial focus is not on any field
    expect(document.activeElement).toBe(document.body);

    // ACT & ASSERT: Tab to email field
    const user = userEvent.setup();
    await user.tab();
    expect(emailField).toHaveFocus();

    // ACT & ASSERT: Tab to password field
    await user.tab();
    expect(passwordField).toHaveFocus();

    // ACT & ASSERT: Tab to password visibility toggle button
    await user.tab();
    expect(togglePasswordButton).toHaveFocus();

    // ACT & ASSERT: Tab to submit button
    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  /**
   * TEST 11: ENTER key submits the form
   *
   * Scenario: User fills the form and presses ENTER key
   * Expected: handleSubmit is called
   */
  it("should submit the form when ENTER key is pressed", async () => {
    // ARRANGE: Setup mock
    const mockHandleSubmit = jest.fn();
    mockUseAuth.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      loading: false,
      error: "",
      logout: jest.fn(),
    });

    // ARRANGE: Render
    render(<LoginForm />);

    // ACT: Fill the form and press ENTER
    const user = userEvent.setup();
    const emailField = screen.getByLabelText(/Email/i);
    const passwordField = screen.getByLabelText(/Mot de passe/i);

    await user.type(emailField, "test@example.com");
    await user.type(passwordField, "password123");
    await user.keyboard("{Enter}");

    // ASSERT: Verify handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        preventDefault: expect.any(Function),
      }),
      "test@example.com",
      "password123",
    );
  });
});
