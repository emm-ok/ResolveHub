import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

export function RecentRequestsPanel() {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        Your requests
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Access your submitted requests and reference numbers.
                    </p>
                </div>

                <Link
                    href="/dashboard/requests"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                >
                    View all
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="flex flex-col items-center px-5 py-10 text-center sm:py-12">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                    <ClipboardList size={25} strokeWidth={1.5} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    Keep your requests in one place
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Once request history is connected, your latest submissions,
                    reference numbers, and statuses will appear here.
                </p>

                <Link
                    href="/dashboard/companies"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                    Submit a request
                </Link>
            </div>
        </section>
    );
}