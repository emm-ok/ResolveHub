
import { Clock3 } from "lucide-react";
import type { CaseDetails } from "../../types/case-details";

export function CaseSlaCard({ caseData }: { caseData: CaseDetails }) {
    const sla = caseData.sla;

    const deadline =
        sla?.resolutionDueAt ??
        sla?.dueAt ??
        sla?.responseDueAt ??
        null;

    const breached = Boolean(sla?.breachedAt);

    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-black">
                        SLA overview
                    </h2>
                    <p className="mt-1 text-xs text-neutral-500">
                        Service-level commitment
                    </p>
                </div>
                <Clock3 size={18} className="text-neutral-500" />
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-neutral-500">Policy</span>
                    <span className="text-right text-xs font-medium text-neutral-800">
                        {sla?.policy?.name ?? "No policy information"}
                    </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-neutral-500">Deadline</span>
                    <span className="text-right text-xs font-medium text-neutral-800">
                        {deadline
                            ? new Intl.DateTimeFormat(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            }).format(new Date(deadline))
                            : "Not available"}
                    </span>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                    <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${breached
                                ? "border-black bg-neutral-100 text-black"
                                : "border-neutral-200 bg-white text-neutral-600"
                            }`}
                    >
                        {breached ? "SLA breached" : "Check SLA status"}
                    </span>
                </div>
            </div>
        </section>
    );
}
