"use client";

import { useCurrentUser } from "@/hooks/useUser";
import {
    Building2,
    FileCheck2,
    MessageSquareText,
} from "lucide-react";
import { DashboardWelcome } from "./DashboardWelcome";
import { DashboardStatCard } from "./DashbaordStatCard";
import { QuickActions } from "./QuickActions";
import { RecentRequestsPanel } from "./RecentRequestPanel";

export default function CustomerDashboardPage() {
    const {
        data: currentUser,
        isPending,
        isError,
        refetch,
    } = useCurrentUser();

    return (
        <div className="space-y-8 sm:space-y-9">
            <DashboardWelcome name={currentUser?.name} />

            {isError && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-amber-900">
                        We couldn&apos;t load your account details. You can still browse companies.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="text-left text-sm font-semibold text-amber-900 underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            )}

            <section>
                <div className="mb-4">
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        Your workspace
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Everything you need to manage your support experience.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DashboardStatCard
                        label="Request management"
                        description={
                            isPending
                                ? "Loading your account…"
                                : "Access submissions and keep your reference numbers handy."
                        }
                        icon={<FileCheck2 size={19} />}
                        accent="indigo"
                    />

                    <DashboardStatCard
                        label="Company directory"
                        description="Discover companies and their available request forms."
                        icon={<Building2 size={19} />}
                        accent="emerald"
                    />

                    <DashboardStatCard
                        label="Request details"
                        description="Use your request reference when following up on an issue."
                        icon={<MessageSquareText size={19} />}
                        accent="amber"
                    />
                </div>
            </section>

            <QuickActions />

            <RecentRequestsPanel />
        </div>
    );
}