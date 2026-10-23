"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    AlertCircle,
    CalendarDays,
    Check,
    Clipboard,
    Clock3,
    FileText,
    LoaderCircle,
    X,
} from "lucide-react";
import { useMyRequestDetails } from "@/hooks/useMyRequests";
import { RequestStatusBadge } from "./RequestStatusBadge";

interface RequestDetailsModalProps {
    requestId: string | null;
    onClose: () => void;
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function RequestDetailsModal({
    requestId,
    onClose,
}: RequestDetailsModalProps) {
    const reduceMotion = useReducedMotion();

    const {
        data: request,
        isPending,
        isError,
        error,
        refetch,
        isFetching,
    } = useMyRequestDetails(requestId);

    useEffect(() => {
        if (!requestId) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [requestId, onClose]);

    const backdropInitial = reduceMotion ? false : { opacity: 0 };
    const panelInitial = reduceMotion
        ? false
        : { opacity: 0, y: 12, scale: 0.985 };

    return (
        <AnimatePresence>
            {requestId && (
                <motion.div
                    key="request-details-backdrop"
                    initial={backdropInitial}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 backdrop-blur-[3px] sm:items-center sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onClose();
                    }}
                >
                    <motion.section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="request-details-title"
                        initial={panelInitial}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl"
                    >
                        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                    <FileText size={21} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Request details
                                    </p>

                                    <h2
                                        id="request-details-title"
                                        className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl"
                                    >
                                        {isPending
                                            ? "Loading request…"
                                            : request?.title ?? "Request information"}
                                    </h2>

                                    {request && (
                                        <p className="mt-1 break-all font-mono text-xs text-slate-400">
                                            {request.requestNumber}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close request details"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                            {isPending && (
                                <div
                                    role="status"
                                    className="flex min-h-56 flex-col items-center justify-center text-center"
                                >
                                    <LoaderCircle
                                        size={28}
                                        className="animate-spin text-indigo-600"
                                    />
                                    <p className="mt-4 text-sm font-medium text-slate-700">
                                        Loading request details
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Please wait a moment.
                                    </p>
                                </div>
                            )}

                            {isError && !isPending && (
                                <div
                                    role="alert"
                                    className="flex min-h-56 flex-col items-center justify-center text-center"
                                >
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                        <AlertCircle size={22} />
                                    </span>

                                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                        Could not load this request
                                    </h3>

                                    <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                        {error instanceof Error
                                            ? error.message
                                            : "Something went wrong while loading the request."}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void refetch()}
                                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            {request && !isError && (
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Current status
                                            </p>

                                            <div className="mt-2">
                                                <RequestStatusBadge status={request.status} />
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Reference
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void navigator.clipboard?.writeText(
                                                        request.requestNumber,
                                                    );
                                                }}
                                                className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                                            >
                                                {request.requestNumber}
                                                <Clipboard size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Description
                                        </h3>

                                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                            {request.description || "No description provided."}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Timeline
                                        </h3>

                                        <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 px-4">
                                            <div className="flex items-start gap-3 py-4">
                                                <CalendarDays
                                                    size={17}
                                                    className="mt-0.5 text-slate-400"
                                                />

                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        Request submitted
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatDateTime(request.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-4">
                                                <Clock3
                                                    size={17}
                                                    className="mt-0.5 text-slate-400"
                                                />

                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        Last updated
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatDateTime(request.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-4">
                                                <Check
                                                    size={17}
                                                    className="mt-0.5 text-slate-400"
                                                />

                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        Reviewed
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatDateTime(request.reviewedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {request.rejectionReason && (
                                        <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                                            <div className="flex items-center gap-2 text-rose-700">
                                                <AlertCircle size={17} />
                                                <h3 className="text-sm font-semibold">
                                                    Reason for rejection
                                                </h3>
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-rose-800">
                                                {request.rejectionReason}
                                            </p>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>

                        <footer className="flex shrink-0 justify-end border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                Close
                            </button>

                            {isFetching && !isPending && (
                                <span className="sr-only">Refreshing request details</span>
                            )}
                        </footer>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}