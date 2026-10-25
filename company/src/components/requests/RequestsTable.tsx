import { ArrowUpRight, Inbox } from "lucide-react";
import { Link } from "react-router";
import StatusBadge from "../StatusBadge";
import type { CaseRequest } from "../../types/case-requests";

interface RecentRequestsProps {
    requests: CaseRequest[];
    onSelect: (requestId: string) => void;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export default function RequestsTable({ requests, onSelect }: RecentRequestsProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        Company requests
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        All requests submitted to your company.
                    </p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-14 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                        <Inbox size={22} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        No requests yet
                    </h3>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                        When customers submit requests, they will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[650px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    {["Request", "Reference", "Submitted", "Status", "Last updated", "Reviewed", "View"].map(
                                        (heading) => (
                                            <th
                                                key={heading}
                                                scope="col"
                                                className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[1px] text-slate-400"
                                            >
                                                {heading}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {requests.map((request) => (
                                    <tr
                                        key={request.id}
                                        onClick={() => onSelect(request.id)}
                                        className="transition-colors hover:bg-slate-50/70"
                                    >
                                        <td className="max-w-[250px] px-6 py-4">
                                            <p className="truncate text-xs font-semibold text-slate-800">
                                                {request.title}
                                            </p>
                                            {request.submitter?.name && (
                                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                                    {request.submitter.name}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                                            {request.requestNumber}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-500">
                                            {formatDate(request.updatedAt)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-500">
                                            {request.reviewedAt ? <p>{formatDate(request.reviewedAt as string)}</p> : "No review"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/dashboard/requests/${encodeURIComponent(request.id)}`}
                                                aria-label={`View ${request.requestNumber}`}
                                                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                <ArrowUpRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="divide-y divide-slate-100 md:hidden">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                // to={`/dashboard/requests/${encodeURIComponent(request.id)}`}
                                onClick={() => onSelect(request.id)}
                                className="block p-4 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="break-words text-sm font-semibold text-slate-800">
                                            {request.title}
                                        </p>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {request.requestNumber}
                                        </p>
                                    </div>
                                    <ArrowUpRight
                                        size={16}
                                        className="mt-1 shrink-0 text-slate-400"
                                    />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <StatusBadge status={request.status} />
                                    <span className="text-[11px] text-slate-400">
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
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}







// import { motion, useReducedMotion } from "framer-motion";
// import { ArrowUpRight, FileText } from "lucide-react";
// import type { CaseRequest } from "../../types/case-requests";
// import { RequestStatusBadge } from "./RequestStatusBadge";

// interface RequestsTableProps {
//     requests: CaseRequest[];
//     onSelect: (requestId: string) => void;
// }

// function formatDate(value: string | null) {
//     if (!value) return "—";

//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return "—";

//     return new Intl.DateTimeFormat(undefined, {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//     }).format(date);
// }

// export function RequestsTable({
//     requests,
//     onSelect,
// }: RequestsTableProps) {
//     const reduceMotion = useReducedMotion();

//     return (
//         <div className="hidden overflow-x-auto md:block">
//             <table className="w-full min-w-[850px] text-left">
//                 <thead className="">
//                     <tr>
//                         {["Request", "Status", "Submitted", "Last updated", "Reviewed", ""].map(
//                             (heading) => (
//                                 <th
//                                     key={heading || "action"}
//                                     className="whitespace-nowrap px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 first:pl-6 last:pr-6 dark:text-slate-400"
//                                 >
//                                     {heading}
//                                 </th>
//                             ),
//                         )}
//                     </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100">
//                     {requests.map((request, index) => (
//                         <motion.tr
//                             key={request.id}
//                             initial={
//                                 reduceMotion ? false : { opacity: 0, y: 5 }
//                             }
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{
//                                 duration: reduceMotion ? 0 : 0.2,
//                                 delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.15),
//                             }}
//                             className="group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
//                             onClick={() => onSelect(request.id)}
//                             onKeyDown={(event) => {
//                                 if (event.key === "Enter" || event.key === " ") {
//                                     event.preventDefault();
//                                     onSelect(request.id);
//                                 }
//                             }}
//                             tabIndex={0}
//                             role="button"
//                             aria-label={`View request ${request.requestNumber}: ${request.title}`}
//                         >
//                             <td className="max-w-[320px] px-5 py-4 pl-6">
//                                 <div className="flex min-w-0 items-center gap-3">
//                                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors group-hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
//                                         <FileText size={17} aria-hidden="true" />
//                                     </div>
//                                     <div className="min-w-0">
//                                         <p className="truncate text-sm font-semibold text-slate-900">
//                                             {request.title}
//                                         </p>
//                                         <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                                             {request.requestNumber}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </td>

//                             <td className="px-5 py-4">
//                                 <RequestStatusBadge status={request.status} />
//                             </td>

//                             <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-500">
//                                 {formatDate(request.createdAt)}
//                             </td>

//                             <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-500">
//                                 {formatDate(request.updatedAt)}
//                             </td>

//                             <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-500">
//                                 {formatDate(request.reviewedAt)}
//                             </td>

//                             <td className="px-5 py-4 pr-6 text-right">
//                                 <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:bg-white group-hover:text-slate-900 dark:group-hover:bg-white/10">
//                                     <ArrowUpRight size={17} aria-hidden="true" />
//                                 </span>
//                             </td>
//                         </motion.tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

