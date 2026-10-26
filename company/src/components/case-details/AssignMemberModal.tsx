
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    LoaderCircle,
    Search,
    UserRound,
    X,
} from "lucide-react";

import {
    useAssignCase,
    useCaseAssignments,
    useCompanyMembers,
} from "../../hooks/useCaseDetails";

interface Props {
    open: boolean;
    companyId: string;
    caseId: string;
    onClose: () => void;
}

function errorMessage(error: unknown) {
    if (
        error &&
        typeof error === "object" &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { data?: { message?: string } };
            }
        ).response;

        if (response?.data?.message) return response.data.message;
    }

    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}

export function AssignMemberModal({
    open,
    companyId,
    caseId,
    onClose,
}: Props) {
    const [search, setSearch] = useState("");
    const [note, setNote] = useState("");
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState<string | null>(null);

    const membersQuery = useCompanyMembers(
        companyId,
        { page, limit: 20, search, status: "ACTIVE" },
        open,
    );

    const assignmentsQuery = useCaseAssignments(companyId, caseId);
    const assignMutation = useAssignCase(companyId, caseId);

    const activeMemberIds = new Set(
        (assignmentsQuery.data ?? [])
            .filter((assignment) => !assignment.unassignedAt)
            .map((assignment) => assignment.memberId),
    );

    useEffect(() => {
        if (!open) {
            setSearch("");
            setNote("");
            setPage(1);
            setActionError(null);
        }
    }, [open]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    async function assign(memberId: string) {
        setActionError(null);

        try {
            await assignMutation.mutateAsync({
                memberId,
                ...(note.trim() ? { note: note.trim() } : {}),
            });

            onClose();
        } catch (error) {
            setActionError(errorMessage(error));
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onClose();
                    }}
                >
                    <motion.section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="assign-member-title"
                        initial={{ opacity: 0, y: 16, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-2xl sm:rounded-2xl"
                    >
                        <header className="flex items-start justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
                            <div>
                                <h2
                                    id="assign-member-title"
                                    className="text-lg font-semibold tracking-tight text-black"
                                >
                                    Assign case
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    Choose an active member of this company.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close assignment modal"
                                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <div className="space-y-3 border-b border-neutral-100 p-4 sm:px-6">
                            <label className="relative block">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search name or email..."
                                    className="h-11 w-full rounded-lg border border-neutral-200 pl-10 pr-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                />
                            </label>

                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                rows={2}
                                maxLength={500}
                                placeholder="Optional assignment note..."
                                className="w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                            />

                            {actionError && (
                                <p role="alert" className="text-sm text-neutral-700">
                                    {actionError}
                                </p>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            {membersQuery.isPending ? (
                                <div className="space-y-3 p-5">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex animate-pulse items-center gap-3 py-2"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-neutral-100" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-1/3 rounded bg-neutral-100" />
                                                <div className="h-3 w-1/2 rounded bg-neutral-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : membersQuery.isError ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm font-medium text-black">
                                        Unable to load company members
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {errorMessage(membersQuery.error)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => void membersQuery.refetch()}
                                        className="mt-3 text-sm font-semibold text-black underline underline-offset-4"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : (membersQuery.data?.items.length ?? 0) === 0 ? (
                                <div className="p-10 text-center">
                                    <UserRound
                                        size={24}
                                        className="mx-auto text-neutral-400"
                                    />
                                    <p className="mt-3 text-sm font-semibold text-black">
                                        No members found
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Try another search or check the company's active members.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {membersQuery.data?.items.map((member) => {
                                        const alreadyAssigned = activeMemberIds.has(member.id);
                                        const isAssigning =
                                            assignMutation.isPending &&
                                            assignMutation.variables?.memberId === member.id;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-700">
                                                    {(member.user.name || member.user.email)
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-black">
                                                        {member.user.name || "Unnamed member"}
                                                    </p>
                                                    <p className="truncate text-xs text-neutral-500">
                                                        {member.user.email}
                                                    </p>
                                                    <p className="mt-1 truncate text-xs text-neutral-500">
                                                        {member.role.name}
                                                        {member.department
                                                            ? ` · ${member.department}`
                                                            : ""}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        alreadyAssigned ||
                                                        assignMutation.isPending ||
                                                        assignmentsQuery.isLoading
                                                    }
                                                    onClick={() => void assign(member.id)}
                                                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-black hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isAssigning ? (
                                                        <LoaderCircle
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    ) : alreadyAssigned ? (
                                                        <Check size={14} />
                                                    ) : null}
                                                    {alreadyAssigned ? "Assigned" : "Assign"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {membersQuery.data?.pagination.hasNextPage && (
                            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3">
                                <span className="text-xs text-neutral-500">
                                    Page {page} of {membersQuery.data.pagination.totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => current + 1)}
                                    disabled={membersQuery.isFetching}
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    {membersQuery.isFetching ? "Loading..." : "Load more"}
                                </button>
                            </div>
                        )}
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
