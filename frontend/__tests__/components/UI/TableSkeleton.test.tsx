import { render } from "@testing-library/react";
import { TableSkeleton } from "@/components/UI/TableSkeleton";

describe("TableSkeleton", () => {
  it("should render with default props (5 rows, 3 columns)", () => {
    const { container } = render(<TableSkeleton />);
    // TableSkeleton renders divs, not table elements
    const rows = container.querySelectorAll(".border-b.border-\\[var\\(--border\\)\\].px-6.py-5");
    expect(rows).toHaveLength(5);
  });

  it("should render with custom number of rows", () => {
    const { container } = render(<TableSkeleton rows={8} />);
    const rows = container.querySelectorAll(".border-b.border-\\[var\\(--border\\)\\].px-6.py-5");
    expect(rows).toHaveLength(8);
  });

  it("should render with custom number of columns", () => {
    const { container } = render(<TableSkeleton columns={5} />);
    // Check header columns
    const headerContainer = container.querySelector(".bg-\\[var\\(--surface\\)\\]");
    const headerColumns = headerContainer?.querySelectorAll(".flex-1");
    expect(headerColumns).toHaveLength(5);
  });

  it("should render with custom rows and columns", () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);
    const rows = container.querySelectorAll(".border-b.border-\\[var\\(--border\\)\\].px-6.py-5");
    expect(rows).toHaveLength(3);

    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll(".flex-1");
    expect(cells).toHaveLength(4);
  });

  it("should have animate-pulse class on skeleton elements", () => {
    const { container } = render(<TableSkeleton />);
    const animatedElement = container.querySelector(".animate-pulse");
    expect(animatedElement).toBeInTheDocument();
  });

  it("should render header skeleton", () => {
    const { container } = render(<TableSkeleton columns={3} />);
    const headerContainer = container.querySelector(".bg-\\[var\\(--surface\\)\\]");
    expect(headerContainer).toBeInTheDocument();

    const headerColumns = headerContainer?.querySelectorAll(".flex-1");
    expect(headerColumns).toHaveLength(3);
  });

  it("should render skeleton cells in each row", () => {
    const { container } = render(<TableSkeleton rows={2} columns={3} />);
    const rows = container.querySelectorAll(".border-b.border-\\[var\\(--border\\)\\].px-6.py-5");
    expect(rows).toHaveLength(2);

    rows.forEach((row) => {
      const cells = row.querySelectorAll(".flex-1");
      expect(cells).toHaveLength(3);
    });
  });

  it("should render as a div element with animate-pulse", () => {
    const { container } = render(<TableSkeleton />);
    const skeletonContainer = container.querySelector(".animate-pulse");
    expect(skeletonContainer).toBeInTheDocument();
    expect(skeletonContainer?.tagName).toBe("DIV");
  });
});
