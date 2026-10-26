
import { useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import { useEscalateCase } from "../../hooks/useCaseDetails";

interface Props {
    open: boolean;
    companyId: string;
    caseId: string;
    onClose: () => void;
}

export function EscalateCaseDialog({
    open,
    companyId,
    caseId,
    onClose,
}: Props) {
    const mutation = useEscalateCase(companyId, caseId);
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (reason.trim().length < 10) {
            setError("Provide an escalation reason of at least 10 characters.");
            return;
        }

        try {
            await mutation.mutateAsync(reason.trim());
            setReason("");
            onClose();
        } catch (cause) {
            const response =
                cause && typeof cause === "object" && "response" in cause
                    ? (
                        cause as {
                            response?: { data?: { message?: string } };
                        }
                    ).response
                    : undefined;

            setError(
                response?.data?.message ??
                (cause instanceof Error
                    ? cause.message
                    : "Unable to escalate this case."),
            );
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="escalate-case-title"
                className="w-full max-w-lg rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            >
                <header className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
                            <AlertTriangle size={19} />
                        </div>
                        <div>
                            <h2 id="escalate-case-title" className="text-lg font-semibold text-black">
                                Escalate case
                            </h2>
                            <p className="mt-1 text-sm text-neutral-500">
                                Explain why this case requires escalation.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={onClose}
                        aria-label="Close escalation dialog"
                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={submit} className="mt-5 space-y-4">
                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        rows={4}
                        maxLength={1000}
                        required
                        minLength={10}
                        placeholder="Describe the urgency, impact, or reason for escalation..."
                        className="w-full resize-y rounded-lg border border-neutral-200 p-3 text-sm leading-6 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                    />

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Minimum 10 characters</span>
                        <span>{reason.length}/1000</span>
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-neutral-700">
                            {error}
                        </p>
                    )}

                    <footer className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={onClose}
                            className="h-11 rounded-lg border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending || reason.trim().length < 10}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {mutation.isPending && (
                                <LoaderCircle size={15} className="animate-spin" />
                            )}
                            {mutation.isPending ? "Escalating..." : "Confirm escalation"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
