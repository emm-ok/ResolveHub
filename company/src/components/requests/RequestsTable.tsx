
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileText } from "lucide-react";
import type { CaseRequest } from "../../types/case-requests";
import { RequestStatusBadge } from "./RequestStatusBadge";

interface RequestsTableProps {
    requests: CaseRequest[];
    onSelect: (requestId: string) => void;
}

function formatDate(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function RequestsTable({
    requests,
    onSelect,
}: RequestsTableProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
                <thead className="">
                    <tr>
                        {["Request", "Status", "Submitted", "Last updated", "Reviewed", ""].map(
                            (heading) => (
                                <th
                                    key={heading || "action"}
                                    className="whitespace-nowrap px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 first:pl-6 last:pr-6 dark:text-slate-400"
                                >
                                    {heading}
                                </th>
                            ),
                        )}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {requests.map((request, index) => (
                        <motion.tr
                            key={request.id}
                            initial={
                                reduceMotion ? false : { opacity: 0, y: 5 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.2,
                                delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.15),
                            }}
                            className="group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
                            onClick={() => onSelect(request.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelect(request.id);
                                }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View request ${request.requestNumber}: ${request.title}`}
                        >
                            <td className="max-w-[320px] px-5 py-4 pl-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors group-hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                                        <FileText size={17} aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {request.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {request.requestNumber}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <RequestStatusBadge status={request.status} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-500">
                                {formatDate(request.createdAt)}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-500">
                                {formatDate(request.updatedAt)}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-500">
                                {formatDate(request.reviewedAt)}
                            </td>

                            <td className="px-5 py-4 pr-6 text-right">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:bg-white group-hover:text-slate-900 dark:group-hover:bg-white/10">
                                    <ArrowUpRight size={17} aria-hidden="true" />
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
