import { useCompanyDashboard } from "../../hooks/useCompany";
import { DashboardSkeleton } from "../../components/DashboardSkeleton";
import RecentRequests from "../../components/RecentRequests";
import { StatCard } from "../../components/StatCard";


import { motion, useReducedMotion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Clock3,
    FileText,
    RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function DashboardPage() {
    const { data, isPending, isError, error, refetch, isFetching } =
        useCompanyDashboard();

    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    if (isPending) {
        return (
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
                <DashboardSkeleton />
            </div>
        );
    }

    if (isError || !data) {
        const message =
            error instanceof Error
                ? error.message
                : "We couldn't load your company dashboard.";

        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-6">
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10 dark:border-white/10 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
                        <AlertCircle size={23} aria-hidden="true" />
                    </div>

                    <h1 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
                        Unable to load your dashboard
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const { company, member, stats, recentRequests } = data;

    const statCards = [
        {
            title: "Total requests",
            value: stats.totalRequests,
            description: "All customer requests received",
            icon: FileText,
            accent:
                "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
        },
        {
            title: "Pending requests",
            value: stats.pendingRequests,
            description: "Requests awaiting a decision",
            icon: Clock3,
            accent:
                "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
        },
        {
            title: "Total cases",
            value: stats.totalCases,
            description: "Cases created in your company",
            icon: BriefcaseBusiness,
            accent:
                "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
        },
        {
            title: "Active cases",
            value: stats.activeCases,
            description: "Cases still being worked on",
            icon: Activity,
            accent:
                "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
        },
        {
            title: "Resolved cases",
            value: stats.resolvedCases,
            description: "Cases resolved or closed",
            icon: CheckCircle2,
            accent:
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
        },
    ];

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:space-y-10 lg:p-8">
            {/* Page heading */}
            <motion.header
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
            >
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Building2 size={16} aria-hidden="true" />
                        <span>Company workspace</span>
                    </div>

                    <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                        {company.name}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                        Here's an overview of your company's requests and case activity.
                    </p>

                    {(member.role?.name || member.department || member.jobTitle) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {member.role?.name && (
                                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                                    {member.role.name.replace(/_/g, " ")}
                                </span>
                            )}

                            {member.department && (
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400">
                                    {member.department}
                                </span>
                            )}

                            {member.jobTitle && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {member.jobTitle}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? "animate-spin" : ""}
                            aria-hidden="true"
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/requests")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        View requests
                        <ArrowRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </motion.header>

            {/* Company information */}
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-white/10 dark:bg-slate-900">
                <div className="flex min-w-0 items-center gap-4">
                    {company.logoUrl ? (
                        <img
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-white/10"
                        />
                    ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                            <Building2 size={22} aria-hidden="true" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {company.name}
                        </p>
                        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                            {company.email || company.slug}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active workspace
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-white/5">
                        {company.timezone}
                    </span>
                </div>
            </section>

            {/* Statistics */}
            <section aria-labelledby="overview-heading">
                <div className="mb-4">
                    <h2
                        id="overview-heading"
                        className="text-base font-semibold text-slate-950 dark:text-white"
                    >
                        Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Key numbers for your company's workload.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                    {statCards.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            {...stat}
                            delay={index * 0.05}
                        />
                    ))}
                </div>
            </section>

            {/* Recent activity */}
            <RecentRequests requests={recentRequests} />
        </div>
    );
}

