/**
 * @fileoverview Tests for Select component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "@/components/UI/Select";

describe("Select", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with children options", () => {
    render(
      <Select value="" onChange={mockOnChange}>
        <option value="">Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render all options", () => {
    render(
      <Select value="" onChange={mockOnChange}>
        <option value="">Select</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should call onChange when option is selected", () => {
    render(
      <Select value="" onChange={mockOnChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should display selected value", () => {
    render(
      <Select value="2" onChange={mockOnChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("2");
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <Select value="" onChange={mockOnChange} disabled={true}>
        <option value="1">Option 1</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("should not be disabled when disabled prop is false", () => {
    render(
      <Select value="" onChange={mockOnChange} disabled={false}>
        <option value="1">Option 1</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");
    expect(select).not.toBeDisabled();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Select value="" onChange={mockOnChange} className="custom-select">
        <option value="1">Option 1</option>
      </Select>,
    );

    const select = container.querySelector(".custom-select");
    expect(select).toBeInTheDocument();
  });

  it("should render with no children", () => {
    render(<Select value="" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });
});
