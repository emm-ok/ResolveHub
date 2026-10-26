
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CasesPagination as PaginationData } from "../../types/case";

interface Props {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export function CasesPagination({
    pagination,
    onPageChange,
}: Props) {
    const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } =
        pagination;

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-800">{start}–{end}</span>{" "}
                of <span className="font-medium text-neutral-800">{total}</span> cases
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={!hasPreviousPage}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>

                <span className="px-2 text-xs text-neutral-500">
                    Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
