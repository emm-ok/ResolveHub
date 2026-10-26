
import { useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    ExternalLink,
    FileText,
    RefreshCw,
    UserRoundPlus,
} from "lucide-react";

import {
    useCaseActivities,
    useCaseAssignments,
    useCaseDetails,
} from "../../hooks/useCaseDetails";

import { CaseAssignments } from "../../components/case-details/CaseAssignments";
import { AssignMemberModal } from "../../components/case-details/AssignMemberModal";
import { EditCaseModal } from "../../components/case-details/EditCaseModal";
import { EscalateCaseDialog } from "../../components/case-details/EscalateCaseDialog";
import { CaseActivityTimeline } from "../../components/case-details/CaseActivityTimeline";
import { CaseSlaCard } from "../../components/case-details/CaseSlaCard";

import type {
    CasePriority,
    CaseStatus,
} from "../../types/case-details";
import { useCompanyDashboard } from "../../hooks/useCompany";

interface Props {
    companyId: string;
}

const statusLabels: Record<CaseStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
};

const statusClasses: Record<CaseStatus, string> = {
    OPEN: "border-neutral-300 bg-white text-neutral-800",
    IN_PROGRESS: "border-neutral-400 bg-neutral-100 text-neutral-900",
    RESOLVED: "border-neutral-300 bg-neutral-100 text-neutral-700",
    CLOSED: "border-neutral-200 bg-neutral-100 text-neutral-500",
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
    if (
        error &&
        typeof error === "object" &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { status?: number; data?: { message?: string } };
            }
        ).response;

        if (response?.data?.message) return response.data.message;
    }

    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}

