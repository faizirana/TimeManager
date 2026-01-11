import { useState } from "react";

/**
 * Hook for paginating table data.
 * @param totalItems Total number of items
 * @param itemsPerPage Number of items per page
 * @returns Pagination state and helpers
 */
export function useTablePagination(totalItems: number, itemsPerPage: number = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  function nextPage() {
    setPage((p) => Math.min(p + 1, totalPages));
  }
  function prevPage() {
    setPage((p) => Math.max(p - 1, 1));
  }
  function goToPage(n: number) {
    setPage(Math.max(1, Math.min(n, totalPages)));
  }

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return { page, totalPages, start, end, nextPage, prevPage, goToPage, setPage };
}
