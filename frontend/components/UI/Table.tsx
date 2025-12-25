import { ReactNode } from "react";
import { ArrowDownUp, LucideIcon } from "lucide-react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  sortIcons?: {
    asc: LucideIcon;
    desc: LucideIcon;
    default?: LucideIcon;
  };
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-200 ${onClick ? "hover:bg-gray-50 cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
  sortable = false,
  sortDirection = null,
  onSort,
  sortIcons,
}: TableHeadProps) {
  // Icônes par défaut
  const defaultIcons = {
    asc: ArrowDownUp,
    desc: ArrowDownUp,
    default: ArrowDownUp,
  };

  const icons = sortIcons ?? defaultIcons;

  // Sélectionner l'icône en fonction de la direction
  const IconComponent =
    sortDirection === "asc"
      ? icons.asc
      : sortDirection === "desc"
        ? icons.desc
        : (icons.default ?? ArrowDownUp);

  return (
    <th
      className={`px-6 py-3 text-left text-sm font-medium text-gray-600 ${sortable ? "cursor-pointer hover:bg-gray-100 select-none" : ""} ${className}`}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && <IconComponent size={16} className="text-gray-400" />}
      </div>
    </th>
  );
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-6 py-4 text-gray-700 ${className}`}>{children}</td>;
}
