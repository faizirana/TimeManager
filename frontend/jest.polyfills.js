/**
 * Polyfill requestSubmit for HTMLFormElement
 * This is necessary because jsdom (used by Jest) does not implement it natively
 */
const Form =
  globalThis.HTMLFormElement || (typeof window !== "undefined" && window.HTMLFormElement);
if (Form) {
  // Suppress noisy jsdom "Not implemented" error for requestSubmit
  // jsdom reports certain unimplemented DOM methods via console.error which
  // pollutes test output even when we polyfill or handle the behavior.
  // We filter that specific message here to keep test logs clean.
  const _origConsoleError = console.error.bind(console);
  console.error = (...args) => {
    try {
      // If the message is the jsdom not-implemented string, drop it
      if (args && args.length > 0) {
        const first = args[0];
        if (
          typeof first === "string" &&
          first.includes("Not implemented: HTMLFormElement.prototype.requestSubmit")
        ) {
          return;
        }
        // Sometimes jsdom may pass an Error-like object; inspect its message
        if (first && typeof first === "object" && (first.message || first.type)) {
          const m = String(first.message || first.type || first);
          if (m.includes("Not implemented") && m.includes("requestSubmit")) return;
        }
      }
    } catch (e) {
      // If our filter throws, fall back to original console.error
      return _origConsoleError(...args);
    }
    return _origConsoleError(...args);
  };
  // Keep a reference to any existing implementation
  const existing = Form.prototype.requestSubmit;

  // Define a robust polyfill that will:
  // 1) Try to call the original implementation (if present)
  // 2) If it throws (jsdom often throws "Not implemented"), fallback to submit()
  // 3) Always ensure a callable requestSubmit exists for tests
  Object.defineProperty(Form.prototype, "requestSubmit", {
    configurable: true,
    writable: true,
    value: function requestSubmitPolyfill(...args) {
      // Debug log can be enabled temporarily if you need to trace execution
      // console.log('[jest.polyfills] requestSubmit invoked');
      if (typeof existing === "function") {
        try {
          return existing.apply(this, args);
        } catch (err) {
          // If the existing impl throws (e.g. jsdom "Not implemented"), continue to fallback
        }
      }

      if (typeof this.submit === "function") {
        return this.submit();
      }

      // If no submit function exists, do nothing
      return undefined;
    },
  });
}

/**
 * Polyfill TextEncoder and TextDecoder for jsdom
 * These are needed for jose library which uses Web Crypto API
 */
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
