
import { useState } from "react";
import { LoaderCircle, UserRound, UserRoundPlus, UserRoundX } from "lucide-react";

import { useUnassignCase } from "../../hooks/useCaseDetails";
import type { CaseAssignment } from "../../types/case-details";

interface Props {
    companyId: string;
    caseId: string;
    assignments: CaseAssignment[];
    onAssign: () => void;
}

function messageFromError(error: unknown) {
    if (
        error &&
        typeof error === "object" &&
        "response" in error
    ) {
        const response = (
            error as { response?: { data?: { message?: string } } }
        ).response;
        if (response?.data?.message) return response.data.message;
    }

    return error instanceof Error ? error.message : "Unable to remove assignment.";
}

export function CaseAssignments({
    companyId,
    caseId,
    assignments,
    onAssign,
}: Props) {
    const unassignMutation = useUnassignCase(companyId, caseId);
    const [error, setError] = useState<string | null>(null);

    console.log("Assignments", assignments)
    const activeAssignments = assignments.filter(
        (assignment) => !assignment.unassignedAt,
    );

    async function unassign(assignment: CaseAssignment) {
        const name =
            assignment.member.name ||
            assignment.member.email ||
            "this member";

        const confirmed = window.confirm(
            `Remove ${name} from this case?`,
        );

        if (!confirmed) return;

        setError(null);

        try {
            await unassignMutation.mutateAsync(assignment.id);
        } catch (cause) {
            setError(messageFromError(cause));
        }
    }

    return (
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-4 sm:px-5">
                <div>
                    <h2 className="text-sm font-semibold text-black">Assignees</h2>
                    <p className="mt-1 text-xs text-neutral-500">
                        Members responsible for this case.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAssign}
                    className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                    <UserRoundPlus size={15} />
                    Assign
                </button>
            </div>

            {error && (
                <p role="alert" className="border-b border-neutral-100 px-5 py-3 text-sm text-neutral-700">
                    {error}
                </p>
            )}

            {activeAssignments.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <UserRoundX size={22} className="mx-auto text-neutral-400" />
                    <p className="mt-2 text-sm font-medium text-black">
                        No active assignee
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                        Assign a company member to take responsibility for this case.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-100">
                    {activeAssignments.map((assignment) => {
                        const name =
                            assignment.member.name || "Unnamed member";

                        const pending =
                            unassignMutation.isPending &&
                            unassignMutation.variables === assignment.id;

                        return (
                            <div
                                key={assignment.id}
                                className="flex items-center gap-3 px-4 py-4 sm:px-5"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                                    <UserRound size={17} className="text-neutral-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-black">
                                        {name}
                                    </p>
                                    <p className="truncate text-xs text-neutral-500">
                                        {assignment.member.email ?? "Company member"}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Assigned{" "}
                                        {new Intl.DateTimeFormat(undefined, {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }).format(new Date(assignment.assignedAt))}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void unassign(assignment)}
                                    disabled={unassignMutation.isPending}
                                    aria-label={`Unassign ${name}`}
                                    title="Unassign member"
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 hover:text-black disabled:opacity-50"
                                >
                                    {pending ? (
                                        <LoaderCircle size={15} className="animate-spin" />
                                    ) : (
                                        <UserRoundX size={16} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
