
interface StatusBadgeProps {
    status: string;
}

const statusStyles: Record<string, string> = {
    SUBMITTED:
        "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/10 dark:text-blue-300",
    PENDING:
        "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300",
    UNDER_REVIEW:
        "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-400/10 dark:text-violet-300",
    IN_REVIEW:
        "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-400/10 dark:text-violet-300",
    APPROVED:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    REJECTED:
        "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-400/10 dark:text-rose-300",
    RESOLVED:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    CLOSED:
        "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-white/10 dark:text-slate-300",
    IN_PROGRESS:
        "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const normalized = status.toUpperCase();
    const styles =
        statusStyles[normalized] ??
        "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-white/10 dark:text-slate-300";

    const label = normalized
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
        >
            {label}
        </span>
    );
}
