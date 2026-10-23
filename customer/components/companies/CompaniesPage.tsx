"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type {
    Company,
} from "@/types/company";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyGridSkeleton } from "./CompanyCardSkeleton";
import { CompanyDirectoryControls } from "./CompanyToolbar";
import { RequestFormModal } from "./RequestFormModal";
import { CompanyPagination } from "./CompanyPagination";
import { CompanyGrid } from "./CompanyGrid";

const PAGE_SIZE = 12;

export default function CompaniesPage() {
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [selectedCompany, setSelectedCompany] =
        useState<Company | null>(null);

    const debouncedSearch = useDebouncedValue(
        searchInput.trim(),
        350,
    );

    const query = useCompanies({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
    });

    const companies = query.data?.data ?? [];
    const pagination = query.data?.pagination;

    // Reset pagination when the effective search changes.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Handle a page becoming invalid after filtering.
    useEffect(() => {
        if (
            pagination &&
            pagination.totalPages > 0 &&
            page > pagination.totalPages
        ) {
            setPage(pagination.totalPages);
        }
    }, [pagination, page]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        setPage(1);
    };

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.header
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-8"
                >
                    <p className="text-sm font-medium text-neutral-500">
                        ResolveHub / Companies
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                                Find a company
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                                Find the company you want to contact and submit
                                your complaint or request.
                            </p>
                        </div>

                        {pagination && (
                            <p className="text-sm text-neutral-500">
                                {pagination.total} companies
                            </p>
                        )}
                    </div>
                </motion.header>

                <section
                    aria-label="Company directory"
                    className="space-y-6"
                >
                    <CompanyDirectoryControls
                        search={searchInput}
                        onSearchChange={handleSearchChange}
                    />

                    {query.isPending ? (
                        <CompanyGridSkeleton />
                    ) : query.isError && !query.data ? (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-white p-6"
                        >
                            <h2 className="font-semibold text-neutral-900">
                                Unable to load companies
                            </h2>

                            <p className="mt-2 text-sm text-neutral-600">
                                {query.error instanceof Error
                                    ? query.error.message
                                    : "Something went wrong. Please try again."}
                            </p>

                            <button
                                type="button"
                                onClick={() => query.refetch()}
                                className="mt-4 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>
                            {query.isError && (
                                <p
                                    role="status"
                                    className="text-sm text-amber-700"
                                >
                                    Refresh failed. Showing the last available results.
                                </p>
                            )}

                            <div className="relative">
                                {query.isFetching && (
                                    <div
                                        aria-live="polite"
                                        className="absolute -top-5 right-0 text-xs text-neutral-500"
                                    >
                                        Updating results...
                                    </div>
                                )}

                                <CompanyGrid
                                    companies={companies}
                                    onRequest={setSelectedCompany}
                                />
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <CompanyPagination
                                    page={page}
                                    totalPages={pagination.totalPages}
                                    total={pagination.total}
                                    limit={PAGE_SIZE}
                                    onPageChange={setPage}
                                    isFetching={query.isFetching}
                                />
                            )}
                        </>
                    )}
                </section>
            </div>

            {selectedCompany && (
                <RequestFormModal
                    company={selectedCompany}
                    onClose={() => setSelectedCompany(null)}
                />
            )}
        </main>
    );
}