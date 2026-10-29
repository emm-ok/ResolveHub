
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    SlidersHorizontal,
    ChevronDown,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";
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

const selectClassName =
    "h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-3.5 pr-10 text-sm font-medium text-neutral-700 outline-none transition-all duration-200 hover:border-violet-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

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
    const hasFilters = Boolean(search.trim() || status || roleId);
    const activeFilterCount = [Boolean(search.trim()), Boolean(status), Boolean(roleId)].filter(
        Boolean,
    ).length;

    return (
        <section
            aria-label="Filter team members"
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
            {/* Filter header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
                        <SlidersHorizontal size={18} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Find team members
                        </h2>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            Search and refine your directory
                        </p>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {activeFilterCount > 0 && (
                        <motion.span
                            key={activeFilterCount}
                            initial={{ opacity: 0, scale: 0.85, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -4 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"
                        >
                            {activeFilterCount} active{" "}
                            {activeFilterCount === 1 ? "filter" : "filters"}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                {/* Search */}
                <div>
                    <label
                        htmlFor="team-member-search"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600"
                    >
                        Search directory
                    </label>

                    <div className="group relative">
                        <Search
                            size={18}
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-violet-600"
                        />

                        <input
                            id="team-member-search"
                            type="search"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search by name or email..."
                            aria-label="Search members by name or email"
                            className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 pl-11 pr-11 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                        />

                        <AnimatePresence>
                            {search && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => onSearchChange("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                >
                                    <X size={15} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Select filters */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                        <label
                            htmlFor="team-member-status"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600"
                        >
                            Membership status
                        </label>

                        <div className="relative">
                            <select
                                id="team-member-status"
                                value={status}
                                onChange={(event) =>
                                    onStatusChange(event.target.value as MembershipStatus | "")
                                }
                                aria-label="Filter by membership status"
                                className={selectClassName}
                            >
                                <option value="">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="REMOVED">Removed</option>
                            </select>

                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                        </div>
                    </div>

                    {roles.length > 0 && (
                        <div className="min-w-0">
                            <label
                                htmlFor="team-member-role"
                                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600"
                            >
                                Company role
                            </label>

                            <div className="relative">
                                <select
                                    id="team-member-role"
                                    value={roleId}
                                    onChange={(event) => onRoleChange(event.target.value)}
                                    aria-label="Filter by role"
                                    className={selectClassName}
                                >
                                    <option value="">All roles</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Active filter summary and reset */}
                <AnimatePresence initial={false}>
                    {hasFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -5 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -5 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-neutral-500">
                                    <ShieldCheck
                                        size={15}
                                        className="mt-0.5 shrink-0 text-violet-600"
                                    />
                                    <p>
                                        Your directory is filtered. Clear filters to return to the
                                        full member list.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={onReset}
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:self-auto"
                                >
                                    <RotateCcw size={14} />
                                    Reset filters
                                    <X size={14} className="ml-0.5 text-neutral-400" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!hasFilters && (
                    <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        <span>Showing members based on your current directory settings.</span>
                    </div>
                )}
            </div>
        </section>
    );
}
