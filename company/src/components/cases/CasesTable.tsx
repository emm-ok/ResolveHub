
import { Eye, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router";

import type { CaseRecord } from "../../types/case";
import { CaseStatusBadge } from "./CaseStatusBadge";

interface Props {
    cases: CaseRecord[];
    companyId: string;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

function PriorityLabel({ priority }: { priority: string }) {
    const emphasis =
        priority === "URGENT" || priority === "HIGH"
            ? "font-semibold text-black"
            : "font-medium text-neutral-600";

    return (
        <span className={`text-sm ${emphasis}`}>
            {priority.replaceAll("_", " ")}
        </span>
    );
}

export function CasesTable({ cases, companyId }: Props) {
    const navigate = useNavigate();

    const openDetails = (caseId: string, action?: string) => {
        const base = `/dashboard/cases/${encodeURIComponent(caseId)}`;
        const query = action ? `?action=${action}` : "";

        navigate(`${base}${query}`, {
            state: { companyId },
        });
    };

    return (
        <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                    <tr className="border-y border-neutral-200 bg-neutral-50">
                        {[
                            "Case",
                            "Category",
                            "Status",
                            "Priority",
                            "Created",
                            "Actions",
                        ].map((heading) => (
                            <th
                                key={heading}
                                className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                    {cases.map((item) => (
                        <tr
                            key={item.id}
                            className="transition-colors hover:bg-neutral-50/80"
                        >
                            <td className="max-w-xs px-5 py-4">
                                <p className="truncate text-sm font-semibold text-black">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    {item.caseNumber}
                                </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-neutral-600">
                                {item.category || "—"}
                            </td>

                            <td className="px-5 py-4">
                                <CaseStatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-4">
                                <PriorityLabel priority={item.priority} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-500">
                                {formatDate(item.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openDetails(item.id)}
                                        title="View case details"
                                        aria-label={`View details for ${item.caseNumber}`}
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-2.5 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <Eye size={15} />
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openDetails(item.id, "assign")}
                                        title="Assign case"
                                        aria-label={`Assign ${item.caseNumber}`}
                                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-2.5 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <UserRoundPlus size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
