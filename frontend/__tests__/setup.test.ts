/**
 * Health check test to verify Jest is properly configured
 */
describe("Jest Configuration", () => {
  it("should run tests", () => {
    expect(true).toBe(true);
  });

  it("should support TypeScript", () => {
    const name: string = "Test";
    expect(name).toBe("Test");
  });

  it("should have @testing-library/jest-dom matchers", () => {
    const element = document.createElement("div");
    element.textContent = "Hello World";
    document.body.appendChild(element);
    expect(element).toBeInTheDocument();
    document.body.removeChild(element);
  });
});
