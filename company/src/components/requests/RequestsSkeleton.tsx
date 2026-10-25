
export function RequestsSkeleton() {
    return (
        <div role="status" aria-label="Loading requests" className="space-y-3">
            <span className="sr-only">Loading requests…</span>

            <div className="hidden animate-pulse md:block">
                <div className="h-12 rounded-t-xl bg-slate-100 dark:bg-white/5" />
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-5 border-b border-slate-100 px-6 py-5 dark:border-white/10"
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-48 max-w-full rounded bg-slate-200 dark:bg-white/10" />
                            <div className="h-3 w-28 rounded bg-slate-100 dark:bg-white/5" />
                        </div>
                        <div className="h-6 w-24 rounded-full bg-slate-100 dark:bg-white/5" />
                        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-white/5" />
                    </div>
                ))}
            </div>

            <div className="space-y-3 md:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"
                    >
                        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="mt-3 h-3 w-1/3 rounded bg-slate-100 dark:bg-white/5" />
                        <div className="mt-5 h-6 w-24 rounded-full bg-slate-100 dark:bg-white/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}
