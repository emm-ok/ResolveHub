"use client";

import type { Company } from "@/types/company";
import { CompanyCard } from "./CompanyCard";

interface CompanyGridProps {
    companies: Company[];
    onRequest: (company: Company) => void;
}

export function CompanyGrid({
    companies,
    onRequest,
}: CompanyGridProps) {
    if (companies.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
                <h2 className="font-semibold text-neutral-900">
                    No companies found
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                    Try another search term or change your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {companies.map((company) => (
                <CompanyCard
                    key={company.id}
                    company={company}
                    onRequest={onRequest}
                />
            ))}
        </div>
    );
}