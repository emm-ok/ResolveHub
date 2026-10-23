"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface RequestsPaginationProps {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    isFetching?: boolean;
}

export function RequestsPagination({
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    isFetching = false,
}: RequestsPaginationProps) {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">{start}–{end}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-800">{total}</span>
                {" "}requests
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs text-slate-400">
                    Page {page} of {Math.max(totalPages, 1)}
                </span>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={!hasPreviousPage || isFetching}
                        aria-label="Previous page"
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={15} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={!hasNextPage || isFetching}
                        aria-label="Next page"
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}