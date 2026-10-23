"use client";

import { useClerk } from "@clerk/nextjs";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useCurrentUser } from "@/hooks/useUser";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({
    onMenuClick,
}: DashboardHeaderProps) {
    const { signOut } = useClerk();
    const { data: currentUser } = useCurrentUser();

    const displayName =
        currentUser?.name?.trim() || "Customer";

    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
                >
                    <Menu size={20} />
                </button>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                        Customer workspace
                    </p>
                    <p className="hidden text-xs text-slate-500 sm:block">
                        Manage your requests in one place
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-200/70">
                        {initials || "C"}
                    </div>

                    <div className="hidden min-w-0 md:block">
                        <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                            {displayName}
                        </p>
                        <p className="max-w-36 truncate text-xs text-slate-500">
                            {currentUser?.email ?? ""}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void signOut({ redirectUrl: "/dashboard" })}
                    className="inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:border sm:border-slate-200 sm:px-3"
                    aria-label="Sign out"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sign out</span>
                    <ChevronDown size={14} className="hidden sm:inline" />
                </button>
            </div>
        </header>
    );
}