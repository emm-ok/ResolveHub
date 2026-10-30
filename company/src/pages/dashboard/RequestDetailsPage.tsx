
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    LoaderCircle,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
    caseRequestKeys,
    useAcceptCaseRequest,
    useCaseRequestDetails,
    useRejectCaseRequest,
} from "../../hooks/useCaseRequests";
import { useCompanyDashboard } from "../../hooks/useCompany";
import {
    RequestDecisionDialog,
    type RequestDecision,
} from "../../components/requests/RequestDecisionDialog";
import { RequestStatusBadge } from "../../components/requests/RequestStatusBadge";
import { toast } from "sonner";

function formatDate(value: string | null | undefined) {
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
        response?: {
            status?: number;
            data?: { message?: string };
        };
        message?: string;
    };

    return (
        candidate.response?.data?.message ??
        candidate.message ??
        "Something went wrong. Please try again."
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof CalendarDays;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <Icon size={15} aria-hidden="true" />
                {label}
            </div>
            <p className="mt-2 break-words text-sm font-semibold text-neutral-900">
                {value}
            </p>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div
            className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
            aria-busy="true"
            aria-label="Loading request details"
        >
            <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8">
                <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />
                <div className="mt-4 h-7 w-3/4 max-w-lg animate-pulse rounded bg-neutral-200" />
                <div className="mt-3 h-4 w-36 animate-pulse rounded bg-neutral-100" />

                <div className="mt-8 space-y-3">
                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-white"
                    />
                ))}
            </div>
        </div>
    );
}

