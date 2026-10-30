
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    X,
} from "lucide-react";

export type RequestDecision = "accept" | "reject";

interface RequestDecisionDialogProps {
    decision: RequestDecision | null;
    requestNumber: string;
    isPending: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
}

export function RequestDecisionDialog({
    decision,
    requestNumber,
    isPending,
    onClose,
    onConfirm,
}: RequestDecisionDialogProps) {
    const [reason, setReason] = useState("");
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        setReason("");
        setAttemptedSubmit(false);
    }, [decision]);

    const rejectionReason = reason.trim();
    const reasonError =
        rejectionReason.length < 10
            ? "Please provide at least 10 characters."
            : rejectionReason.length > 1000
                ? "The reason cannot exceed 1,000 characters."
                : "";

    const isReject = decision === "reject";

    function handleConfirm() {
        if (!decision || isPending) return;

        if (isReject && reasonError) {
            setAttemptedSubmit(true);
            return;
        }

        onConfirm(isReject ? rejectionReason : undefined)
        if (decision === "accept"){
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {decision && (
                <motion.div
                    key="decision-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.15 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-[3px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isPending) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="request-decision-title"
                        aria-describedby="request-decision-description"
                        initial={
                            reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-white/10 dark:bg-slate-900"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${isReject
                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"
                                    }`}
                            >
                                {isReject ? (
                                    <AlertTriangle size={21} aria-hidden="true" />
                                ) : (
                                    <CheckCircle2 size={21} aria-hidden="true" />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                aria-label="Close confirmation"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <h2
                            id="request-decision-title"
                            className="mt-4 text-lg font-semibold text-slate-950 dark:text-white"
                        >
                            {isReject ? "Reject this request?" : "Accept this request?"}
                        </h2>

                        <p
                            id="request-decision-description"
                            className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400"
                        >
                            {isReject
                                ? `Request ${requestNumber} will be marked as rejected. The reason will be recorded for reference.`
                                : `Accepting ${requestNumber} will create a new case in your company's workspace. You can then manage it through the cases workflow.`}
                        </p>

                        {isReject && (
                            <div className="mt-5">
                                <label
                                    htmlFor="request-rejection-reason"
                                    className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200"
                                >
                                    Reason for rejection <span className="text-rose-500">*</span>
                                </label>

                                <textarea
                                    id="request-rejection-reason"
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    disabled={isPending}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Explain why this request cannot be accepted..."
                                    aria-invalid={attemptedSubmit && Boolean(reasonError)}
                                    aria-describedby="request-reason-hint"
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                                />

                                <div className="mt-2 flex items-start justify-between gap-3">
                                    <p
                                        id="request-reason-hint"
                                        className={`text-xs ${attemptedSubmit && reasonError
                                                ? "text-rose-600 dark:text-rose-300"
                                                : "text-slate-500 dark:text-slate-400"
                                            }`}
                                    >
                                        {attemptedSubmit && reasonError
                                            ? reasonError
                                            : "Provide between 10 and 1,000 characters."}
                                    </p>
                                    <span className="shrink-0 text-xs tabular-nums text-slate-400">
                                        {reason.length}/1000
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isPending}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isReject
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                {isPending ? (
                                    <>
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                        Processing…
                                    </>
                                ) : isReject ? (
                                    "Reject request"
                                ) : (
                                    "Accept and create case"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
