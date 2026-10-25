
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CalendarDays, FileText } from "lucide-react";
import type { CaseRequest } from "../../types/case-requests";
import { RequestStatusBadge } from "./RequestStatusBadge";

interface RequestCardProps {
    request: CaseRequest;
    index: number;
    onSelect: (requestId: string) => void;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function RequestCard({
    request,
    index,
    onSelect,
}: RequestCardProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.button
            type="button"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reduceMotion ? 0 : 0.2,
                delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.15),
            }}
            onClick={() => onSelect(request.id)}
            className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-5 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-white/[0.025]"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    <FileText size={18} aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                        {request.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {request.requestNumber}
                    </p>
                </div>

                <ArrowUpRight
                    size={17}
                    className="shrink-0 text-slate-400"
                    aria-hidden="true"
                />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <RequestStatusBadge status={request.status} />
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays size={14} aria-hidden="true" />
                    {formatDate(request.createdAt)}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">
                    Last updated {formatDate(request.updatedAt)}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                    View details
                </span>
            </div>
        </motion.button>
    );
}
