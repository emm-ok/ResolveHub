"use client";

import { Eye, FileText } from "lucide-react";
import { RequestStatusBadge } from "./RequestStatusBadge"
import type { MyCaseRequest } from "@/lib/api/my-requests";

interface RequestsTableProps {
    requests: MyCaseRequest[];
    onViewDetails: (request: MyCaseRequest) => void;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function RequestsTable({
    requests,
    onViewDetails,
}: RequestsTableProps) {
    return (
        <>
            {/* Desktop/tablet table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:px-6">
                                Request
                            </th>
                            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Submitted
                            </th>
                            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Last updated
                            </th>
                            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Status
                            </th>
                            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {requests.map((request) => (
                            <tr
                                key={request.id}
                                className="group transition-colors hover:bg-slate-50/70"
                            >
                                <td className="px-5 py-4 sm:px-6">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                            <FileText size={17} />
                                        </span>

                                        <div className="min-w-0">
                                            <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">
                                                {request.title}
                                            </p>
                                            <p className="mt-1 font-mono text-[11px] text-slate-400">
                                                {request.requestNumber}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                                    {formatDate(request.createdAt)}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                                    {formatDate(request.updatedAt)}
                                </td>

                                <td className="px-5 py-4">
                                    <RequestStatusBadge status={request.status} />
                                </td>

                                <td className="px-5 py-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onViewDetails(request)}
                                        aria-label={`View details for ${request.requestNumber}`}
                                        title="View details"
                                        className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
                {requests.map((request) => (
                    <article key={request.id} className="p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText size={18} />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                                    {request.title}
                                </p>

                                <p className="mt-1 font-mono text-[11px] text-slate-400">
                                    {request.requestNumber}
                                </p>

                                <div className="mt-3">
                                    <RequestStatusBadge status={request.status} />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onViewDetails(request)}
                                aria-label={`View details for ${request.requestNumber}`}
                                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Eye size={17} />
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Submitted
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-700">
                                    {formatDate(request.createdAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Last updated
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-700">
                                    {formatDate(request.updatedAt)}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onViewDetails(request)}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            View details
                            <Eye size={14} />
                        </button>
                    </article>
                ))}
            </div>
        </>
    );
}