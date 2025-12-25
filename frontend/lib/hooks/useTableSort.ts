import { useState } from "react";

export function useTableSort<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleSort = (column: keyof T, customCompare?: (a: T, b: T) => number) => {
    let direction: "asc" | "desc" = "asc";

    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
    }

    const sorted = [...data].sort((a, b) => {
      // Si une fonction de comparaison personnalisée est fournie
      if (customCompare) {
        return direction === "asc" ? customCompare(a, b) : customCompare(b, a);
      }

      // Comparaison par défaut
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setData(sorted);
    setSortColumn(column);
    setSortDirection(direction);
  };

  return { data, sortColumn, sortDirection, handleSort };
}
