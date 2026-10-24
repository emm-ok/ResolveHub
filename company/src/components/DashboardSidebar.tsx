
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    BarChart3,
    Building2,
    ChevronDown,
    ClipboardList,
    FileClock,
    LayoutDashboard,
    LifeBuoy,
    ShieldCheck,
    Users,
    X,
    Inbox,
} from "lucide-react";
import { NavLink } from "react-router";
import { UserButton, useUser } from "@clerk/clerk-react";

interface DashboardSidebarProps {
    mobile?: boolean;
    onNavigate?: () => void;
    onClose?: () => void;
}

const navigation = [
    {
        label: "WORKSPACE",
        items: [
            { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
            { label: "Requests", path: "/dashboard/requests", icon: Inbox, badge: "Requests" },
            { label: "Cases", path: "/dashboard/cases", icon: ClipboardList },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            { label: "Team members", path: "/dashboard/team", icon: Users },
            { label: "Reports", path: "/dashboard/reports", icon: BarChart3 },
            { label: "Audit activity", path: "/dashboard/audit-logs", icon: FileClock },
        ],
    },
];

export default function DashboardSidebar({
    mobile = false,
    onNavigate,
    onClose,
}: DashboardSidebarProps) {
    const { user } = useUser();

    const displayName =
        user?.fullName || user?.primaryEmailAddress?.emailAddress || "Company member";

    return (
        <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-slate-200/80 bg-white">
            <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
                <NavLink
                    to="/dashboard"
                    onClick={onNavigate}
                    className="flex min-w-0 items-center gap-3"
                    aria-label="ResolveHub dashboard"
                >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-white shadow-sm">
                        <span className="text-lg font-bold">R</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[17px] font-bold tracking-[-0.7px] text-slate-950">
                            ResolveHub
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-[1.6px] text-slate-400">
                            Company workspace
                        </p>
                    </div>
                </NavLink>

                {mobile && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="px-4 pt-5">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Current company workspace"
                >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                        <Building2 size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                            Company workspace
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Member portal
                        </p>
                    </div>
                    <ChevronDown size={15} className="shrink-0 text-slate-400" />
                </button>
            </div>

            <nav
                aria-label="Company dashboard navigation"
                className="flex-1 space-y-7 overflow-y-auto px-3 py-7"
            >
                {navigation.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[1.5px] text-slate-400">
                            {group.label}
                        </p>

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={"end" in item ? item.end : false}
                                        onClick={onNavigate}
                                        className={({ isActive }) =>
                                            [
                                                "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5",
                                                "text-[13px] font-medium transition-colors duration-200",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            ].join(" ")
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="company-sidebar-active"
                                                        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-indigo-600"
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                                <Icon
                                                    size={17}
                                                    strokeWidth={isActive ? 2.1 : 1.8}
                                                    className="shrink-0"
                                                />
                                                <span className="flex-1">{item.label}</span>
                                                {isActive && (
                                                    <span className="size-1.5 rounded-full bg-indigo-600" />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="px-4 pb-4">
                <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                        <LifeBuoy size={16} />
                    </div>
                    <p className="mt-3 text-xs font-semibold">Need a hand?</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        Contact your workspace administrator for help with access.
                    </p>
                    <a
                        href="mailto:support@resolvehub.com"
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-200 hover:text-white"
                    >
                        Get support <ArrowUpRight size={13} />
                    </a>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "!size-9",
                            },
                        }}
                        userProfileMode="modal"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                            {displayName}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-slate-400">
                            {user?.primaryEmailAddress?.emailAddress || "Signed-in member"}
                        </p>
                    </div>
                    <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                </div>
            </div>
        </aside>
    );
}
