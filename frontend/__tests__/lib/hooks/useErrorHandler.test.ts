/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";

describe("useErrorHandler", () => {
  it("should initialize with no error", () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
  });

  it("should set error message", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError("Test error");
    });

    expect(result.current.error).toBe("Test error");
  });

  it("should clear error", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError("Test error");
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("should handle Error objects", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Error object message"));
    });

    expect(result.current.error).toBe("Error object message");
  });

  it("should handle string errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError("String error");
    });

    expect(result.current.error).toBe("String error");
  });

  it("should handle objects with message property", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError({ message: "Object with message" });
    });

    expect(result.current.error).toBe("Object with message");
  });

  it("should use default message for unknown error types", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(123);
    });

    expect(result.current.error).toBe("Une erreur s'est produite. Veuillez réessayer.");
  });

  it("should use default message for null", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(null);
    });

    expect(result.current.error).toBe("Une erreur s'est produite. Veuillez réessayer.");
  });
});
