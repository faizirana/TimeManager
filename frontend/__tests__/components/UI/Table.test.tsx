import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/UI/Table";
import { ArrowUp, ArrowDown } from "lucide-react";

describe("Table Components", () => {
  describe("Table", () => {
    it("should render a table element", () => {
      const { container } = render(
        <Table>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>,
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Table className="custom-class">
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>,
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("custom-class");
    });

    it("should render children", () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Test Content</td>
            </tr>
          </tbody>
        </Table>,
      );
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("TableHeader", () => {
    it("should render a thead element", () => {
      const { container } = render(
        <table>
          <TableHeader>
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </table>,
      );
      const thead = container.querySelector("thead");
      expect(thead).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <table>
          <TableHeader className="custom-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </table>,
      );
      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("custom-header");
    });

    it("should render children", () => {
      render(
        <table>
          <TableHeader>
            <tr>
              <th>Header Content</th>
            </tr>
          </TableHeader>
        </table>,
      );
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });
  });

  describe("TableBody", () => {
    it("should render a tbody element", () => {
      const { container } = render(
        <table>
          <TableBody>
            <tr>
              <td>Body</td>
            </tr>
          </TableBody>
        </table>,
      );
      const tbody = container.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <table>
          <TableBody className="custom-body">
            <tr>
              <td>Body</td>
            </tr>
          </TableBody>
        </table>,
      );
      const tbody = container.querySelector("tbody");
      expect(tbody).toHaveClass("custom-body");
    });

    it("should render children", () => {
      render(
        <table>
          <TableBody>
            <tr>
              <td>Body Content</td>
            </tr>
          </TableBody>
        </table>,
      );
      expect(screen.getByText("Body Content")).toBeInTheDocument();
    });
  });

  describe("TableRow", () => {
    it("should render a tr element", () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow>
              <td>Row</td>
            </TableRow>
          </tbody>
        </table>,
      );
      const tr = container.querySelector("tr");
      expect(tr).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow className="custom-row">
              <td>Row</td>
            </TableRow>
          </tbody>
        </table>,
      );
      const tr = container.querySelector("tr");
      expect(tr).toHaveClass("custom-row");
    });

    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const { container } = render(
        <table>
          <tbody>
            <TableRow onClick={handleClick}>
              <td>Clickable Row</td>
            </TableRow>
          </tbody>
        </table>,
      );
      const tr = container.querySelector("tr");
      await user.click(tr!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should add hover class when onClick is provided", () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow onClick={() => {}}>
              <td>Row</td>
            </TableRow>
          </tbody>
        </table>,
      );
      const tr = container.querySelector("tr");
      expect(tr).toHaveClass("hover:bg-[var(--surface-hover)]", "cursor-pointer");
    });

    it("should not add hover class when onClick is not provided", () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow>
              <td>Row</td>
            </TableRow>
          </tbody>
        </table>,
      );
      const tr = container.querySelector("tr");
      expect(tr).not.toHaveClass("hover:bg-[var(--surface-hover)]");
      expect(tr).not.toHaveClass("cursor-pointer");
    });

    it("should render children", () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <td>Row Content</td>
            </TableRow>
          </tbody>
        </table>,
      );
      expect(screen.getByText("Row Content")).toBeInTheDocument();
    });
  });

  describe("TableHead", () => {
    it("should render a th element", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      expect(th).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead className="custom-head">Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      expect(th).toHaveClass("custom-head");
    });

    it("should render children", () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead>Header Content</TableHead>
            </tr>
          </thead>
        </table>,
      );
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("should not be sortable by default", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      expect(th).not.toHaveClass("cursor-pointer");
    });

    it("should add sortable classes when sortable is true", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable onSort={() => {}}>
                Sortable Header
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      expect(th).toHaveClass("cursor-pointer", "hover:bg-[var(--surface-hover)]", "select-none");
    });

    it("should call onSort when sortable header is clicked", async () => {
      const user = userEvent.setup();
      const handleSort = jest.fn();
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable onSort={handleSort}>
                Sortable
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      await user.click(th!);
      expect(handleSort).toHaveBeenCalledTimes(1);
    });

    it("should not call onSort when header is not sortable", async () => {
      const user = userEvent.setup();
      const handleSort = jest.fn();
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead onSort={handleSort}>Not Sortable</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = container.querySelector("th");
      await user.click(th!);
      expect(handleSort).not.toHaveBeenCalled();
    });

    it("should render sort icon when sortable", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable onSort={() => {}}>
                Sortable
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should not render sort icon when not sortable", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Not Sortable</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const svg = container.querySelector("svg");
      expect(svg).not.toBeInTheDocument();
    });

    it("should use custom sort icons when provided", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead
                sortable
                sortDirection="asc"
                onSort={() => {}}
                sortIcons={{ asc: ArrowUp, desc: ArrowDown }}
              >
                Custom Icons
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("TableCell", () => {
    it("should render a td element", () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = container.querySelector("td");
      expect(td).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell">Cell</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = container.querySelector("td");
      expect(td).toHaveClass("custom-cell");
    });

    it("should render children", () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      expect(screen.getByText("Cell Content")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should render a complete table with all components", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable onSort={() => {}}>
                Name
              </TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow onClick={() => {}}>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
            <TableRow onClick={() => {}}>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });
});
