export function CompanyCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="relative flex h-full min-w-0 animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
        >
            {/* Accent strip */}
            <div className="h-[3px] bg-slate-100" />

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Company identity */}
                <div className="flex items-start gap-4">
                    <div className="size-[60px] shrink-0 rounded-2xl border border-slate-100 bg-slate-100" />

                    <div className="min-w-0 flex-1 space-y-2.5 pt-1">
                        <div className="h-4 w-4/5 rounded-md bg-slate-100" />
                        <div className="h-3 w-2/5 rounded-md bg-slate-50" />
                    </div>

                    <div className="size-4 shrink-0 rounded-full bg-slate-100" />
                </div>

                {/* Availability */}
                <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="h-7 w-36 max-w-[70%] rounded-full bg-emerald-50" />
                    <div className="h-2.5 w-12 rounded bg-slate-100" />
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-slate-100" />

                {/* Supporting content */}
                <div className="flex gap-2.5">
                    <div className="size-7 shrink-0 rounded-lg bg-slate-100" />

                    <div className="flex-1 space-y-2 pt-0.5">
                        <div className="h-3 w-2/5 rounded bg-slate-100" />
                        <div className="h-3 w-full rounded bg-slate-50" />
                        <div className="h-3 w-4/5 rounded bg-slate-50" />
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-6">
                    <div className="h-11 rounded-xl bg-slate-100" />
                    <div className="mx-auto mt-3 h-2.5 w-32 rounded bg-slate-50" />
                </div>
            </div>
        </div>
    );
}

export function CompanyGridSkeleton() {
    return (
        <div
            aria-label="Loading companies"
            aria-busy="true"
            className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
        >
            {Array.from({ length: 6 }, (_, index) => (
                <CompanyCardSkeleton key={index} />
            ))}

            <span className="sr-only">Loading companies…</span>
        </div>
    );
}
