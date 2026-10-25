
import { FileSearch, SearchX } from "lucide-react";

interface RequestsEmptyStateProps {
    hasFilters: boolean;
    onClearFilters: () => void;
}

export function RequestsEmptyState({
    hasFilters,
    onClearFilters,
}: RequestsEmptyStateProps) {
    const Icon = hasFilters ? SearchX : FileSearch;

    return (
        <div className="flex flex-col items-center px-5 py-14 text-center sm:py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200">
                <Icon size={24} aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-base font-semibold text-slate-900">
                {hasFilters ? "No matching requests" : "No requests yet"}
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                {hasFilters
                    ? "Try another search term or change your filters to see more requests."
                    : "Customer requests will appear here when customers submit them to your company."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
