/**
 * Jest Setup File
 *
 * This file is executed before each test suite.
 * It configures the global test environment.
 */

// Import custom matchers from testing-library
import "@testing-library/jest-dom";

/**
 * Mock window.matchMedia
 * Necessary because jsdom doesn't implement it natively
 * and some components (like those handling responsive design) need it
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mock IntersectionObserver
 * Used by some components to detect visibility
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

/**
 * Global fetch mock configuration
 * Removes warnings if fetch is not mocked in a test
 */
if (typeof global.fetch === "undefined") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
      text: async () => "",
    }),
  ) as jest.Mock;
}
