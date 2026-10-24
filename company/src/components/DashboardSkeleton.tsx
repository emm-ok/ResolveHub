
export default function DashboardSkeleton() {
    return (
        <div
            aria-label="Loading company dashboard"
            aria-busy="true"
            className="animate-pulse space-y-6"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                        <div className="flex justify-between">
                            <div className="h-3 w-28 rounded bg-slate-100" />
                            <div className="size-10 rounded-xl bg-slate-100" />
                        </div>
                        <div className="mt-5 h-8 w-20 rounded bg-slate-100" />
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <div className="h-3 w-36 rounded bg-slate-50" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-6">
                    <div className="h-4 w-36 rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-60 max-w-full rounded bg-slate-50" />
                </div>
                {Array.from({ length: 5 }, (_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 border-b border-slate-50 p-5 last:border-0"
                    >
                        <div className="size-9 rounded-xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-2/5 rounded bg-slate-100" />
                            <div className="h-3 w-1/4 rounded bg-slate-50" />
                        </div>
                        <div className="h-6 w-20 rounded-full bg-slate-100" />
                    </div>
                ))}
            </div>

            <span className="sr-only">Loading dashboard information…</span>
        </div>
    );
}
