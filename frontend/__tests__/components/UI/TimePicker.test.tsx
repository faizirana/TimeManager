/**
 * @fileoverview Tests for TimePicker component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimePicker } from "@/components/UI/TimePicker";

describe("TimePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render hour and minute selects", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("should render with default value 09:00", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(selects[0].value).toBe("09");
    expect(selects[1].value).toBe("00");
  });

  it("should parse and display value in HH:mm format", () => {
    render(<TimePicker value="09:30" onChange={mockOnChange} />);

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(selects[0].value).toBe("09");
    expect(selects[1].value).toBe("30");
  });

  it("should call onChange with formatted time when hour changes", () => {
    render(<TimePicker value="09:30" onChange={mockOnChange} />);

    const hourSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(hourSelect, { target: { value: "14" } });

    expect(mockOnChange).toHaveBeenCalledWith("14:30");
  });

  it("should call onChange with formatted time when minute changes", () => {
    render(<TimePicker value="09:30" onChange={mockOnChange} />);

    const minuteSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(minuteSelect, { target: { value: "45" } });

    expect(mockOnChange).toHaveBeenCalledWith("09:45");
  });

  it("should handle hour change", () => {
    render(<TimePicker value="09:30" onChange={mockOnChange} />);

    const hourSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(hourSelect, { target: { value: "10" } });

    expect(mockOnChange).toHaveBeenCalledWith("10:30");
  });

  it("should handle minute change", () => {
    render(<TimePicker value="09:30" onChange={mockOnChange} />);

    const minuteSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(minuteSelect, { target: { value: "45" } });

    expect(mockOnChange).toHaveBeenCalledWith("09:45");
  });

  it("should render 24 hour options (00-23)", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    const hourSelect = screen.getAllByRole("combobox")[0];
    const hourOptions = hourSelect.querySelectorAll("option");

    // 24 hours (00-23)
    expect(hourOptions).toHaveLength(24);
    expect(hourOptions[0].value).toBe("00");
    expect(hourOptions[23].value).toBe("23");
  });

  it("should render 60 minute options (00-59)", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    const minuteSelect = screen.getAllByRole("combobox")[1];
    const minuteOptions = minuteSelect.querySelectorAll("option");

    // 60 minutes (00-59)
    expect(minuteOptions).toHaveLength(60);
    expect(minuteOptions[0].value).toBe("00");
    expect(minuteOptions[59].value).toBe("59");
  });

  it("should apply disabled prop to both selects", () => {
    render(<TimePicker value="" onChange={mockOnChange} disabled={true} />);

    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeDisabled();
  });

  it("should not be disabled by default", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).not.toBeDisabled();
    expect(selects[1]).not.toBeDisabled();
  });

  it("should pad single digit values with zeros", () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    const hourSelect = screen.getAllByRole("combobox")[0];
    const minuteSelect = screen.getAllByRole("combobox")[1];

    fireEvent.change(hourSelect, { target: { value: "09" } });
    fireEvent.change(minuteSelect, { target: { value: "05" } });

    expect(mockOnChange).toHaveBeenCalledWith("09:05");
  });
});
