import Link from "next/link";
import { ArrowUpRight, Building2, CircleHelp } from "lucide-react";

interface DashboardWelcomeProps {
    name?: string | null;
}

export function DashboardWelcome({
    name,
}: DashboardWelcomeProps) {
    const firstName =
        name?.trim().split(/\s+/)[0] || "there";

    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div
                aria-hidden="true"
                className="absolute -right-16 -top-32 -z-10 size-80 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-32 right-1/4 -z-10 size-64 rounded-full bg-blue-500/10 blur-3xl"
            />

            <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-200">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    YOUR CUSTOMER WORKSPACE
                </span>

                <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Welcome back, {firstName}.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                    Need help with a service or an issue? Submit a request
                    to the right company and use your request reference to
                    keep track of it.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/companies"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition-all hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                        <Building2 size={17} />
                        Find a company
                        <ArrowUpRight size={16} />
                    </Link>

                    <Link
                        href="/dashboard/requests"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-medium text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <CircleHelp size={17} />
                        My requests
                    </Link>
                </div>
            </div>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-8 hidden h-48 w-48 translate-y-8 items-center justify-center rounded-full border border-white/10 md:flex"
            >
                <div className="flex size-36 items-center justify-center rounded-full border border-white/10">
                    <div className="flex size-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                        <Building2 size={40} strokeWidth={1.1} className="text-indigo-200" />
                    </div>
                </div>
            </div>
        </section>
    );
}