import Link from "next/link";
import {
    ArrowRight,
    Building2,
    FileText,
    Search,
} from "lucide-react";

const actions = [
    {
        title: "Submit a request",
        description: "Find a company and explain how they can help.",
        href: "/dashboard/companies",
        icon: FileText,
        iconStyle: "bg-indigo-50 text-indigo-600",
    },
    {
        title: "Browse companies",
        description: "Explore companies available on ResolveHub.",
        href: "/dashboard/companies",
        icon: Building2,
        iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
        title: "Track a request",
        description: "Open your requests to review their progress.",
        href: "/dashboard/requests",
        icon: Search,
        iconStyle: "bg-amber-50 text-amber-600",
    },
];

export function QuickActions() {
    return (
        <section>
            <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        Quick actions
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Get where you need to go, faster.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {actions.map(
                    ({ title, description, href, icon: Icon, iconStyle }) => (
                        <Link
                            key={title}
                            href={href}
                            className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <span
                                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                            >
                                <Icon size={20} strokeWidth={1.8} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {title}
                                    </span>

                                    <ArrowRight
                                        size={16}
                                        className="shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-600"
                                    />
                                </span>

                                <span className="mt-2 block text-xs leading-5 text-slate-500">
                                    {description}
                                </span>
                            </span>
                        </Link>
                    ),
                )}
            </div>
        </section>
    );
}