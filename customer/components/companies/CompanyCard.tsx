"use client";

import { motion } from "framer-motion";
import type { Company } from "@/types/company";
import Image from "next/image";

interface CompanyCardProps {
    company: Company;
    onRequest: (company: Company) => void;
}

export function CompanyCard({
    company,
    onRequest,
}: CompanyCardProps) {
    const isActive = company.status === "ACTIVE";

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:shadow-sm"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
                    {company.logoUrl ? (
                        <Image
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            width={56}
                            height={56}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-contain"
                        />
                    ) : (
                        <span
                            aria-hidden="true"
                            className="text-lg font-semibold text-neutral-500"
                        >
                            {company.name.slice(0, 1).toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-neutral-900">
                        {company.name}
                    </h2>

                    <p className="mt-1 text-xs text-neutral-500">
                        {company.slug}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
                <span
                    className={`size-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-neutral-400"
                        }`}
                />

                <span className="text-xs text-neutral-600">
                    {isActive && "Available"}
                </span>
            </div>

            <div className="mt-auto pt-5">
                <button
                    type="button"
                    disabled={!isActive}
                    onClick={() => onRequest(company)}
                    className="h-10 w-full rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                >
                    {isActive ? "Submit a complaint" : "Unavailable"}
                </button>
            </div>
        </motion.article>
    );
}