function PriorityPill({ priority }: { priority: CasePriority }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priority === "URGENT" || priority === "HIGH"
                    ? "border-black bg-neutral-100 text-black"
                    : "border-neutral-200 bg-white text-neutral-600"
                }`}
        >
            {priority}
        </span>
    );
}

export default function CaseDetailsPage() {
    const { data } = useCompanyDashboard();

    const companyId = data?.company.id;
    const { caseId = "" } = useParams<{ caseId: string }>();

    const [assignOpen, setAssignOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [escalateOpen, setEscalateOpen] = useState(false);

    const caseQuery = useCaseDetails(companyId as string, caseId);
    const assignmentsQuery = useCaseAssignments(companyId as string, caseId);
    const activitiesQuery = useCaseActivities(companyId as string, caseId);

    if (!companyId || !caseId) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h1 className="text-xl font-semibold text-black">
                    Case unavailable
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    A company and case must be selected to view this page.
                </p>
                <Link
                    to="/dashboard/cases"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black underline underline-offset-4"
                >
                    <ArrowLeft size={16} />
                    Back to cases
                </Link>
            </main>
        );
    }

    if (caseQuery.isPending) {
        return (
            <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6 lg:px-8">
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 w-36 rounded bg-neutral-100" />
                        <div className="h-8 w-2/3 rounded bg-neutral-100" />
                        <div className="h-4 w-full max-w-xl rounded bg-neutral-100" />
                        <div className="h-10 w-48 rounded bg-neutral-100" />
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
                    <div className="h-56 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
                </div>
            </main>
        );
    }

    if (caseQuery.isError || !caseQuery.data) {
        const status = (
            caseQuery.error as {
                response?: { status?: number };
            } | null
        )?.response?.status;

        return (
            <main className="mx-auto max-w-3xl px-4 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                    <FileText size={22} className="text-neutral-600" />
                </div>
                <h1 className="mt-4 text-xl font-semibold text-black">
                    {status === 404 ? "Case not found" : "Unable to load case"}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    {getErrorMessage(caseQuery.error)}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => void caseQuery.refetch()}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50"
                    >
                        <RefreshCw size={15} />
                        Retry
                    </button>
                    <Link
                        to="/dashboard/cases"
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <ArrowLeft size={15} />
                        Back to cases
                    </Link>
                </div>
            </main>
        );
    }

    const item = caseQuery.data;

    return (
        <>
            <motion.main
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            >
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-neutral-500">
                    <Link
                        to="/dashboard/cases"
                        className="inline-flex items-center gap-1.5 hover:text-black"
                    >
                        <ArrowLeft size={15} />
                        Cases
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-neutral-800">
                        {item.caseNumber}
                    </span>
                </nav>

                {/* Header */}
                <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                                    {item.caseNumber}
                                </span>
                                <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[item.status]
                                        }`}
                                >
                                    {statusLabels[item.status]}
                                </span>
                                <PriorityPill priority={item.priority} />
                            </div>

                            <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                                {item.title}
                            </h1>

                            <p className="mt-3 max-w-4xl whitespace-pre-wrap break-words text-sm leading-7 text-neutral-600">
                                {item.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-neutral-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays size={14} />
                                    Created {formatDate(item.createdAt)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock3 size={14} />
                                    Updated {formatDate(item.updatedAt)}
                                </span>
                                {item.category && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <FileText size={14} />
                                        {item.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:max-w-[310px] xl:justify-end">
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                            >
                                <Edit3 size={15} />
                                Edit case
                            </button>

                            <button
                                type="button"
                                onClick={() => setAssignOpen(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-3.5 text-sm font-semibold text-white hover:bg-neutral-800"
                            >
                                <UserRoundPlus size={15} />
                                Assign
                            </button>

                            <button
                                type="button"
                                onClick={() => setEscalateOpen(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3.5 text-sm font-medium text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
                            >
                                <AlertTriangle size={15} />
                                Escalate
                            </button>
                        </div>
                    </div>

                    {item.request && (
                        <div className="mt-6 flex flex-col gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm">
                                <span className="text-neutral-500">Originating request</span>
                                <p className="mt-1 font-semibold text-black">
                                    {item.request.requestNumber}
                                </p>
                            </div>
                            <Link
                                to={`/dashboard/requests/${encodeURIComponent(item.request.id)}`}
                                state={{ companyId }}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-black"
                            >
                                View request
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    )}
                </section>

                {/* Main content and sidebar */}
                <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-6">
                        <CaseAssignments
                            companyId={companyId}
                            caseId={caseId}
                            assignments={assignmentsQuery.data ?? []}
                            onAssign={() => setAssignOpen(true)}
                        />

                        {assignmentsQuery.isError && (
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-sm text-neutral-700">
                                    Assignment information could not be loaded.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void assignmentsQuery.refetch()}
                                    className="mt-2 text-sm font-semibold text-black underline underline-offset-4"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        <CaseActivityTimeline
                            activities={activitiesQuery.data ?? item.activities ?? []}
                            isLoading={activitiesQuery.isPending}
                            error={
                                activitiesQuery.isError
                                    ? getErrorMessage(activitiesQuery.error)
                                    : null
                            }
                            onRetry={() => void activitiesQuery.refetch()}
                        />
                    </div>

                    <aside className="min-w-0 space-y-6">
                        <CaseSlaCard caseData={item} />

                        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
                            <h2 className="text-sm font-semibold text-black">
                                Requester
                            </h2>
                            <div className="mt-4 flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-700">
                                    {(item.createdBy.name || item.createdBy.email)
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="break-words text-sm font-semibold text-black">
                                        {item.createdBy.name || "Unnamed requester"}
                                    </p>
                                    <p className="mt-1 break-all text-xs text-neutral-500">
                                        {item.createdBy.email}
                                    </p>
                                    {item.createdBy.memberships?.[0]?.role?.name && (
                                        <p className="mt-2 text-xs text-neutral-500">
                                            {item.createdBy.memberships[0].role.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
                            <h2 className="text-sm font-semibold text-black">
                                Case information
                            </h2>
                            <dl className="mt-4 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-xs text-neutral-500">Case ID</dt>
                                    <dd className="max-w-[65%] break-all text-right text-xs font-medium text-neutral-800">
                                        {item.id}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-xs text-neutral-500">Category</dt>
                                    <dd className="text-right text-xs font-medium text-neutral-800">
                                        {item.category || "Uncategorized"}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-xs text-neutral-500">Last updated</dt>
                                    <dd className="text-right text-xs font-medium text-neutral-800">
                                        {formatDate(item.updatedAt)}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        {item.status === "RESOLVED" && (
                            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                <CheckCircle2 size={19} className="mt-0.5 text-neutral-700" />
                                <div>
                                    <p className="text-sm font-semibold text-black">
                                        Case resolved
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-neutral-600">
                                        This case has been marked as resolved.
                                    </p>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </motion.main>

            <AssignMemberModal
                open={assignOpen}
                companyId={companyId}
                caseId={caseId}
                onClose={() => setAssignOpen(false)}
            />

            <EditCaseModal
                open={editOpen}
                companyId={companyId}
                caseData={item}
                onClose={() => setEditOpen(false)}
            />

            <EscalateCaseDialog
                open={escalateOpen}
                companyId={companyId}
                caseId={caseId}
                onClose={() => setEscalateOpen(false)}
            />
        </>
    );
}
