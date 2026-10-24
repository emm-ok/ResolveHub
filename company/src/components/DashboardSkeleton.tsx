
export function DashboardSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading company dashboard"
            className="space-y-8"
        >
            <span className="sr-only">Loading company dashboard…</span>

            <div className="animate-pulse space-y-3">
                <div className="h-3 w-28 rounded bg-slate-200 dark:bg-white/10" />
                <div className="h-8 w-64 max-w-full rounded-lg bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-80 max-w-full rounded bg-slate-100 dark:bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900"
                    >
                        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="mt-5 h-9 w-16 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="mt-5 h-3 w-36 rounded bg-slate-100 dark:bg-white/5" />
                    </div>
                ))}
            </div>

            <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
                <div className="h-5 w-40 rounded bg-slate-200 dark:bg-white/10" />
                <div className="mt-6 space-y-5">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                                <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
