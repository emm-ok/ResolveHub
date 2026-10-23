export function RequestsTableSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading requests"
            className="animate-pulse"
        >
            <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-4 md:grid md:grid-cols-5 md:gap-5">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="h-3 rounded bg-slate-200"
                    />
                ))}
            </div>

            {Array.from({ length: 5 }, (_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 border-b border-slate-100 px-4 py-5 sm:px-6"
                >
                    <div className="size-10 shrink-0 rounded-xl bg-slate-200" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                    </div>

                    <div className="hidden h-5 w-20 rounded-full bg-slate-200 md:block" />
                    <div className="hidden h-8 w-8 rounded-lg bg-slate-100 md:block" />
                </div>
            ))}

            <span className="sr-only">Loading your requests…</span>
        </div>
    );
}