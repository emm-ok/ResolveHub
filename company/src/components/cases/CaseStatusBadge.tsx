
import type { CaseStatus } from "../../types/case";

const statusLabels: Record<CaseStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    PENDING: "Pending",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    ESCALATED: "Escalated",
};

const statusStyles: Record<CaseStatus, string> = {
    OPEN: "border-neutral-300 bg-white text-neutral-800",
    IN_PROGRESS: "border-neutral-400 bg-neutral-100 text-neutral-900",
    PENDING: "border-neutral-200 bg-neutral-50 text-neutral-600",
    RESOLVED: "border-neutral-300 bg-neutral-100 text-neutral-700",
    CLOSED: "border-neutral-200 bg-neutral-100 text-neutral-500",
    ESCALATED: "border-black bg-white font-semibold text-black",
};

export function CaseStatusBadge({
    status,
}: {
    status: CaseStatus;
}) {
    return (
        <span
            className={`inline-flex whitespace-nowrap items-center rounded-full border px-2.5 py-1 text-xs ${statusStyles[status] ?? statusStyles.OPEN}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabels[status] ?? status.replaceAll("_", " ")}
        </span>
    );
}
