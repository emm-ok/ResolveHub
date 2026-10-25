
const styles: Record<string, string> = {
    SUBMITTED:
        "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/10 dark:text-blue-600",
    UNDER_REVIEW:
        "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-400/10 dark:text-violet-600",
    ACCEPTED:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-600",
    REJECTED:
        "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-400/10 dark:text-rose-600",
};

interface RequestStatusBadgeProps {
    status: string;
}

export function RequestStatusBadge({
    status,
}: RequestStatusBadgeProps) {
    const normalized = status.toUpperCase();
    const label = normalized
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[normalized] ??
                "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-white/10 dark:text-slate-300"
                }`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {label}
        </span>
    );
}
