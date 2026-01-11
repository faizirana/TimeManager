/**
 * @fileoverview Reusable table components
 *
 * Provides a set of composable components to build sortable, interactive tables:
 * - Table: Main wrapper with horizontal scroll support
 * - TableHeader/TableBody: Semantic table sections
 * - TableRow: Row with optional click handler
 * - TableHead: Header cell with optional sorting functionality
 * - TableCell: Data cell for table content
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead sortable sortDirection="asc" onSort={() => handleSort("name")}>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow onClick={() => navigate('/user/1')}>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */

import { ReactNode } from "react";
import { ArrowDownUp, LucideIcon } from "lucide-react";

/**
 * Props for the main Table wrapper component
 */
interface TableProps {
  /** Table content (typically TableHeader and TableBody) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TableHeader component
 */
interface TableHeaderProps {
  /** Header content (typically TableRow with TableHead cells) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TableBody component
 */
interface TableBodyProps {
  /** Body content (typically multiple TableRow components) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TableRow component
 */
interface TableRowProps {
  /** Row content (typically TableHead or TableCell components) */
  children: ReactNode;
  /** Optional click handler - makes row interactive */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TableHead component (header cell)
 */
interface TableHeadProps {
  /** Header cell content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Current sort direction for this column */
  sortDirection?: "asc" | "desc" | null;
  /** Callback when header is clicked (if sortable) */
  onSort?: () => void;
  /** Custom icons for sort states */
  sortIcons?: {
    asc: LucideIcon;
    desc: LucideIcon;
    default?: LucideIcon;
  };
}

/**
 * Props for TableCell component (data cell)
 */
interface TableCellProps {
  /** Cell content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main table wrapper component with horizontal scroll support
 *
 * @param {TableProps} props - Component props
 * @returns {JSX.Element} Scrollable table container
 */
export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full rounded-lg">
      <div className="overflow-x-auto">
        <table className={`w-full ${className}`}>{children}</table>
      </div>
    </div>
  );
}

/**
 * Table header section component
 *
 * @param {TableHeaderProps} props - Component props
 * @returns {JSX.Element} Styled thead element
 */
export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-[var(--surface)] border-b border-[var(--border)] ${className}`}>
      {children}
    </thead>
  );
}

/**
 * Table body section component
 *
 * @param {TableBodyProps} props - Component props
 * @returns {JSX.Element} tbody element
 */
export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

/**
 * Table row component with optional click interaction
 *
 * @param {TableRowProps} props - Component props
 * @returns {JSX.Element} Interactive or static table row
 *
 * Features:
 * - Automatically adds hover effect and cursor when onClick is provided
 * - Maintains consistent border styling
 */
export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[var(--border)] ${onClick ? "hover:bg-[var(--surface-hover)] cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

/**
 * Table header cell component with optional sorting functionality
 *
 * @param {TableHeadProps} props - Component props
 * @returns {JSX.Element} Sortable or static header cell
 *
 * Features:
 * - Displays sort icon when sortable
 * - Shows current sort direction with appropriate icon
 * - Handles click events for sorting
 * - Prevents text selection when sortable
 *
 * @example
 * ```tsx
 * <TableHead
 *   sortable
 *   sortDirection="asc"
 *   onSort={() => handleSort("name")}
 * >
 *   Name
 * </TableHead>
 * ```
 */
export function TableHead({
  children,
  className = "",
  sortable = false,
  sortDirection = null,
  onSort,
  sortIcons,
}: TableHeadProps) {
  // Default icons for all sort states
  const defaultIcons = {
    asc: ArrowDownUp,
    desc: ArrowDownUp,
    default: ArrowDownUp,
  };

  const icons = sortIcons ?? defaultIcons;

  // Select icon based on current sort direction
  const IconComponent =
    sortDirection === "asc"
      ? icons.asc
      : sortDirection === "desc"
        ? icons.desc
        : (icons.default ?? ArrowDownUp);

  return (
    <th
      className={`px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)] ${sortable ? "cursor-pointer hover:bg-[var(--surface-hover)] select-none" : ""} ${className}`}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && <IconComponent size={16} className="text-[var(--muted)]" />}
      </div>
    </th>
  );
}

/**
 * Table data cell component
 *
 * @param {TableCellProps} props - Component props
 * @returns {JSX.Element} Styled table cell
 */
export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-6 py-5 text-[var(--foreground)] ${className}`}>{children}</td>;
}
