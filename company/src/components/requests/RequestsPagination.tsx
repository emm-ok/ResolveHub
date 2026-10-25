
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RequestsPagination as PaginationData } from "../../types/case-requests";

interface RequestsPaginationProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
    isFetching: boolean;
}

export function RequestsPagination({
    pagination,
    onPageChange,
    isFetching,
}: RequestsPaginationProps) {
    const { page, limit, total, totalPages, hasPreviousPage, hasNextPage } =
        pagination;

    const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const lastItem = Math.min(page * limit, total);

    return (
        <footer className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700">
                    {firstItem}–{lastItem}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                    {total}
                </span>{" "}
                requests
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="mr-auto text-xs text-slate-500 sm:mr-2 dark:text-slate-400">
                    Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPreviousPage || isFetching}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage || isFetching}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </div>
        </footer>
    );
}
