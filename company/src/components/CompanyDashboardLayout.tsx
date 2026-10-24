
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    Bell,
    Menu,
    Search,
    ChevronRight,
} from "lucide-react";
import { Outlet, useLocation, Link } from "react-router";
import DashboardSidebar from "./DashboardSidebar";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks/useUser";

const pageTitles: Record<string, { title: string; description: string }> = {
    "/dashboard": {
        title: "Overview",
        description: "A clear view of your company's customer support activity.",
    },
    "/dashboard/requests": {
        title: "Customer requests",
        description: "Review and manage requests submitted to your company.",
    },
    "/dashboard/cases": {
        title: "Cases",
        description: "Track case ownership, progress, and resolution.",
    },
    "/dashboard/team": {
        title: "Team members",
        description: "View your company team and their workspace access.",
    },
    "/dashboard/reports": {
        title: "Reports",
        description: "Review case trends and team performance.",
    },
    "/dashboard/audit-logs": {
        title: "Audit activity",
        description: "Review recorded activity within your workspace.",
    },
    "/dashboard/settings": {
        title: "Settings",
        description: "Manage your personal workspace preferences.",
    },
};

export default function CompanyDashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { user } = useUser();
    const {data: currentUser} = useCurrentUser();
    const reduceMotion = useReducedMotion();

    const page = pageTitles[location.pathname] ?? {
        title: "Workspace",
        description: "Manage your company's customer support activity.",
    };

    const firstName =
        user?.firstName ||
        "there";

        console.log("CurrentUser", currentUser)
        const companyRole = currentUser?.memberships[0]?.role?.name
    // const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Company member";
    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
            <div className="flex min-h-screen">
                <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
                    <DashboardSidebar />
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.button
                                key="sidebar-backdrop"
                                type="button"
                                aria-label="Close navigation"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileOpen(false)}
                                className="fixed inset-0 z-40 cursor-default bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
                            />

                            <motion.div
                                key="mobile-sidebar"
                                initial={reduceMotion ? false : { x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                            >
                                <DashboardSidebar
                                    mobile
                                    onNavigate={() => setMobileOpen(false)}
                                    onClose={() => setMobileOpen(false)}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex min-w-0 flex-1 flex-col lg:ml-[264px]">
                    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open navigation"
                                aria-expanded={mobileOpen}
                                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
                            >
                                <Menu size={19} />
                            </button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <span className="hidden sm:inline">Company workspace</span>
                                    <ChevronRight size={12} className="hidden sm:block" />
                                    <span className="truncate text-slate-600">{page.title}</span>
                                </div>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                    {page.title}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <Link
                                to="/dashboard/requests"
                                aria-label="Search requests"
                                className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Search size={18} />
                            </Link>

                            <button
                                type="button"
                                aria-label="Notifications"
                                title="Notifications"
                                className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Bell size={18} />
                            </button>

                            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                            <div className="hidden text-right sm:block">
                                <p className="text-xs font-semibold text-slate-800">
                                    Good to see you, {firstName}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                    Company member: {companyRole}
                                </p>
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
                            </div>
                        </div>
                    </header>

                    <main className="w-full flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
                        <motion.div
                            key={location.pathname}
                            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="mx-auto w-full max-w-[1440px]"
                        >
                            <div className="mb-7 sm:mb-8">
                                <p className="text-[11px] font-semibold uppercase tracking-[1.7px] text-indigo-600">
                                    Workspace
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-[30px]">
                                    {page.title}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    {page.description}
                                </p>
                            </div>

                            <Outlet />
                        </motion.div>
                    </main>

                    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 bg-white/70 px-4 py-4 text-[11px] text-slate-400 sm:px-7 lg:px-9">
                        <span>© {new Date().getFullYear()} ResolveHub</span>
                        <span>Company workspace</span>
                    </footer>
                </div>
            </div>
        </div>
    );
}
