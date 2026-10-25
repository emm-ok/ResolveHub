
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { SortOrder } from "../../types/case-requests";

interface RequestFiltersProps {
    search: string;
    status: string;
    sortOrder: SortOrder;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSortChange: (value: SortOrder) => void;
    onClear: () => void;
}

export function RequestFilters({
    search,
    status,
    sortOrder,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onClear,
}: RequestFiltersProps) {
    const hasFilters = Boolean(search || status || sortOrder !== "desc");

    return (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative block min-w-0 flex-1">
                    <span className="sr-only">Search requests</span>
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search by request number or title..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    )}
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
                    <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10">
                        <SlidersHorizontal
                            size={15}
                            className="shrink-0 text-slate-400"
                            aria-hidden="true"
                        />
                        <span className="sr-only">Filter by status</span>
                        <select
                            value={status}
                            onChange={(event) => onStatusChange(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
                        >
                            <option value="">All statuses</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under review</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </label>

                    <label className="flex h-11 items-center rounded-xl border border-slate-200 px-3 dark:border-white/10">
                        <span className="sr-only">Sort by submission date</span>
                        <select
                            value={sortOrder}
                            onChange={(event) =>
                                onSortChange(event.target.value as SortOrder)
                            }
                            className="w-full bg-transparent text-sm text-slate-700 outline-none"
                        >
                            <option value="desc">Newest first</option>
                            <option value="asc">Oldest first</option>
                        </select>
                    </label>
                </div>
            </div>

            {hasFilters && (
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </section>
    );
}
