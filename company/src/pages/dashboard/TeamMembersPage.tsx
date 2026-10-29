
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { CheckCircle2, Users } from "lucide-react";

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

    if (dashboardQuery.isPending) {
        return <p className="p-6 text-sm text-neutral-500">Loading company…</p>;
    }

    if (dashboardQuery.isError || !dashboardQuery.data) {
        return (
            <div className="p-6" role="alert">
                <p className="text-sm text-red-600">
                    Unable to load your company. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => void dashboardQuery.refetch()}
                    className="mt-3 rounded-lg border px-3 py-2 text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (currentUserQuery.isPending) {
        return <p className="p-6 text-sm text-neutral-500">Loading your access…</p>;
    }

    if (currentUserQuery.isError || !currentMembership) {
        return (
            <div className="p-6" role="alert">
                <p className="text-sm text-red-600">
                    Unable to load your company access. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => void currentUserQuery.refetch()}
                    className="mt-3 rounded-lg border px-3 py-2 text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!canReadMembers) {
        return (
            <div className="p-6" role="alert">
                <p className="text-sm text-red-600">
                    You don’t have permission to view company members.
                </p>
            </div>
        );
    }

    if (canReadRoles && rolesQuery.isPending) {
        return <p className="p-6 text-sm text-neutral-500">Loading company roles…</p>;
    }

    if (canReadRoles && (rolesQuery.isError || !rolesQuery.data)) {
        return (
            <div className="p-6" role="alert">
                <p className="text-sm text-red-600">
                    Unable to load company roles. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => void rolesQuery.refetch()}
                    className="mt-3 rounded-lg border px-3 py-2 text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

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
            await removeMutation.mutateAsync(removingMember.id);

            setRemovingMember(null);
            setNotice(
                `${removingMember.user.name || removingMember.user.email} was removed from the company.`,
            );

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

    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                        <Users size={21} />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                            Company settings
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Team members
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                            Manage your team's roles, membership status and company details.
                        </p>
                    </div>
                </div>
            </header>

            {notice && (
                <div
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        className="ml-auto text-xs font-medium underline underline-offset-2"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800">
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="font-semibold">All members</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Search and filter company memberships.
                        </p>
                    </div>
                    {pagination && (
                        <p className="text-sm text-neutral-500">
                            {pagination.total}{" "}
                            {pagination.total === 1 ? "member" : "members"}
                        </p>
                    )}
                </div>

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

                <div className="mt-5">
                    {isInitialLoading ? (
                        <TeamMembersStates state="loading" />
                    ) : isInitialError ? (
                        <TeamMembersStates
                            state="error"
                            message={getErrorMessage(
                                membersQuery.error,
                                "Please try again in a moment.",
                            )}
                            onRetry={() => membersQuery.refetch()}
                        />
                    ) : !membersQuery.data ? (
                        <TeamMembersStates state="empty" />
                    ) : (
                        <>
                            {membersQuery.isFetching && (
                                <p
                                    role="status"
                                    className="mb-3 text-xs text-neutral-500"
                                >
                                    Updating results…
                                </p>
                            )}

                            <TeamMembersTable
                                members={members}
                                currentUserId={currentUserId}
                                canUpdate={canUpdateMembers}
                                canRemove={canRemoveMembers}
                                onEdit={(member) => {
                                    setActionError(null);
                                    setEditingMember(member);
                                }}
                                onRemove={(member) => {
                                    setActionError(null);
                                    setRemovingMember(member);
                                }}
                            />

                            {pagination && pagination.totalPages > 1 && (
                                <nav
                                    aria-label="Team members pagination"
                                    className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800"
                                >
                                    <p className="text-sm text-neutral-500">
                                        Page {pagination.page} of {pagination.totalPages}
                                        <span className="hidden sm:inline">
                                            {" "}· {pagination.total} members total
                                        </span>
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={!pagination.hasPreviousPage}
                                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                                            className="h-10 flex-1 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none dark:border-neutral-800 dark:hover:bg-neutral-900"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!pagination.hasNextPage}
                                            onClick={() => setPage((current) => current + 1)}
                                            className="h-10 flex-1 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none dark:border-neutral-800 dark:hover:bg-neutral-900"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </section>

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
