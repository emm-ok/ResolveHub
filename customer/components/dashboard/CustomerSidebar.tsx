"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FolderOpen,
    Building2,
    UserRound,
    Headset,
    X,
} from "lucide-react";

const navigation = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "My Requests",
        href: "/dashboard/requests",
        icon: FolderOpen,
    },
    {
        label: "Companies",
        href: "/dashboard/companies",
        icon: Building2,
    },
    {
        label: "My Profile",
        href: "/dashboard/profile",
        icon: UserRound,
    },
];

interface CustomerSidebarProps {
    mobileMenuOpen: boolean;
    onClose: () => void;
}

export function CustomerSidebar({
    mobileMenuOpen,
    onClose,
}: CustomerSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={[
                "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col",
                "border-r border-slate-200/80 bg-white",
                "transition-transform duration-300 ease-out",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0",
            ].join(" ")}
        >
            <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
                <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="group flex items-center gap-3"
                >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform group-hover:scale-[1.04]">
                        <Headset size={21} strokeWidth={2.2} />
                    </span>

                    <span className="text-[21px] font-bold tracking-tight text-slate-950">
                        Resolve<span className="text-indigo-600">Hub</span>
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close sidebar"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="px-4 pt-8">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Workspace
                </p>

                <nav aria-label="Customer navigation" className="space-y-1.5">
                    {navigation.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            href === "/dashboard"
                                ? pathname === href
                                : pathname === href ||
                                pathname.startsWith(`${href}/`);

                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onClose}
                                aria-current={isActive ? "page" : undefined}
                                className={[
                                    "group relative flex items-center gap-3 rounded-xl",
                                    "px-3.5 py-3 text-[13px] font-medium",
                                    "transition-colors duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                                ].join(" ")}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="dashboard-nav-indicator"
                                        className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-indigo-600"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 32,
                                        }}
                                    />
                                )}

                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.2 : 1.8}
                                    className={
                                        isActive
                                            ? "text-indigo-600"
                                            : "text-slate-400 transition-colors group-hover:text-slate-700"
                                    }
                                />

                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/70">
                        <Headset size={18} />
                    </div>

                    <p className="text-sm font-semibold text-slate-900">
                        Need assistance?
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        Browse companies to find the right place to submit your request.
                    </p>

                    <Link
                        href="/companies"
                        onClick={onClose}
                        className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                    >
                        Explore companies
                        <span aria-hidden="true" className="ml-1">→</span>
                    </Link>
                </div>

                <p className="mt-5 px-1 text-[10px] text-slate-400">
                    ResolveHub · Customer workspace
                </p>
            </div>
        </aside>
    );
}