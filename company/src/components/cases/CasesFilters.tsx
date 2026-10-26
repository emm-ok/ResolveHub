
import { Search, X } from "lucide-react";
import type { CaseStatus } from "../../types/case";

interface Props {
    search: string;
    status: CaseStatus | "";
    sortOrder: "asc" | "desc";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: CaseStatus | "") => void;
    onSortChange: (value: "asc" | "desc") => void;
    onReset: () => void;
}

export function CasesFilters({
    search,
    status,
    sortOrder,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onReset,
}: Props) {
    const hasFilters = Boolean(search || status || sortOrder !== "desc");

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
                <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search case number or title..."
                    aria-label="Search cases"
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={status}
                    onChange={(event) =>
                        onStatusChange(event.target.value as CaseStatus | "")
                    }
                    aria-label="Filter by case status"
                    className="h-11 min-w-36 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-neutral-500"
                >
                    <option value="">All statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ESCALATED">Escalated</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(event) =>
                        onSortChange(event.target.value as "asc" | "desc")
                    }
                    aria-label="Sort cases by date"
                    className="h-11 min-w-36 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-neutral-500"
                >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                </select>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    >
                        <X size={15} />
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
