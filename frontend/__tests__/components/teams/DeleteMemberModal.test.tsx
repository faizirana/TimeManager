/**
 * @fileoverview Tests for DeleteMemberModal component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteMemberModal } from "@/components/teams/DeleteMemberModal";

describe("DeleteMemberModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <DeleteMemberModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    expect(screen.queryByText("Retirer un membre")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    expect(screen.getByText("Retirer un membre")).toBeInTheDocument();
  });

  it("should display member name in confirmation message", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("should display irreversible action warning", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    expect(screen.getByText("Cette action est irréversible")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should call onConfirm when delete button is clicked", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1); // Also closes
  });

  it("should disable buttons when isLoading is true", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={true}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    const deleteButton = screen.getByText("Supprimer");

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("should keep same text when isLoading is true", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={true}
      />,
    );

    expect(screen.getByText("Supprimer")).toBeInTheDocument();
    expect(screen.queryByText("Suppression...")).not.toBeInTheDocument();
  });

  it("should render AlertTriangle icon", () => {
    const { container } = render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have destructive styling on delete button", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    const deleteButton = screen.getByText("Supprimer");
    expect(deleteButton.className).toContain("bg-red-600");
  });

  it("should have outline styling on cancel button", () => {
    render(
      <DeleteMemberModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        memberName="John Doe"
        isLoading={false}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    expect(cancelButton.className).toContain("border");
  });
});
