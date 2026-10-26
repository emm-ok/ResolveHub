
import { AlertCircle, BriefcaseBusiness, RefreshCw } from "lucide-react";

export function CasesTableSkeleton() {
    return (
        <div className="animate-pulse divide-y divide-neutral-100" aria-label="Loading cases">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-5 px-5 py-5">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-neutral-100" />
                        <div className="h-3 w-1/5 rounded bg-neutral-100" />
                    </div>
                    <div className="hidden h-6 w-24 rounded-full bg-neutral-100 sm:block" />
                    <div className="h-8 w-16 rounded-lg bg-neutral-100" />
                </div>
            ))}
        </div>
    );
}

export function CasesErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <AlertCircle size={22} className="text-neutral-700" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-black">
                We couldn't load the cases
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
                <RefreshCw size={15} />
                Try again
            </button>
        </div>
    );
}

export function CasesEmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <BriefcaseBusiness size={24} className="text-neutral-600" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-black">
                {hasFilters ? "No matching cases" : "No cases yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                {hasFilters
                    ? "Try changing your search or filters to find the case you're looking for."
                    : "Cases created from accepted requests will appear here."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
