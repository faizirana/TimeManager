/**
 * TablePagination Component
 * Provides pagination controls for tables
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onNextPage - Handler for next page button
 * @param {Function} props.onPrevPage - Handler for previous page button
 * @param {Function} props.onGoToPage - Handler for going to specific page
 * @param {number} props.startItem - Index of first item on current page
 * @param {number} props.endItem - Index of last item on current page
 * @param {number} props.totalItems - Total number of items
 *
 * @example
 * ```tsx
 * <TablePagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onNextPage={nextPage}
 *   onPrevPage={prevPage}
 *   onGoToPage={goToPage}
 *   startItem={start}
 *   endItem={end}
 *   totalItems={data.length}
 * />
 * ```
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  startItem: number;
  endItem: number;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onGoToPage,
  startItem,
  endItem,
  totalItems,
}: TablePaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      {/* Items count */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Affichage de <span className="font-medium">{startItem}</span> à{" "}
        <span className="font-medium">{endItem}</span> sur{" "}
        <span className="font-medium">{totalItems}</span> résultats
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          variant="outline"
          className="px-3 py-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onGoToPage(pageNum)}
                disabled={isActive}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors
                  ${
                    isActive
                      ? "bg-[var(--color-secondary)] text-white font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                  ${isActive ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="px-3 py-1 text-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
