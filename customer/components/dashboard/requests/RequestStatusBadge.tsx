import { CheckCircle2, Clock3, XCircle, CircleDot } from "lucide-react";

const statusStyles: Record<
    string,
    { label: string; className: string; icon: typeof CircleDot }
> = {
    SUBMITTED: {
        label: "Submitted",
        className: "bg-blue-50 text-blue-700 ring-blue-200/70",
        icon: Clock3,
    },
    UNDER_REVIEW: {
        label: "Under review",
        className: "bg-amber-50 text-amber-700 ring-amber-200/70",
        icon: Clock3,
    },
    IN_REVIEW: {
        label: "In review",
        className: "bg-amber-50 text-amber-700 ring-amber-200/70",
        icon: Clock3,
    },
    APPROVED: {
        label: "Approved",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        icon: CheckCircle2,
    },
    RESOLVED: {
        label: "Resolved",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-rose-50 text-rose-700 ring-rose-200/70",
        icon: XCircle,
    },
    CLOSED: {
        label: "Closed",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
        icon: CheckCircle2,
    },
};

export function RequestStatusBadge({
    status,
}: {
    status: string;
}) {
    const normalized = status.toUpperCase();
    const config = statusStyles[normalized] ?? {
        label: normalized.replaceAll("_", " ").toLowerCase(),
        className: "bg-slate-100 text-slate-600 ring-slate-200",
        icon: CircleDot,
    };

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${config.className}`}
        >
            <Icon size={12} />
            {config.label}
        </span>
    );
}