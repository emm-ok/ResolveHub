"use client";

interface CompanyPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    isFetching: boolean;
}

export function CompanyPagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    isFetching,
}: CompanyPaginationProps) {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <nav
            aria-label="Company pagination"
            className="flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <p
                aria-live="polite"
                className="text-sm text-neutral-500"
            >
                Showing {start}–{end} of {total} companies
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || isFetching}
                    className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <span className="min-w-20 text-center text-sm text-neutral-600">
                    Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={
                        page >= totalPages ||
                        totalPages === 0 ||
                        isFetching
                    }
                    className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </nav>
    );
}