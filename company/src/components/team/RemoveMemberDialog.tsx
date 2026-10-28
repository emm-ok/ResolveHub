
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import type { CompanyMember } from "../../types/company-member";

type Props = {
    member: CompanyMember | null;
    isRemoving: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function RemoveMemberDialog({
    member,
    isRemoving,
    error,
    onClose,
    onConfirm,
}: Props) {
    if (!member) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isRemoving) onClose();
            }}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="remove-member-title"
                aria-describedby="remove-member-description"
                className="w-full max-w-md rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                        <AlertTriangle size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2
                            id="remove-member-title"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Remove team member?
                        </h2>
                        <p
                            id="remove-member-description"
                            className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400"
                        >
                            You are about to remove{" "}
                            <strong className="break-words text-neutral-950 dark:text-white">
                                {member.user.name || member.user.email}
                            </strong>{" "}
                            from this company.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRemoving}
                        aria-label="Close confirmation dialog"
                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong>What happens next?</strong>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>The member's company membership is marked as removed.</li>
                        <li>Active case assignments belonging to this member are automatically unassigned.</li>
                        <li>Historical records and audit history are retained.</li>
                    </ul>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    >
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRemoving}
                        className="h-11 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isRemoving || member.status === "REMOVED"}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRemoving && (
                            <LoaderCircle size={16} className="animate-spin" />
                        )}
                        {isRemoving ? "Removing member..." : "Confirm removal"}
                    </button>
                </div>
            </section>
        </div>
    );
}
