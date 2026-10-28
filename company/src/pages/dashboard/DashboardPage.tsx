import { useCompanyDashboard } from "../../hooks/useCompany";
import DashboardSkeleton from "../../components/DashboardSkeleton";
import RecentRequests from "../../components/RecentRequests";
import { StatCard } from "../../components/StatCard";
import { Activity, BarChart3, ClipboardCheck, Inbox } from "lucide-react";

export default function DashboardPage() {
    const {
        data,
        isPending,
        isError,
        refetch,
        isFetching,
    } = useCompanyDashboard();

    console.log("Company", data?.company)

    if (isPending) {
        return <DashboardSkeleton />;
    }

    if (isError || !data) {
        return (
            <section className="rounded-xl border border-red-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Unable to load dashboard
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    We couldn't retrieve your company dashboard. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm
            font-medium text-white transition hover:bg-gray-700
            disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isFetching ? "Retrying..." : "Try again"}
                </button>
            </section>
        );
    }

    const { company, member, stats, recentRequests } = data;

    return (
        <div className="space-y-8">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Company workspace
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                        Welcome to {company.name}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Here's an overview of your company's requests and cases.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <p className="text-xs text-gray-500">Your role</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {member.role?.name ?? "Company member"}
                    </p>
                    {member.department && (
                        <p className="mt-1 text-sm text-gray-500">
                            {member.department}
                        </p>
                    )}
                </div>
            </header>

            <section aria-label="Company statistics">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total requests"
                        value={stats.totalRequests}
                        description="Requests received by your company"
                        icon={Inbox}
                        accent="text-indigo-600"
                        delay={0}
                    />
                    <StatCard
                        title="Pending requests"
                        value={stats.pendingRequests}
                        description="Requests awaiting review"
                        icon={Activity}
                        accent="text-amber-600"
                        delay={.2}
                    />
                    <StatCard
                        title="Active cases"
                        value={stats.activeCases}
                        description="Cases currently being handled"
                        icon={ClipboardCheck}
                        accent="text-blue-600"
                        delay={.5}
                    />
                    <StatCard
                        title="Resolved cases"
                        value={stats.resolvedCases}
                        description="Cases marked as resolved"
                        icon={BarChart3}
                        accent="text-emerald-600"
                        delay={.7}
                    />
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Case overview
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Total operational cases recorded for {company.name}.
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <span className="text-sm text-gray-600">Total cases</span>
                    <span className="text-2xl font-semibold text-gray-900">
                        {stats.totalCases}
                    </span>
                </div>
            </section>

            <RecentRequests requests={recentRequests} />
        </div>
    );
}






// import { Link } from "react-router";
// import {
//     Activity,
//     ArrowRight,
//     BarChart3,
//     ClipboardCheck,
//     Inbox,
//     RefreshCw,
//     Users,
// } from "lucide-react";
// import { useCompanyDashboard } from "../../hooks/useCompany";
// import DashboardSkeleton from "../../components/DashboardSkeleton";
// import RecentRequests from "../../components/RecentRequests";
// import StatCard from "../../components/StatCard";


// export default function DashboardPage() {
//     const { data, isPending, isError, error, refetch, isFetching } =
//         useCompanyDashboard();

//     if (isPending) {
//         return <DashboardSkeleton />;
//     }

//     if (isError || !data) {
//         const message =
//             error instanceof Error
//                 ? error.message
//                 : "We couldn't load your company dashboard.";

//         return (
//             <div
//                 role="alert"
//                 className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8"
//             >
//                 <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
//                     <Activity size={20} />
//                 </div>
//                 <h2 className="mt-4 text-base font-semibold text-slate-900">
//                     Dashboard unavailable
//                 </h2>
//                 <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
//                     {message}
//                 </p>
//                 <button
//                     type="button"
//                     onClick={() => void refetch()}
//                     disabled={isFetching}
//                     className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
//                 >
//                     <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
//                     Try again
//                 </button>
//             </div>
//         );
//     }

