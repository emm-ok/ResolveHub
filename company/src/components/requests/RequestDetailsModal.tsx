
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    CalendarDays,
    Clock3,
    FileText,
    LoaderCircle,
    X,
} from "lucide-react";

import { useCaseRequestDetails, caseRequestKeys } from "../../hooks/useCaseRequests";
import { RequestStatusBadge } from "./RequestStatusBadge";

interface RequestDetailsModalProps {
    companyId: string;
    requestId: string | null;
    onClose: () => void;
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
}: RequestDetailsModalProps) {
    const reduceMotion = useReducedMotion();
    const queryClient = useQueryClient();

    const { data, isPending, isError, error, refetch, isFetching } =
        useCaseRequestDetails(companyId, requestId);

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
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white"
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
                                        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-400/5">
                                            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                                                Reason for rejection
                                            </h3>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-rose-800/90 dark:text-rose-200">
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
    );
}
