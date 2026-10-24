
import { ArrowUpRight, Inbox } from "lucide-react";
import { Link } from "react-router";
import type { DashboardRequest } from "../lib/api/company";
import StatusBadge from "./StatusBadge";

interface RecentRequestsProps {
    requests: DashboardRequest[];
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

export default function RecentRequests({ requests }: RecentRequestsProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        Recent requests
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        The latest requests submitted to your company.
                    </p>
                </div>

                <Link
                    to="/dashboard/requests"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    View all <ArrowUpRight size={14} />
                </Link>
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
                                    {["Request", "Reference", "Submitted", "Status", ""].map(
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
                                        className="transition-colors hover:bg-slate-50/70"
                                    >
                                        <td className="max-w-[250px] px-6 py-4">
                                            <p className="truncate text-xs font-semibold text-slate-800">
                                                {request.title}
                                            </p>
                                            {request.submitterName && (
                                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                                    {request.submitterName}
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
                            <Link
                                key={request.id}
                                to={`/dashboard/requests/${encodeURIComponent(request.id)}`}
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
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
