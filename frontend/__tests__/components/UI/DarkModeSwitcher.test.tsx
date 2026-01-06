import { render, screen, fireEvent } from "@testing-library/react";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import React from "react";

/**
 * jsdom does not provide matchMedia → minimal mock
 */
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("DarkModeSwitcher", () => {
  it("should render a SidebarItem button", () => {
    render(<DarkModeSwitcher />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should enable dark mode if theme is stored as dark", () => {
    localStorage.setItem("theme", "dark");

    render(<DarkModeSwitcher />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should disable dark mode if theme is stored as light", () => {
    localStorage.setItem("theme", "light");

    render(<DarkModeSwitcher />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should toggle dark mode when clicking the SidebarItem", () => {
    render(<DarkModeSwitcher />);

    const button = screen.getByRole("button");

    // Activate dark mode
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    // Deactivate dark mode
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("should render an icon inside SidebarItem", () => {
    render(<DarkModeSwitcher />);

    // Lucide icons are rendered as <svg />
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
