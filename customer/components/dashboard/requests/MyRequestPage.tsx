"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    FilePlus2,
    RefreshCw,
    SearchX,
} from "lucide-react";

import { useMyRequests } from "@/hooks/useMyRequests";
import type { MyCaseRequest } from "@/lib/api/my-requests";

import { RequestsToolbar } from "./RequestToolbar";
import { RequestsTable } from "./RequestsTable";
import { RequestsTableSkeleton } from "./RequestsTableSkeleton";
import { RequestsPagination } from "./RequestsPagination";
import { RequestDetailsModal } from "./RequestDetailsModal";

const PAGE_SIZE = 10;

export function MyRequestsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const requestsQuery = useMyRequests({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortOrder,
    });

    const result = requestsQuery.data;
    const requests = result?.data ?? [];
    console.log("Result", requestsQuery.data)
    console.log("Requests", requests)
    const pagination = result?.pagination;

    const handleStatusChange = useCallback((value: string) => {
        setStatus(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
        setPage(1);
    }, []);

    const handleViewDetails = useCallback((request: MyCaseRequest) => {
        setSelectedRequestId(request.id);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedRequestId(null);
    }, []);

    const isInitialLoading = requestsQuery.isPending;
    const isInitialError = requestsQuery.isError && !result;

    return (
        <>
            <div className="space-y-7 sm:space-y-8">
                {/* Page heading */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                            <Link
                                href="/dashboard"
                                className="transition-colors hover:text-indigo-600"
                            >
                                Overview
                            </Link>
                            <span aria-hidden="true">/</span>
                            <span className="font-medium text-slate-600">
                                My Requests
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            My Requests
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Review your submissions, track their status, and open a request
                            to see its details.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/companies"
                        className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:self-auto"
                    >
                        <FilePlus2 size={17} />
                        New request
                        <ArrowRight size={15} />
                    </Link>
                </motion.section>

                {/* Main requests panel */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.025)]">
                    <div className="flex flex-col gap-1 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                        <h2 className="text-sm font-semibold text-slate-900">
                            All requests
                        </h2>
                        <p className="text-xs leading-5 text-slate-500">
                            Search by request reference or title, filter by status, or open
                            a request for more information.
                        </p>
                    </div>

                    <RequestsToolbar
                        search={search}
                        onSearchChange={setSearch}
                        status={status}
                        onStatusChange={handleStatusChange}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                    />

                    {isInitialLoading && (
                        <RequestsTableSkeleton />
                    )}

                    {isInitialError && (
                        <div
                            role="alert"
                            className="flex flex-col items-center px-5 py-14 text-center"
                        >
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                <RefreshCw size={21} />
                            </span>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                We couldn&apos;t load your requests
                            </h3>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                Check your connection and try again. Your submitted requests
                                have not been changed.
                            </p>

                            <button
                                type="button"
                                onClick={() => void requestsQuery.refetch()}
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>
                        </div>
                    )}

                    {!isInitialLoading && !isInitialError && requests.length === 0 && (
                        <div className="flex flex-col items-center px-5 py-14 text-center sm:py-16">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                                <SearchX size={25} strokeWidth={1.6} />
                            </span>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                {debouncedSearch || status
                                    ? "No matching requests"
                                    : "No requests yet"}
                            </h3>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                {debouncedSearch || status
                                    ? "Try a different search term or clear your status filter to find what you need."
                                    : "When you submit a request to a company, it will appear here with its reference number and status."}
                            </p>

                            {debouncedSearch || status ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setDebouncedSearch("");
                                        setStatus("");
                                        setPage(1);
                                    }}
                                    className="mt-5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <Link
                                    href="/companies"
                                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                                >
                                    Browse companies
                                    <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    )}

                    {!isInitialLoading && !isInitialError && requests.length > 0 && (
                        <>
                            <div className="relative">
                                {requestsQuery.isFetching && (
                                    <div
                                        aria-label="Updating requests"
                                        className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-indigo-100"
                                    >
                                        <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-indigo-600" />
                                    </div>
                                )}

                                <RequestsTable
                                    requests={requests}
                                    onViewDetails={handleViewDetails}
                                />
                            </div>

                            {pagination && (
                                <RequestsPagination
                                    page={pagination.page}
                                    limit={pagination.limit}
                                    total={pagination.total}
                                    totalPages={pagination.totalPages}
                                    hasNextPage={pagination.hasNextPage}
                                    hasPreviousPage={pagination.hasPreviousPage}
                                    onPageChange={setPage}
                                    isFetching={requestsQuery.isFetching}
                                />
                            )}
                        </>
                    )}
                </section>

                <p className="text-center text-[11px] leading-5 text-slate-400">
                    Your requests are private to your account. Use the reference number
                    when discussing a submission with the relevant company.
                </p>
            </div>

            <RequestDetailsModal
                requestId={selectedRequestId}
                onClose={handleCloseDetails}
            />
        </>
    );
}