export default function RequestDetailsPage() {
    const reduceMotion = useReducedMotion();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { requestId } = useParams<{ requestId: string }>();

    const { data: dashboard, isPending: dashboardPending } =
        useCompanyDashboard();

    const companyId = dashboard?.company.id ?? "";

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetching,
    } = useCaseRequestDetails(companyId, requestId ?? "");

    const acceptMutation = useAcceptCaseRequest(companyId);
    const rejectMutation = useRejectCaseRequest(companyId);

    const [decision, setDecision] = useState<RequestDecision | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

    const isActionPending =
        acceptMutation.isPending || rejectMutation.isPending;

    const canReview =
        data?.status === "SUBMITTED" || data?.status === "UNDER_REVIEW";

    // If opening a submitted request moves it into review, refresh the list.
    useEffect(() => {
        if (!companyId || !requestId || !data) return;

        void queryClient.invalidateQueries({
            queryKey: caseRequestKeys.lists(companyId),
        });
    }, [companyId, data?.status, queryClient, requestId]);

    async function handleDecision(reason?: string) {
        if (!requestId || !companyId || !decision || isActionPending) return;

        setActionError(null);
        setDecisionNotice(null);

        try {
            if (decision === "accept") {
                const result = await acceptMutation.mutateAsync(requestId);

                setDecision(null);

                setDecisionNotice(
                    `Request accepted. Case ${result.data.case.caseNumber} was created successfully.`,
                );
            } else {
                const trimmedReason = reason?.trim() ?? "";

                if (trimmedReason.length < 10) {
                    setActionError(
                        "Provide a rejection reason of at least 10 characters.",
                    );
                    return;
                }

                await rejectMutation.mutateAsync({
                    requestId,
                    reason: trimmedReason,
                });

                setDecision(null);
                setDecisionNotice("Request rejected successfully.");
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.lists(companyId),
                }),
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.details(companyId),
                }),
            ]);
        } catch (error) {
            setActionError(getErrorMessage(error));
            toast.error(getErrorMessage(error))
        }
    }

    const errorStatus = (
        error as { response?: { status?: number } } | null
    )?.response?.status;

    if (!requestId) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <FileText size={30} className="text-neutral-400" />
                <h1 className="mt-4 text-xl font-semibold text-neutral-950">
                    Invalid request link
                </h1>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Select a request from your requests list to view its details.
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/requests")}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    <ArrowLeft size={16} />
                    Back to requests
                </button>
            </div>
        );
    }

    if (dashboardPending || (Boolean(companyId) && isPending)) {
        return <PageSkeleton />;
    }

    if (!companyId) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <AlertCircle size={30} className="text-neutral-500" />
                <h1 className="mt-4 text-xl font-semibold text-neutral-950">
                    Unable to load company
                </h1>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    We couldn't determine your active company. Try refreshing the page.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    <RefreshCw size={16} />
                    Refresh page
                </button>
            </div>
        );
    }

    if (isError || !data) {
        const notFound = errorStatus === 404;

        return (
            <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                    <AlertCircle size={26} className="text-neutral-700" />
                </div>

                <h1 className="mt-5 text-xl font-semibold text-neutral-950">
                    {notFound ? "Request not found" : "Unable to load request"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {notFound
                        ? "This request may no longer exist, or you may not have permission to view it."
                        : getErrorMessage(error)}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {!notFound && (
                        <button
                            type="button"
                            disabled={isFetching}
                            onClick={() => void refetch()}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={isFetching ? "animate-spin" : ""}
                            />
                            Try again
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/requests")}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                        <ArrowLeft size={16} />
                        Back to requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.main
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22 }}
                className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            >
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/requests")}
                    className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                >
                    <ArrowLeft size={17} />
                    Back to requests
                </button>

                {decisionNotice && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800"
                    >
                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-neutral-700"
                        />
                        <p className="flex-1 leading-6">{decisionNotice}</p>
                        <button
                            type="button"
                            onClick={() => setDecisionNotice(null)}
                            aria-label="Dismiss notification"
                            className="rounded-md p-1 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    <header className="flex flex-col gap-5 border-b border-neutral-100 p-5 sm:p-8 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
                                <FileText size={22} strokeWidth={1.7} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                    Customer request
                                </p>
                                <h1 className="mt-2 break-words text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                                    {data.title}
                                </h1>
                                <p className="mt-2 break-all text-sm text-neutral-500">
                                    {data.requestNumber}
                                </p>

                                <div className="mt-4">
                                    <RequestStatusBadge status={data.status} />
                                </div>
                            </div>
                        </div>

                        {canReview && (
                            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:shrink-0">
                                <button
                                    type="button"
                                    disabled={isActionPending}
                                    onClick={() => {
                                        setActionError(null);
                                        setDecision("reject");
                                    }}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
                                >
                                    <XCircle size={17} />
                                    Reject
                                </button>

                                <button
                                    type="button"
                                    disabled={isActionPending}
                                    onClick={() => {
                                        setActionError(null);
                                        setDecision("accept");
                                    }}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
                                >
                                    {acceptMutation.isPending ? (
                                        <LoaderCircle size={17} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={17} />
                                    )}
                                    Accept and create case
                                </button>
                            </div>
                        )}
                    </header>

                    <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="min-w-0 space-y-8">
                            <section>
                                <h2 className="text-sm font-semibold text-neutral-950">
                                    Description
                                </h2>
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-600">
                                    {data.description?.trim() ||
                                        "No description was provided."}
                                </p>
                            </section>

                            {data.rejectionReason && (
                                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <h2 className="text-sm font-semibold text-neutral-900">
                                        Reason for rejection
                                    </h2>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600">
                                        {data.rejectionReason}
                                    </p>
                                </section>
                            )}

                            {canReview && (
                                <section className="border-t border-neutral-100 pt-6">
                                    <h2 className="text-sm font-semibold text-neutral-950">
                                        Review this request
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        Accepting creates a case for your team to manage. Rejecting
                                        records a reason and completes the review.
                                    </p>

                                    {actionError && (
                                        <div
                                            role="alert"
                                            className="mt-4 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-800"
                                        >
                                            {actionError}
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            disabled={isActionPending}
                                            onClick={() => {
                                                setActionError(null);
                                                setDecision("reject");
                                            }}
                                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                                        >
                                            <XCircle size={17} />
                                            Reject request
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isActionPending}
                                            onClick={() => {
                                                setActionError(null);
                                                setDecision("accept");
                                            }}
                                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                                        >
                                            {isActionPending ? (
                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <CheckCircle2 size={17} />
                                            )}
                                            Accept and create case
                                        </button>
                                    </div>
                                </section>
                            )}

                            {!canReview && (
                                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <AlertCircle
                                        size={18}
                                        className="mt-0.5 shrink-0 text-neutral-600"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-800">
                                            No review action available
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                                            This request is no longer awaiting a decision.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-4">
                            <h2 className="text-sm font-semibold text-neutral-950">
                                Request information
                            </h2>

                            <InfoCard
                                icon={CalendarDays}
                                label="Submitted"
                                value={formatDate(data.createdAt)}
                            />

                            <InfoCard
                                icon={Clock3}
                                label="Last updated"
                                value={formatDate(data.updatedAt)}
                            />

                            <InfoCard
                                icon={CalendarDays}
                                label="Reviewed"
                                value={formatDate(data.reviewedAt)}
                            />
                        </aside>
                    </div>
                </section>
            </motion.main>

            <RequestDecisionDialog
                decision={decision}
                requestNumber={data.requestNumber ?? ""}
                isPending={isActionPending}
                onClose={() => {
                    if (!isActionPending) {
                        setDecision(null);
                        setActionError(null);
                    }
                }}
                onConfirm={(reason) => void handleDecision(reason)}
            />
        </>
    );
}
