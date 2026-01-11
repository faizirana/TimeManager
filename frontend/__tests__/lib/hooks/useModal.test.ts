/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useModal } from "@/lib/hooks/useModal";

describe("useModal", () => {
  it("should initialize with closed state", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open modal", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("should close modal", () => {
    const { result } = renderHook(() => useModal());

    // First open it
    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);

    // Then close it
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle modal state", () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should have stable function references", () => {
    const { result, rerender } = renderHook(() => useModal());

    const initialOpen = result.current.open;
    const initialClose = result.current.close;
    const initialToggle = result.current.toggle;

    rerender();

    expect(result.current.open).toBe(initialOpen);
    expect(result.current.close).toBe(initialClose);
    expect(result.current.toggle).toBe(initialToggle);
  });
});
