
import { CircleDot } from "lucide-react";

const statusStyles: Record<string, string> = {
    SUBMITTED: "bg-sky-50 text-sky-700 ring-sky-200/70",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200/70",
    UNDER_REVIEW: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    IN_REVIEW: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200/70",
    CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatStatus(status: string) {
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function StatusBadge({ status }: { status: string }) {
    const style =
        statusStyles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200";

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold ring-1 ring-inset ${style}`}
        >
            <CircleDot size={11} />
            {formatStatus(status)}
        </span>
    );
}
