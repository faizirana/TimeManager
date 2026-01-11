/**
 * @fileoverview Tests for useToast hook
 *
 * These tests verify that the useToast hook:
 * - Manages toast state correctly
 * - Shows success, error, and info toasts
 * - Clears toasts properly
 * - Uses correct default durations
 */

import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/lib/hooks/useToast";

describe("useToast Hook", () => {
  /**
   * TEST 1: Initial state
   * Scenario: Hook is rendered without any action
   * Expected: toast should be null
   */
  it("should initialize with null toast", () => {
    // ARRANGE & ACT: Render the hook
    const { result } = renderHook(() => useToast());

    // ASSERT: toast should be null
    expect(result.current.toast).toBeNull();
  });

  /**
   * TEST 2: Show success toast
   * Scenario: showSuccess is called with a message
   * Expected: toast should have success type and the message
   */
  it("should show success toast", () => {
    // ARRANGE: Render the hook
    const { result } = renderHook(() => useToast());

    // ACT: Show success toast
    act(() => {
      result.current.showSuccess("Operation completed");
    });

    // ASSERT: toast should be set correctly
    expect(result.current.toast).toEqual({
      message: "Operation completed",
      type: "success",
      duration: 5000,
    });
  });

  /**
   * TEST 3: Show error toast
   * Scenario: showError is called with a message
   * Expected: toast should have error type and the message
   */
  it("should show error toast", () => {
    // ARRANGE: Render the hook
    const { result } = renderHook(() => useToast());

    // ACT: Show error toast
    act(() => {
      result.current.showError("Something went wrong");
    });

    // ASSERT: toast should be set correctly
    expect(result.current.toast).toEqual({
      message: "Something went wrong",
      type: "error",
      duration: 5000,
    });
  });

  /**
   * TEST 4: Show info toast
   * Scenario: showInfo is called with a message
   * Expected: toast should have info type and the message
   */
  it("should show info toast", () => {
    // ARRANGE: Render the hook
    const { result } = renderHook(() => useToast());

    // ACT: Show info toast
    act(() => {
      result.current.showInfo("Information message");
    });

    // ASSERT: toast should be set correctly
    expect(result.current.toast).toEqual({
      message: "Information message",
      type: "info",
      duration: 5000,
    });
  });

  /**
   * TEST 5: Custom duration
   * Scenario: Toast is shown with custom duration
   * Expected: toast should use the custom duration
   */
  it("should use custom duration", () => {
    // ARRANGE: Render the hook
    const { result } = renderHook(() => useToast());

    // ACT: Show toast with custom duration
    act(() => {
      result.current.showSuccess("Quick message", 2000);
    });

    // ASSERT: toast should have custom duration
    expect(result.current.toast).toEqual({
      message: "Quick message",
      type: "success",
      duration: 2000,
    });
  });

  /**
   * TEST 6: Clear toast
   * Scenario: clearToast is called after showing a toast
   * Expected: toast should be null
   */
  it("should clear toast", () => {
    // ARRANGE: Render the hook and show a toast
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showSuccess("Test message");
    });

    // ACT: Clear the toast
    act(() => {
      result.current.clearToast();
    });

    // ASSERT: toast should be null
    expect(result.current.toast).toBeNull();
  });

  /**
   * TEST 7: Replace toast
   * Scenario: Show a new toast while one is already displayed
   * Expected: New toast should replace the old one
   */
  it("should replace existing toast with new one", () => {
    // ARRANGE: Render the hook and show initial toast
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showSuccess("First message");
    });

    // ACT: Show a new toast
    act(() => {
      result.current.showError("Second message");
    });

    // ASSERT: toast should be the new one
    expect(result.current.toast).toEqual({
      message: "Second message",
      type: "error",
      duration: 5000,
    });
  });

  /**
   * TEST 8: Functions stability
   * Scenario: Hook is re-rendered
   * Expected: Functions should maintain referential equality
   */
  it("should maintain function references across re-renders", () => {
    // ARRANGE: Render the hook
    const { result, rerender } = renderHook(() => useToast());
    const initialFunctions = {
      showSuccess: result.current.showSuccess,
      showError: result.current.showError,
      showInfo: result.current.showInfo,
      clearToast: result.current.clearToast,
    };

    // ACT: Force re-render
    rerender();

    // ASSERT: Functions should be the same
    expect(result.current.showSuccess).toBe(initialFunctions.showSuccess);
    expect(result.current.showError).toBe(initialFunctions.showError);
    expect(result.current.showInfo).toBe(initialFunctions.showInfo);
    expect(result.current.clearToast).toBe(initialFunctions.clearToast);
  });
});
