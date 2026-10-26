
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useCaseKpis, caseKpiKeys } from "../../hooks/useCaseKpi";
import { caseKeys, useCases } from "../../hooks/useCases";

import type { CaseStatus } from "../../types/case";

import { CaseKpiCards } from "../../components/cases/CaseKpiCards";
import { CasesFilters } from "../../components/cases/CasesFilters";
import { CasesTable } from "../../components/cases/CasesTable";
import { CasesMobileList } from "../../components/cases/CasesMobileList";
import { CasesPagination } from "../../components/cases/CasesPagination";
import {
    CasesEmptyState,
    CasesErrorState,
    CasesTableSkeleton,
} from "../../components/cases/CasesPageStates";
import { useCompanyDashboard } from "../../hooks/useCompany";

interface CasesPageProps {
    companyId: string;
}

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { data?: { message?: string } };
            }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Please check your connection and try again.";
}

export default function CasesPage() {
    const queryClient = useQueryClient();

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<CaseStatus | "">("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);

    const {
        data,
        // isPending,
        // isError,
        // refetch,
        // isFetching,
    } = useCompanyDashboard();

    const companyId = data?.company.id;
    // Debounce search requests while the member is typing.
    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const kpisQuery = useCaseKpis(companyId ?? "");

    console.log("KPI Query", kpisQuery.data)

    const casesQuery = useCases(companyId ?? "", {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status,
        sortOrder,
    });

    const cases = casesQuery.data?.data ?? [];
    const pagination = casesQuery.data?.pagination;

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setSortOrder("desc");
        setPage(1);
    };

    const refreshData = async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: caseKpiKeys.company(companyId ?? ""),
            }),
            queryClient.invalidateQueries({
                queryKey: caseKeys.lists(companyId ?? ""),
            }),
        ]);
    };

    const selectStatus = (value: string) => {
        setStatus(value as CaseStatus | "");
        setPage(1);
    };

    const hasFilters = Boolean(
        searchInput || status || sortOrder !== "desc",
    );

    return (
        <motion.main
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
            {/* Page heading */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-neutral-200 bg-white p-3">
                        <BriefcaseBusiness size={22} className="text-black" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                            Cases
                        </h1>
                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                            Track, review, and manage your company's cases.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void refreshData()}
                    disabled={casesQuery.isFetching || kpisQuery.isFetching}
                    className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
                >
                    <RefreshCw
                        size={15}
                        className={
                            casesQuery.isFetching || kpisQuery.isFetching
                                ? "animate-spin"
                                : ""
                        }
                    />
                    Refresh
                </button>
            </section>

            {/* KPI overview */}
            <section aria-label="Case overview" className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-black">
                        Overview
                    </h2>

                    {kpisQuery.dataUpdatedAt > 0 && (
                        <span className="text-xs text-neutral-400">
                            Updated{" "}
                            {new Intl.DateTimeFormat(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                            }).format(kpisQuery.dataUpdatedAt)}
                        </span>
                    )}
                </div>

                {kpisQuery.isError && !kpisQuery.data ? (
                    <div className="rounded-xl border border-neutral-200 bg-white">
                        <CasesErrorState
                            message={getErrorMessage(kpisQuery.error)}
                            onRetry={() => void kpisQuery.refetch()}
                        />
                    </div>
                ) : (
                    <CaseKpiCards
                        data={kpisQuery.data}
                        isLoading={kpisQuery.isPending && !kpisQuery.data}
                        onSelectStatus={selectStatus}
                    />
                )}

                {kpisQuery.isError && kpisQuery.data && (
                    <p className="text-xs text-neutral-500">
                        KPI refresh failed. Showing the last successfully loaded values.
                    </p>
                )}
            </section>

            {/* Case list */}
            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="flex flex-col gap-1 border-b border-neutral-200 px-4 py-4 sm:px-5">
                    <h2 className="text-base font-semibold text-black">
                        All cases
                    </h2>
                    <p className="text-sm text-neutral-500">
                        Search cases, filter by status, and open a case to review its details.
                    </p>
                </div>

                <div className="p-4 sm:p-5">
                    <CasesFilters
                        search={searchInput}
                        status={status}
                        sortOrder={sortOrder}
                        onSearchChange={setSearchInput}
                        onStatusChange={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                        onSortChange={(value) => {
                            setSortOrder(value);
                            setPage(1);
                        }}
                        onReset={resetFilters}
                    />
                </div>

                {casesQuery.isError && !casesQuery.data ? (
                    <CasesErrorState
                        message={getErrorMessage(casesQuery.error)}
                        onRetry={() => void casesQuery.refetch()}
                    />
                ) : casesQuery.isPending && !casesQuery.data ? (
                    <CasesTableSkeleton />
                ) : cases.length === 0 ? (
                    <CasesEmptyState
                        hasFilters={hasFilters}
                        onReset={resetFilters}
                    />
                ) : (
                    <>
                        {casesQuery.isFetching && (
                            <div
                                className="h-0.5 w-full overflow-hidden bg-neutral-100"
                                aria-label="Updating cases"
                            >
                                <div className="h-full w-1/3 animate-pulse bg-neutral-500" />
                            </div>
                        )}

                        <CasesTable cases={cases} companyId={companyId as string} />

                        <CasesMobileList cases={cases} companyId={companyId as string} />

                        {pagination && (
                            <CasesPagination
                                pagination={pagination}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </section>
        </motion.main>
    );
}
