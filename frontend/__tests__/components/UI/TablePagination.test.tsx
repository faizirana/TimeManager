/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablePagination } from "@/components/UI/TablePagination";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left">←</span>,
  ChevronRight: () => <span data-testid="chevron-right">→</span>,
}));

// Mock Button component
jest.mock("@/components/UI/Button", () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variant} ${className}`}
      data-testid={disabled ? "button-disabled" : "button-enabled"}
    >
      {children}
    </button>
  ),
}));

describe("TablePagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onNextPage: jest.fn(),
    onPrevPage: jest.fn(),
    onGoToPage: jest.fn(),
    startItem: 1,
    endItem: 10,
    totalItems: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render pagination structure", () => {
    render(<TablePagination {...defaultProps} />);

    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
  });

  it("should disable Previous button on first page", () => {
    const { container } = render(<TablePagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByTestId("chevron-left").closest("button");
    expect(prevButton).toBeDisabled();
  });

  it("should disable Next button on last page", () => {
    const { container } = render(
      <TablePagination {...defaultProps} currentPage={10} totalPages={10} />,
    );

    const nextButton = screen.getByTestId("chevron-right").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("should call onGoToPage when clicking page number", () => {
    const onGoToPage = jest.fn();
    render(<TablePagination {...defaultProps} currentPage={5} onGoToPage={onGoToPage} />);

    const pageButton = screen.getByText("4");
    fireEvent.click(pageButton);

    expect(onGoToPage).toHaveBeenCalledWith(4);
  });

  it("should call onPrevPage when clicking Previous", () => {
    const onPrevPage = jest.fn();
    render(<TablePagination {...defaultProps} currentPage={5} onPrevPage={onPrevPage} />);

    const prevButton = screen.getByTestId("chevron-left").closest("button");
    fireEvent.click(prevButton!);

    expect(onPrevPage).toHaveBeenCalled();
  });

  it("should call onNextPage when clicking Next", () => {
    const onNextPage = jest.fn();
    render(<TablePagination {...defaultProps} currentPage={5} onNextPage={onNextPage} />);

    const nextButton = screen.getByTestId("chevron-right").closest("button");
    fireEvent.click(nextButton!);

    expect(onNextPage).toHaveBeenCalled();
  });

  it("should highlight current page", () => {
    render(<TablePagination {...defaultProps} currentPage={5} />);

    const currentPageButton = screen.getByText("5");
    expect(currentPageButton).toHaveClass("bg-[var(--color-secondary)]");
  });

  it("should show ellipsis for large page counts", () => {
    render(<TablePagination {...defaultProps} currentPage={1} totalPages={20} />);

    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("should render page numbers around current page", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={10} />);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("should show first and last page buttons", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={10} />);

    const allButtons = screen.getAllByRole("button");
    const pageButtons = allButtons.filter(
      (btn) =>
        !btn.querySelector('[data-testid="chevron-left"]') &&
        !btn.querySelector('[data-testid="chevron-right"]'),
    );

    expect(pageButtons[0]).toHaveTextContent("1");
    expect(pageButtons[pageButtons.length - 1]).toHaveTextContent("10");
  });

  it("should render correctly with totalPages = 1", () => {
    render(<TablePagination {...defaultProps} currentPage={1} totalPages={1} />);

    const prevButton = screen.getByTestId("chevron-left").closest("button");
    const nextButton = screen.getByTestId("chevron-right").closest("button");

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    // Check that page number 1 exists (could be multiple "1"s in the DOM due to display text)
    const pageButtons = screen.getAllByRole("button");
    const pageOne = pageButtons.find(
      (btn) => btn.textContent === "1" && !btn.querySelector("[data-testid]"),
    );
    expect(pageOne).toBeInTheDocument();
  });

  it("should display correct item range", () => {
    render(
      <TablePagination
        {...defaultProps}
        currentPage={2}
        startItem={11}
        endItem={20}
        totalItems={100}
      />,
    );

    expect(screen.getByText(/11/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
