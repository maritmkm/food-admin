'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalResults === 0 || totalPages <= 0) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalResults);

  // Helper to generate page numbers with ellipsis (...) matching design image
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pt-6 mt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500 select-none">
      {/* Left side text matching image: Showing 1 to 5 of 97 results */}
      <div>
        Showing <span className="font-extrabold text-[#111827]">{startIndex}</span> to{' '}
        <span className="font-extrabold text-[#111827]">{endIndex}</span> of{' '}
        <span className="font-extrabold text-[#111827]">{totalResults}</span> results
      </div>

      {/* Right side pagination control box matching image: [<] [1] [2] [3] [...] [8] [9] [10] [>] */}
      <div className="flex items-center rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 border-r border-zinc-200 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page Buttons */}
        {pageNumbers.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-3 py-2 border-r border-zinc-200 text-zinc-400 font-semibold select-none bg-zinc-50/50"
              >
                ...
              </span>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`px-3.5 py-2 border-r border-zinc-200 font-bold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#BBD915] text-[#111827]'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
