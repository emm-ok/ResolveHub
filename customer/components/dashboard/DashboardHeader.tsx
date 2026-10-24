"use client";

import { SignInButton, SignUpButton, useAuth, useClerk, UserButton } from "@clerk/nextjs";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useCurrentUser } from "@/hooks/useUser";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({
    onMenuClick,
}: DashboardHeaderProps) {
    const { signOut } = useClerk();
    const { isSignedIn, isLoaded } = useAuth();

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
                <div className="flex items-center gap-2">
                    {!isLoaded ? (
                        <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-100" />
                    ) : isSignedIn ? (
                        <>
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

                            <Link
                                href="/dashboard"
                                className="
                                    hidden rounded-full
                                    px-4 py-2
                                    text-sm font-medium
                                    text-neutral-600
                                    transition-colors
                                    hover:text-neutral-950
                                    sm:block
                                  "
                            >
                                Dashboard
                            </Link>

                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-9 w-9",
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <SignInButton
                                mode="modal"
                                fallbackRedirectUrl="/dashboard"
                            >
                                <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="
                                      hidden rounded-full
                                      px-4 py-2
                                      text-sm font-medium
                                      text-neutral-600
                                      transition-colors
                                      hover:text-neutral-950
                                      sm:block
                                    "
                                >
                                    Sign in
                                </motion.button>
                            </SignInButton>

                            <SignUpButton
                                mode="modal"
                                fallbackRedirectUrl="/dashboard"
                            >
                                <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="
                                      rounded-full
                                      bg-neutral-950
                                      px-4 py-2
                                      text-sm font-medium
                                      text-white
                                      shadow-sm
                                      transition-all
                                      hover:bg-neutral-800
                                      hover:shadow-md
                                    "
                                >
                                    Get started
                                </motion.button>
                            </SignUpButton>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}