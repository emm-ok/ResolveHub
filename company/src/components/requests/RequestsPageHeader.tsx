
import { motion, useReducedMotion } from "framer-motion";
import { FileText, RefreshCw } from "lucide-react";

interface RequestsPageHeaderProps {
    total: number;
    isFetching: boolean;
    onRefresh: () => void;
}

export function RequestsPageHeader({
    total,
    isFetching,
    onRefresh,
}: RequestsPageHeaderProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <FileText size={16} aria-hidden="true" />
                    <span>Request management</span>
                </div>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Customer requests
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Review incoming requests, track their status, and open a request
                    to see its full description.
                </p>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold tabular-nums">
                        {total.toLocaleString()}
                    </span>{" "}
                    {total === 1 ? "request" : "requests"} found
                </p>
            </div>

            <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
                <RefreshCw
                    size={16}
                    className={isFetching ? "animate-spin" : ""}
                    aria-hidden="true"
                />
                Refresh
            </button>
        </motion.header>
    );
}
