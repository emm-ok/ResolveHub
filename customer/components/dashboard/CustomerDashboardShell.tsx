"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CustomerSidebar } from "./CustomerSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function CustomerDashboardShell({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    return (
        <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
            <CustomerSidebar
                mobileMenuOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.button
                        type="button"
                        aria-label="Close navigation menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen lg:pl-[264px]">
                <DashboardHeader
                    onMenuClick={() => setMobileMenuOpen(true)}
                />

                <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-9">
                    <motion.div
                        key={pathname}
                        initial={
                            reduceMotion
                                ? false
                                : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}