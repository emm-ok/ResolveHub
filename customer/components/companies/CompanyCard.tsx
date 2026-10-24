
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock3,
    ShieldCheck,
} from "lucide-react";

import type { Company } from "@/types/company";

interface CompanyCardProps {
    company: Company;
    onRequest: (company: Company) => void;
}

export function CompanyCard({
    company,
    onRequest,
}: CompanyCardProps) {
    const isActive = company.status === "ACTIVE";
    const reduceMotion = useReducedMotion();

    const companyInitials = company.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();

    return (
        <motion.article
            layout
            initial={
                reduceMotion ? false : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            whileHover={
                reduceMotion
                    ? undefined
                    : { y: -4, transition: { duration: 0.2 } }
            }
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={[
                "group relative flex h-full min-w-0 flex-col overflow-hidden",
                "rounded-2xl border bg-white",
                "transition-[border-color,box-shadow] duration-300",
                isActive
                    ? "border-slate-200/90 hover:border-indigo-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                    : "border-slate-200/70",
            ].join(" ")}
        >
            {/* Subtle brand accent */}
            <div
                aria-hidden="true"
                className={[
                    "absolute inset-x-0 top-0 h-[3px]",
                    isActive
                        ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400"
                        : "bg-slate-200",
                ].join(" ")}
            />

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Company identity */}
                <div className="flex min-w-0 items-start gap-4">
                    <div
                        className={[
                            "relative flex size-[60px] shrink-0 items-center justify-center",
                            "overflow-hidden rounded-2xl border bg-slate-50",
                            "transition-colors duration-300",
                            isActive
                                ? "border-slate-200 group-hover:border-indigo-100"
                                : "border-slate-100 grayscale",
                        ].join(" ")}
                    >
                        {company.logoUrl ? (
                            <Image
                                src={company.logoUrl}
                                alt={`${company.name} logo`}
                                width={60}
                                height={60}
                                sizes="60px"
                                loading="lazy"
                                className="size-full object-contain p-1.5"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className="text-base font-bold tracking-tight text-indigo-700"
                            >
                                {companyInitials || <Building2 size={23} />}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                            <h2
                                title={company.name}
                                className="line-clamp-2 break-words text-[15px] font-semibold leading-5 tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 sm:text-base"
                            >
                                {company.name}
                            </h2>

                            {isActive && (
                                <span
                                    aria-label="Verified company listing"
                                    title="Verified listing"
                                    className="mt-0.5 flex shrink-0 items-center justify-center text-indigo-600"
                                >
                                    <ShieldCheck size={17} strokeWidth={1.8} />
                                </span>
                            )}
                        </div>

                        <p
                            title={company.slug}
                            className="mt-1.5 truncate text-xs text-slate-500"
                        >
                            {company.slug}
                        </p>
                    </div>
                </div>

                {/* Availability */}
                <div className="mt-6 flex items-center justify-between gap-3">
                    <span
                        className={[
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1.5",
                            "text-[11px] font-semibold ring-1 ring-inset",
                            isActive
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
                                : "bg-slate-100 text-slate-500 ring-slate-200",
                        ].join(" ")}
                    >
                        {isActive ? (
                            <CheckCircle2 size={13} />
                        ) : (
                            <Clock3 size={13} />
                        )}

                        {isActive ? "Accepting requests" : "Currently unavailable"}
                    </span>

                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                        Company
                    </span>
                </div>

                {/* Divider and supporting content */}
                <div className="my-5 h-px bg-slate-100" />

                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <Building2 size={14} />
                    </span>

                    <div>
                        <p className="text-xs font-semibold text-slate-700">
                            Company support
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Submit a request and follow its progress from your dashboard.
                        </p>
                    </div>
                </div>

                {/* Keep the CTA aligned at the bottom */}
                <div className="mt-auto pt-6">
                    <button
                        type="button"
                        disabled={!isActive}
                        onClick={() => onRequest(company)}
                        className={[
                            "flex min-h-11 w-full items-center justify-center gap-2",
                            "rounded-xl px-4 py-3 text-sm font-semibold",
                            "transition-all duration-200",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                            isActive
                                ? [
                                    "bg-slate-950 text-white shadow-sm",
                                    "hover:bg-indigo-700 hover:shadow-md",
                                    "active:scale-[0.99]",
                                ].join(" ")
                                : "cursor-not-allowed bg-slate-100 text-slate-400",
                        ].join(" ")}
                    >
                        <span>
                            {isActive ? "Submit a request" : "Unavailable"}
                        </span>

                        {isActive && (
                            <ArrowUpRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        )}
                    </button>

                    {isActive && (
                        <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
                            Secure request submission
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
