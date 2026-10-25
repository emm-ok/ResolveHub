
import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { useCompanyDashboard } from "../../hooks/useCompany";
import { useCaseRequests } from "../../hooks/useCaseRequests";

import { RequestsPageHeader } from "../../components/requests/RequestsPageHeader";
import { RequestFilters } from "../../components/requests/RequestFilters";
import RequestsTable from "../../components/requests/RequestsTable";
// import { RequestCard } from "../../components/requests/RequestCard";
import { RequestsPagination } from "../../components/requests/RequestsPagination";
import { RequestsSkeleton } from "../../components/requests/RequestsSkeleton";
import { RequestsEmptyState } from "../../components/requests/RequestsEmptyState";
import { RequestDetailsModal } from "../../components/requests/RequestDetailsModal";

import type { SortOrder } from "../../types/case-requests";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { RequestDecisionNotice } from "../../components/requests/RequestDecisionNotice";

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown) {
    const candidate = error as {
        response?: { data?: { message?: string } };
        message?: string;
    };

    return (
        candidate.response?.data?.message ??
        candidate.message ??
        "Something went wrong while loading requests."
    );
}

export default function RequestsPage() {
    const {
        data: dashboard,
        isPending: isDashboardPending,
        isError: isDashboardError,
        error: dashboardError,
        refetch: refetchDashboard,
    } = useCompanyDashboard();

    const companyId = dashboard?.company.id ?? "";

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [page, setPage] = useState(1);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
        null,
    );
    const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

    const debouncedSearch = useDebouncedValue(search, 300);

    // Reset pagination when the effective filters change.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status, sortOrder, companyId]);

    const {
        data: result,
        isPending: isRequestsPending,
        isError: isRequestsError,
        error: requestsError,
        refetch: refetchRequests,
        isFetching,
    } = useCaseRequests({
        companyId,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        status: status || undefined,
        sortOrder,
    });

    const hasFilters = Boolean(search.trim() || status);

    function clearFilters() {
        setSearch("");
        setStatus("");
        setSortOrder("desc");
        setPage(1);
    }

    if (isDashboardPending) {
        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-8 w-64 max-w-full rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-4 w-96 max-w-full rounded bg-slate-100 dark:bg-white/5" />
                </div>
                <RequestsSkeleton />
            </div>
        );
    }

    if (isDashboardError || !dashboard) {
        return (
            <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center p-6">
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900">
                    <AlertCircle
                        size={25}
                        className="mx-auto text-rose-500"
                        aria-hidden="true"
                    />
                    <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Unable to load your workspace
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {getErrorMessage(dashboardError)}
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetchDashboard()}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const requests = result?.items ?? [];
    const pagination = result?.pagination;

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:space-y-7 sm:p-6 lg:space-y-8 lg:p-8">
            <RequestsPageHeader
                total={pagination?.total ?? 0}
                isFetching={isFetching}
                onRefresh={() => void refetchRequests()}
            />


            {decisionNotice && (
                <RequestDecisionNotice
                    message={decisionNotice}
                    onDismiss={() => setDecisionNotice(null)}
                />
            )}

            <RequestFilters
                search={search}
                status={status}
                sortOrder={sortOrder}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onSortChange={setSortOrder}
                onClear={clearFilters}
            />

            <section
                aria-label="Customer requests"
                aria-busy={isFetching}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10"
            >
                {isRequestsPending ? (
                    <div className="p-4 sm:p-6">
                        <RequestsSkeleton />
                    </div>
                ) : isRequestsError ? (
                    <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
                        <AlertCircle
                            size={25}
                            className="text-rose-500"
                            aria-hidden="true"
                        />
                        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                            Unable to load requests
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {getErrorMessage(requestsError)}
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetchRequests()}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            <RefreshCw size={15} aria-hidden="true" />
                            Retry
                        </button>
                    </div>
                ) : requests.length === 0 ? (
                    <RequestsEmptyState
                        hasFilters={hasFilters}
                        onClearFilters={clearFilters}
                    />
                ) : (
                    <>
                        {isFetching && (
                            <div className="h-0.5 overflow-hidden bg-slate-100 dark:bg-white/5">
                                <div className="h-full w-1/3 animate-pulse bg-blue-500" />
                            </div>
                        )}

                        <RequestsTable
                            requests={requests}
                            onSelect={setSelectedRequestId}
                        />

                        {/* <div className="space-y-3 p-3 md:hidden">
                            {requests.map((request, index) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    index={index}
                                    onSelect={setSelectedRequestId}
                                />
                            ))}
                        </div> */}

                        {pagination && (
                            <RequestsPagination
                                pagination={pagination}
                                onPageChange={setPage}
                                isFetching={isFetching}
                            />
                        )}
                    </>
                )}
            </section>

            {isFetching && !isRequestsPending && (
                <p className="flex items-center justify-end gap-2 text-xs text-slate-400">
                    <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                    Updating requests…
                </p>
            )}

            <RequestDetailsModal
                companyId={companyId}
                requestId={selectedRequestId}
                onClose={() => setSelectedRequestId(null)}
                onActionSuccess={(message) => setDecisionNotice(message)}
            />
        </div>
    );
}
