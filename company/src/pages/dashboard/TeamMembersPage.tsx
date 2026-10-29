
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { AlertCircle, CheckCircle2, LoaderCircle, Users } from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

import TeamMemberFilters from "../../components/team/TeamMemberFilters";
import TeamMembersTable from "../../components/team/TeamMembersTable";
import TeamMembersStates from "../../components/team/TeamMembersStates";
import EditMemberDialog from "../../components/team/EditMemberDialog";
import RemoveMemberDialog from "../../components/team/RemoveMemberDialog";

import {
    useCompanyMembers,
    useRemoveCompanyMember,
    useUpdateCompanyMember,
} from "../../hooks/useCompanyMembers";

import type {
    ApiErrorResponse,
    CompanyMember,
    MembershipStatus,
    UpdateCompanyMemberInput,
} from "../../types/company-member";
import { useCompanyRoles } from "../../hooks/useCompanyRoles";
import { useCompanyAccess } from "../../hooks/useCopanyAccess";
import { useCompanyDashboard } from "../../hooks/useCompany";
import { useCurrentUser } from "../../hooks/useUser";
import { AccessDeniedState, CompanyAccessSkeleton, CompanyDashboardSkeleton, CompanyRolesSkeleton, LoadingState, MemberRowsSkeleton, RetryState, SkeletonBlock } from "./TeamMembersLoadingSkeletons";

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof AxiosError) {
        const body = error.response?.data as ApiErrorResponse | undefined;
        if (body?.message) return body.message;

        if (error.response?.status === 403) {
            return "You don't have permission to perform this action.";
        }
        if (error.response?.status === 409) {
            return "This change conflicts with the company's membership rules.";
        }
    }

    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export default function TeamMembersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<MembershipStatus | "">("");
    const [roleId, setRoleId] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [editingMember, setEditingMember] =
        useState<CompanyMember | null>(null);
    const [removingMember, setRemovingMember] =
        useState<CompanyMember | null>(null);

    const [actionError, setActionError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const dashboardQuery = useCompanyDashboard();
    const companyId = dashboardQuery.data?.company.id ?? "";
    const currentUserQuery = useCurrentUser(Boolean(companyId));
    const currentMembership = currentUserQuery.data?.memberships.find(
        (membership) => membership.companyId === companyId,
    );
    const currentPermissions = currentMembership?.role.permissions.map(
        ({ permission }) => permission.code,
    );
    const { hasPermission } = useCompanyAccess(currentPermissions);
    const canReadMembers = hasPermission("MEMBER_READ");
    const canReadRoles = hasPermission("ROLE_READ");
    const canUpdateMembers =
        hasPermission("MEMBER_UPDATE") && canReadRoles;
    const canRemoveMembers = hasPermission("MEMBER_REMOVE");
    const currentUserId = currentUserQuery.data?.id;

    const rolesQuery = useCompanyRoles(
        companyId,
        canReadMembers && canReadRoles,
    );
    const roles = rolesQuery.data ?? [];

    // Debounce search before querying the server.
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    // Auto-dismiss transient success feedback.
    useEffect(() => {
        if (!notice) return;
        const timeout = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(timeout);
    }, [notice]);

    // Permission checks are enforced by the API as well; disable the request
    // until the current user's company membership permissions are available.
    const isCurrentUserReady =
        !currentUserQuery.isPending && Boolean(currentMembership);

    const params = {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(roleId ? { roleId } : {}),
    };

    const membersQuery = useCompanyMembers(
        companyId,
        params,
        isCurrentUserReady && canReadMembers,
    );
    const updateMutation = useUpdateCompanyMember(companyId);
    const removeMutation = useRemoveCompanyMember(companyId);

    const members = membersQuery.data?.items ?? [];
    const pagination = membersQuery.data?.pagination;

    const isInitialLoading =
        membersQuery.isPending && !membersQuery.data;
    const isInitialError =
        membersQuery.isError && !membersQuery.data;

    // ─────────────────────────────────────────────────────────────
    // Initial loading and error states
    // ─────────────────────────────────────────────────────────────

    if (dashboardQuery.isPending) {
        return <CompanyDashboardSkeleton />;
    }

    if (dashboardQuery.isError || !dashboardQuery.data) {
        return (
            <RetryState
                title="Unable to load your company"
                description="We couldn't retrieve your company information. Check your connection and try again."
                onRetry={() => void dashboardQuery.refetch()}
            />
        );
    }

    if (currentUserQuery.isPending) {
        return <CompanyAccessSkeleton />;
    }

    if (currentUserQuery.isError || !currentMembership) {
        return (
            <RetryState
                title="Unable to load your company access"
                description="Your membership details couldn't be retrieved. Please try again."
                onRetry={() => void currentUserQuery.refetch()}
            />
        );
    }

    if (!canReadMembers) {
        return <AccessDeniedState />;
    }

    if (canReadRoles && rolesQuery.isPending) {
        return (
            <LoadingState label="Loading company roles">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-12 w-12 shrink-0 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-3 w-28" />
                        <SkeletonBlock className="h-7 w-48 max-w-full" />
                        <SkeletonBlock className="h-4 w-64 max-w-full" />
                    </div>
                </div>

                <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
                    <SkeletonBlock className="h-5 w-40" />
                    <SkeletonBlock className="mt-2 h-4 w-64 max-w-full" />
                    <div className="mt-6">
                        <CompanyRolesSkeleton />
                        <CompanyRolesSkeleton />
                        <CompanyRolesSkeleton />
                    </div>
                </section>
            </LoadingState>
        );
    }

    if (canReadRoles && (rolesQuery.isError || !rolesQuery.data)) {
        return (
            <RetryState
                title="Unable to load company roles"
                description="Your team member list is available only after the required role information has loaded. Please retry."
                onRetry={() => void rolesQuery.refetch()}
            />
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Mutation handlers
    // ─────────────────────────────────────────────────────────────

    async function handleSave(input: UpdateCompanyMemberInput) {
        if (!editingMember || updateMutation.isPending) return;

        setActionError(null);
        setNotice(null);

        try {
            await updateMutation.mutateAsync({
                memberId: editingMember.id,
                input,
            });

            setEditingMember(null);
            setActionError(null);
            setNotice("Team member updated successfully.");
        } catch (error) {
            setActionError(
                getErrorMessage(error, "Couldn't update this team member."),
            );
        }
    }

    async function handleRemove() {
        if (!removingMember || removeMutation.isPending) return;

        setActionError(null);
        setNotice(null);

        try {
            const removedMemberName =
                removingMember.user.name || removingMember.user.email;

            await removeMutation.mutateAsync(removingMember.id);

            setRemovingMember(null);
            setActionError(null);
            setNotice(`${removedMemberName} was removed from the company.`);

            // If the last row on a page was removed, move back one page.
            if (members.length === 1 && page > 1) {
                setPage((current) => current - 1);
            }
        } catch (error) {
            setActionError(
                getErrorMessage(error, "Couldn't remove this team member."),
            );
        }
    }

    function resetFilters() {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setRoleId("");
        setPage(1);
    }

    // ─────────────────────────────────────────────────────────────
    // Page
    // ─────────────────────────────────────────────────────────────

    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Page header */}
            <motion.header
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-800 shadow-sm">
                        <Users size={21} />
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                            Company settings
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                            Team members
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                            Manage your team&apos;s roles, membership status and
                            company details.
                        </p>
                    </div>
                </div>

                {pagination && (
                    <div className="flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                            <Users size={16} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold tabular-nums text-neutral-900">
                                {pagination.total}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                                {pagination.total === 1 ? "Member" : "Members"}
                            </p>
                        </div>
                    </div>
                )}
            </motion.header>

            {/* Success notification */}
            <AnimatePresence initial={false}>
                {notice && (
                    <motion.div
                        key={notice}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.22 }}
                        role="status"
                        aria-live="polite"
                        className="overflow-hidden"
                    >
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0"
                            />

                            <span className="min-w-0 flex-1 leading-6">
                                {notice}
                            </span>

                            <button
                                type="button"
                                onClick={() => setNotice(null)}
                                aria-label="Dismiss notification"
                                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action error notification */}
            <AnimatePresence initial={false}>
                {actionError && !editingMember && !removingMember && (
                    <motion.div
                        key={actionError}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="min-w-0 flex-1 leading-6">
                            {actionError}
                        </p>

                        <button
                            type="button"
                            onClick={() => setActionError(null)}
                            aria-label="Dismiss error"
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-800 underline underline-offset-4 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Members section */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]"
            >
                {/* Section heading */}
                <div className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                        <h2 className="text-base font-semibold tracking-tight text-neutral-950">
                            All members
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-neutral-500">
                            Search and filter company memberships.
                        </p>
                    </div>

                    {pagination && (
                        <div className="flex w-fit items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            <p className="text-xs font-medium text-neutral-600">
                                {pagination.total}{" "}
                                {pagination.total === 1 ? "member" : "members"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Search and filters */}
                <div className="p-4 sm:p-5">
                    <TeamMemberFilters
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        status={status}
                        onStatusChange={(nextStatus) => {
                            setStatus(nextStatus);
                            setPage(1);
                        }}
                        roleId={roleId}
                        onRoleChange={(nextRoleId) => {
                            setRoleId(nextRoleId);
                            setPage(1);
                        }}
                        roles={roles}
                        onReset={resetFilters}
                    />

                    {/* Results */}
                    <div className="mt-5">
                        {isInitialLoading ? (
                            <MemberRowsSkeleton />
                        ) : isInitialError ? (
                            <TeamMembersStates
                                state="error"
                                message={getErrorMessage(
                                    membersQuery.error,
                                    "Please try again in a moment.",
                                )}
                                onRetry={() => void membersQuery.refetch()}
                            />
                        ) : !membersQuery.data ? (
                            <TeamMembersStates state="empty" />
                        ) : (
                            <>
                                {/* Background refresh indicator */}
                                <AnimatePresence>
                                    {membersQuery.isFetching && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-3 overflow-hidden"
                                        >
                                            <div
                                                role="status"
                                                className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs font-medium text-violet-700"
                                            >
                                                <LoaderCircle
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                                Updating results…
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <TeamMembersTable
                                    members={members}
                                    currentUserId={currentUserId}
                                    canUpdate={canUpdateMembers}
                                    canRemove={canRemoveMembers}
                                    onEdit={(member) => {
                                        setActionError(null);
                                        setNotice(null);
                                        setEditingMember(member);
                                    }}
                                    onRemove={(member) => {
                                        setActionError(null);
                                        setNotice(null);
                                        setRemovingMember(member);
                                    }}
                                />

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <nav
                                        aria-label="Team members pagination"
                                        className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <p className="text-sm text-neutral-500">
                                            Page{" "}
                                            <span className="font-semibold text-neutral-800">
                                                {pagination.page}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-semibold text-neutral-800">
                                                {pagination.totalPages}
                                            </span>

                                            <span className="hidden sm:inline">
                                                {" "}
                                                · {pagination.total} members total
                                            </span>
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    !pagination.hasPreviousPage ||
                                                    membersQuery.isFetching
                                                }
                                                onClick={() =>
                                                    setPage((current) =>
                                                        Math.max(1, current - 1),
                                                    )
                                                }
                                                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    !pagination.hasNextPage ||
                                                    membersQuery.isFetching
                                                }
                                                onClick={() =>
                                                    setPage((current) => current + 1)
                                                }
                                                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Edit member dialog */}
            <EditMemberDialog
                member={editingMember}
                roles={roles}
                currentUserId={currentUserId}
                isSaving={updateMutation.isPending}
                error={actionError}
                onClose={() => {
                    if (!updateMutation.isPending) {
                        setEditingMember(null);
                        setActionError(null);
                    }
                }}
                onSave={handleSave}
            />

            {/* Remove member dialog */}
            <RemoveMemberDialog
                member={removingMember}
                isRemoving={removeMutation.isPending}
                error={actionError}
                onClose={() => {
                    if (!removeMutation.isPending) {
                        setRemovingMember(null);
                        setActionError(null);
                    }
                }}
                onConfirm={handleRemove}
            />
        </main>
    );
}