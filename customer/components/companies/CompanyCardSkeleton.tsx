export function CompanyCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5"
        >
            <div className="flex items-center gap-3">
                <div className="size-14 rounded-xl bg-neutral-100" />

                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-neutral-100" />
                    <div className="h-3 w-1/2 rounded bg-neutral-100" />
                </div>
            </div>

            <div className="mt-6 h-3 w-1/3 rounded bg-neutral-100" />
            <div className="mt-6 h-10 rounded-xl bg-neutral-100" />
        </div>
    );
}

export function CompanyGridSkeleton() {
    return (
        <div
            aria-label="Loading companies"
            aria-busy="true"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
            {Array.from({ length: 6 }, (_, index) => (
                <CompanyCardSkeleton key={index} />
            ))}
        </div>
    );
}