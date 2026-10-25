
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    LoaderCircle,
    X,
    XCircle,
} from "lucide-react";

import { useCaseRequestDetails, caseRequestKeys, useAcceptCaseRequest, useRejectCaseRequest } from "../../hooks/useCaseRequests";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestDecisionDialog, type RequestDecision } from "./RequestDecisionDialog";

interface RequestDetailsModalProps {
    companyId: string;
    requestId: string | null;
    onClose: () => void;
    onActionSuccess?: (message: string) => void;
}


function formatDate(value: string | null) {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getErrorMessage(error: unknown) {
    const candidate = error as {
        response?: { data?: { message?: string } };
        message?: string;
    };

    return (
        candidate.response?.data?.message ??
        candidate.message ??
        "We couldn't load this request. Please try again."
    );
}

export function RequestDetailsModal({
    companyId,
    requestId,
    onClose,
    onActionSuccess,
}: RequestDetailsModalProps) {
    const reduceMotion = useReducedMotion();
    const queryClient = useQueryClient();




    const { data, isPending, isError, error, refetch, isFetching } =
        useCaseRequestDetails(companyId, requestId);

    const [decision, setDecision] = useState<RequestDecision | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const acceptMutation = useAcceptCaseRequest(companyId);
    const rejectMutation = useRejectCaseRequest(companyId);

    const isActionPending =
        acceptMutation.isPending || rejectMutation.isPending;

    const canReview =
        data?.status === "SUBMITTED" ||
        data?.status === "UNDER_REVIEW";


    function getActionErrorMessage(error: unknown) {
        const candidate = error as {
            response?: { data?: { message?: string } };
            message?: string;
        };

        return (
            candidate.response?.data?.message ??
            candidate.message ??
            "The request could not be updated. Please try again."
        );
    }



    async function handleDecision(reason?: string) {
        if (!requestId || !decision || isActionPending) return;

        setActionError(null);

        try {
            if (decision === "accept") {
                const result = await acceptMutation.mutateAsync(requestId);

                setDecision(null);
                onActionSuccess?.(
                    `Request accepted. Case ${result.data.case.caseNumber} was created successfully.`,
                );
                onClose();
                return;
            }

            if (!reason?.trim() || reason.trim().length < 10) {
                setActionError("Provide a rejection reason of at least 10 characters.");
                return;
            }

            await rejectMutation.mutateAsync({
                requestId,
                reason: reason.trim(),
            });

            setDecision(null);
            onActionSuccess?.("Request rejected successfully.");
            onClose();
        } catch (error) {
            setActionError(getActionErrorMessage(error));
        }
    }


    useEffect(() => {
        if (!requestId) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [requestId, onClose]);

    useEffect(() => {
        if (!requestId || !data) return;

        // Viewing a SUBMITTED request may move it to UNDER_REVIEW.
        void queryClient.invalidateQueries({
            queryKey: caseRequestKeys.lists(companyId),
        });
    }, [companyId, data?.status, queryClient, requestId]);

    useEffect(() => {
        if (!requestId) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [requestId]);

    return (
        <>
            <AnimatePresence>
                {requestId && (
                    <motion.div
                        key="request-details-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) onClose();
                        }}
                    >
                        <motion.section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="request-details-title"
                            initial={
                                reduceMotion
                                    ? false
                                    : { opacity: 0, y: 16, scale: 0.99 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={
                                reduceMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: 10, scale: 0.99 }
                            }
                            transition={{ duration: reduceMotion ? 0 : 0.2 }}
                            className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
                        >
                            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                        <FileText size={20} aria-hidden="true" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Customer request
                                        </p>
                                        <h2
                                            id="request-details-title"
                                            className="mt-1 break-words text-lg font-semibold text-slate-950 sm:text-xl"
                                        >
                                            {data?.title ?? "Request details"}
                                        </h2>
                                        {data?.requestNumber && (
                                            <p className="mt-1 text-sm text-slate-500">
                                                {data.requestNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close request details"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <X size={19} aria-hidden="true" />
                                </button>
                            </header>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                                {isPending ? (
                                    <div className="flex min-h-60 flex-col items-center justify-center text-center">
                                        <LoaderCircle
                                            size={26}
                                            className="animate-spin text-slate-400"
                                            aria-hidden="true"
                                        />
                                        <p className="mt-4 text-sm text-slate-500">
                                            Loading request details…
                                        </p>
                                    </div>
                                ) : isError || !data ? (
                                    <div className="flex min-h-60 flex-col items-center justify-center text-center">
                                        <AlertCircle
                                            size={26}
                                            className="text-rose-500"
                                            aria-hidden="true"
                                        />
                                        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                                            Could not load request
                                        </h3>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                            {getErrorMessage(error)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => void refetch()}
                                            disabled={isFetching}
                                            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-7">
                                        <section>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Request status
                                            </p>
                                            <div className="mt-3">
                                                <RequestStatusBadge status={data.status} />
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Description
                                            </h3>
                                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                                                {data.description?.trim() ||
                                                    "No description was provided."}
                                            </p>
                                        </section>

                                        {data.rejectionReason && (
                                            <section className="rounded-xl border border-rose-200 p-4">
                                                <h3 className="text-sm font-semibold text-rose-800">
                                                    Reason for rejection
                                                </h3>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-rose-500/90">
                                                    {data.rejectionReason}
                                                </p>
                                            </section>
                                        )}

                                        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <CalendarDays size={15} aria-hidden="true" />
                                                    Submitted
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {formatDate(data.createdAt)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Clock3 size={15} aria-hidden="true" />
                                                    Last updated
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {formatDate(data.updatedAt)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10 sm:col-span-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <CalendarDays size={15} aria-hidden="true" />
                                                    Reviewed
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {formatDate(data.reviewedAt)}
                                                </p>
                                            </div>
                                        </section>

                                        {canReview && (
                                            <section className="border-t border-slate-100 pt-6 dark:border-white/10">
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Review decision
                                                </h3>

                                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                    Accepting creates a case for your team to manage. Rejecting records
                                                    your reason and closes the request review.
                                                </p>

                                                {actionError && (
                                                    <div
                                                        role="alert"
                                                        className="mt-4 rounded-xl border border-red-400 px-4 py-3 text-sm leading-6 text-rose-800 dark:border-red-400"
                                                    >
                                                        {actionError}
                                                    </div>
                                                )}

                                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionError(null);
                                                            setDecision("reject");
                                                        }}
                                                        disabled={isActionPending}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <XCircle size={17} aria-hidden="true" />
                                                        Reject request
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionError(null);
                                                            setDecision("accept");
                                                        }}
                                                        disabled={isActionPending}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={17} aria-hidden="true" />
                                                        Accept and create case
                                                    </button>
                                                </div>
                                            </section>
                                        )}

                                    </div>
                                )}
                            </div>

                            <footer className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-7 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    Close
                                </button>
                            </footer>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>


            <RequestDecisionDialog
                decision={decision}
                requestNumber={data?.requestNumber ?? ""}
                isPending={isActionPending}
                onClose={() => {
                    if (!isActionPending) setDecision(null);
                }}
                onConfirm={(reason) => void handleDecision(reason)}
            />
        </>

    );
}
