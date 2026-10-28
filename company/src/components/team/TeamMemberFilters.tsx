
import { Search, X } from "lucide-react";
import type {
    CompanyRole,
    MembershipStatus,
} from "../../types/company-member";

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    status: MembershipStatus | "";
    onStatusChange: (value: MembershipStatus | "") => void;
    roleId: string;
    onRoleChange: (value: string) => void;
    roles?: CompanyRole[];
    onReset: () => void;
};

export default function TeamMemberFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    roleId,
    onRoleChange,
    roles = [],
    onReset,
}: Props) {
    const hasFilters = Boolean(search || status || roleId);

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
                <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search members by name or email..."
                    aria-label="Search members by name or email"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:ring-neutral-900"
                />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:flex">
                <select
                    value={status}
                    onChange={(event) =>
                        onStatusChange(event.target.value as MembershipStatus | "")
                    }
                    aria-label="Filter by membership status"
                    className="h-11 min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
                >
                    <option value="">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="REMOVED">Removed</option>
                </select>

                <select
                    value={roleId}
                    onChange={(event) => onRoleChange(event.target.value)}
                    aria-label="Filter by role"
                    className="h-11 min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
                >
                    <option value="">All roles</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg px-3 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white lg:self-auto"
                >
                    <X size={15} />
                    Clear filters
                </button>
            )}
        </div>
    );
}