//     const { stats, recentRequests } = data;

//     return (
//         <div className="space-y-6 sm:space-y-7">
//             <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-5 py-6 text-white sm:px-7 sm:py-8">
//                 <div
//                     aria-hidden="true"
//                     className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/20 blur-[80px]"
//                 />
//                 <div
//                     aria-hidden="true"
//                     className="pointer-events-none absolute -bottom-36 right-1/3 size-64 rounded-full bg-violet-500/10 blur-[80px]"
//                 />

//                 <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
//                     <div className="max-w-xl">
//                         <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-slate-300">
//                             <span className="size-1.5 rounded-full bg-emerald-400" />
//                             Company workspace
//                         </div>
//                         <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
//                             Welcome to {data.companyName}
//                         </h2>
//                         <p className="mt-2 max-w-lg text-xs leading-6 text-slate-400 sm:text-sm">
//                             Stay on top of incoming requests, keep cases moving, and help
//                             your team deliver better customer outcomes.
//                         </p>
//                     </div>

//                     <Link
//                         to="/dashboard/requests"
//                         className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-950 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:self-center"
//                     >
//                         Review requests <ArrowRight size={15} />
//                     </Link>
//                 </div>
//             </section>

//             <section aria-label="Company statistics">
//                 <div className="mb-4 flex items-center justify-between gap-3">
//                     <div>
//                         <h2 className="text-sm font-semibold text-slate-900">
//                             Support at a glance
//                         </h2>
//                         <p className="mt-1 text-xs text-slate-500">
//                             An overview of your company’s current workload.
//                         </p>
//                     </div>
//                     <span className="hidden text-[10px] text-slate-400 sm:inline">
//                         Updates automatically
//                     </span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
//                     <StatCard
//                         label="Total requests"
//                         value={stats.totalRequests}
//                         description="Requests received by your company"
//                         icon={Inbox}
//                         tone="indigo"
//                         index={0}
//                     />
//                     <StatCard
//                         label="Pending requests"
//                         value={stats.pendingRequests}
//                         description="Requests awaiting review"
//                         icon={Activity}
//                         tone="amber"
//                         index={1}
//                     />
//                     <StatCard
//                         label="Active cases"
//                         value={stats.activeCases}
//                         description="Cases currently being handled"
//                         icon={ClipboardCheck}
//                         tone="blue"
//                         index={2}
//                     />
//                     <StatCard
//                         label="Resolved cases"
//                         value={stats.resolvedCases}
//                         description="Cases marked as resolved"
//                         icon={BarChart3}
//                         tone="emerald"
//                         index={3}
//                     />
//                 </div>
//             </section>

//             <section className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_290px]">
//                 <RecentRequests requests={recentRequests} />

//                 <aside className="space-y-4">
//                     <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
//                         <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
//                             <Users size={18} />
//                         </div>
//                         <h2 className="mt-4 text-sm font-semibold text-slate-900">
//                             Working as a team
//                         </h2>
//                         <p className="mt-2 text-xs leading-5 text-slate-500">
//                             Keep ownership clear and coordinate case handling with your
//                             company colleagues.
//                         </p>
//                         <Link
//                             to="/dashboard/team"
//                             className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
//                         >
//                             View team <ArrowRight size={14} />
//                         </Link>
//                     </div>

//                     <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
//                         <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
//                             <BarChart3 size={18} />
//                         </div>
//                         <h2 className="mt-4 text-sm font-semibold text-slate-900">
//                             Understand your workload
//                         </h2>
//                         <p className="mt-2 text-xs leading-5 text-slate-500">
//                             Use reports to understand request volume, case progress, and
//                             resolution trends.
//                         </p>
//                         <Link
//                             to="/dashboard/reports"
//                             className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
//                         >
//                             Explore reports <ArrowRight size={14} />
//                         </Link>
//                     </div>
//                 </aside>
//             </section>
//         </div>
//     );
// }
