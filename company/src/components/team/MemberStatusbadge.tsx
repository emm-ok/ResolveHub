
import type { MembershipStatus } from "../../types/company-member";

const styles: Record<MembershipStatus, string> = {
    ACTIVE:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    SUSPENDED:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    REMOVED:
        "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const labels: Record<MembershipStatus, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    REMOVED: "Removed",
};

export default function MemberStatusBadge({
    status,
}: {
    status: MembershipStatus;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {labels[status]}
        </span>
    );
}
