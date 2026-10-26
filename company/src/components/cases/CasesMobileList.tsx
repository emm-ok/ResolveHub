
import { Eye, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router";

import type { CaseRecord } from "../../types/case";
import { CaseStatusBadge } from "./CaseStatusBadge";

interface Props {
    cases: CaseRecord[];
    companyId: string;
}

export function CasesMobileList({ cases, companyId }: Props) {
    const navigate = useNavigate();

    function openDetails(caseId: string, action?: string) {
        navigate(
            `/dashboard/cases/${encodeURIComponent(caseId)}${action ? `?action=${action}` : ""
            }`,
            { state: { companyId } },
        );
    }

    return (
        <div className="divide-y divide-neutral-100 md:hidden">
            {cases.map((item) => (
                <article key={item.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-black">
                                {item.title}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                {item.caseNumber}
                            </p>
                        </div>

                        <CaseStatusBadge status={item.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
                        <span>
                            Category:{" "}
                            <span className="text-neutral-800">
                                {item.category || "—"}
                            </span>
                        </span>
                        <span>
                            Priority:{" "}
                            <span className="font-medium text-neutral-800">
                                {item.priority.replaceAll("_", " ")}
                            </span>
                        </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => openDetails(item.id)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-medium text-black hover:bg-neutral-50"
                        >
                            <Eye size={16} />
                            View details
                        </button>

                        <button
                            type="button"
                            onClick={() => openDetails(item.id, "assign")}
                            aria-label={`Assign ${item.caseNumber}`}
                            className="inline-flex h-10 w-11 items-center justify-center rounded-lg border border-neutral-200 text-black hover:bg-neutral-50"
                        >
                            <UserRoundPlus size={17} />
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}
