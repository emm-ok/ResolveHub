import { motion } from "framer-motion";
import {
    AlertCircle,
    RefreshCw,
    ShieldAlert,
} from "lucide-react";

export function SkeletonBlock({
    className = "",
}: {
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className={`animate-pulse rounded-lg bg-neutral-200/80 ${className}`}
        />
    );
}

export function LoadingState({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div
            role="status"
            aria-label={label}
            className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}

export function CompanyDashboardSkeleton() {
    return (
        <LoadingState label="Loading company dashboard">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="h-7 w-48 max-w-full" />
                    <SkeletonBlock className="h-4 w-64 max-w-full" />
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-5 w-40" />
                        <SkeletonBlock className="h-4 w-64 max-w-full" />
                    </div>
                    <SkeletonBlock className="hidden h-9 w-24 rounded-xl sm:block" />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-neutral-100 p-4"
                        >
                            <SkeletonBlock className="h-3 w-24" />
                            <SkeletonBlock className="mt-3 h-7 w-32" />
                            <SkeletonBlock className="mt-3 h-3 w-20" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-3">
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="h-11 w-full rounded-xl" />
                    <SkeletonBlock className="h-11 w-full rounded-xl" />
                </div>
            </div>
        </LoadingState>
    );
}

export function CompanyAccessSkeleton() {
    return (
        <LoadingState label="Loading your company access">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-3 w-32" />
                    <SkeletonBlock className="h-7 w-52 max-w-full" />
                    <SkeletonBlock className="h-4 w-72 max-w-full" />
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <SkeletonBlock className="h-5 w-36" />
                    <SkeletonBlock className="mt-2 h-4 w-60 max-w-full" />

                    <div className="mt-6 flex items-center gap-4">
                        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                            <SkeletonBlock className="h-4 w-40" />
                            <SkeletonBlock className="h-3 w-52 max-w-full" />
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <SkeletonBlock className="h-5 w-32" />
                    <SkeletonBlock className="mt-2 h-4 w-48 max-w-full" />
                    <div className="mt-6 space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex gap-3">
                                <SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <SkeletonBlock className="h-3 w-28" />
                                    <SkeletonBlock className="h-3 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LoadingState>
    );
}

export function CompanyRolesSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading company roles"
            className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4"
        >
            <span className="sr-only">Loading company roles</span>

            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="h-3 w-56 max-w-full" />
                </div>
                <SkeletonBlock className="h-8 w-20 rounded-lg" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonBlock
                        key={index}
                        className="h-8 w-24 rounded-full"
                    />
                ))}
            </div>
        </div>
    );
}

export function MemberRowsSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading team members"
            className="space-y-4"
        >
            <span className="sr-only">Loading team members</span>

            {/* Desktop table skeleton */}
            <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 md:block">
                <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(90px,0.8fr)_minmax(100px,0.8fr)_80px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
                    {[
                        "Member",
                        "Role",
                        "Department",
                        "Status",
                        "Joined",
                        "Actions",
                    ].map((heading) => (
                        <SkeletonBlock
                            key={heading}
                            className="h-3 w-16"
                        />
                    ))}
                </div>

                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-[minmax(220px,1.5fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(90px,0.8fr)_minmax(100px,0.8fr)_80px] items-center gap-4 border-b border-neutral-100 px-5 py-5 last:border-b-0"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <SkeletonBlock className="h-3.5 w-32 max-w-full" />
                                <SkeletonBlock className="h-3 w-40 max-w-full" />
                            </div>
                        </div>
                        <SkeletonBlock className="h-7 w-20 rounded-full" />
                        <SkeletonBlock className="h-3.5 w-24" />
                        <SkeletonBlock className="h-7 w-16 rounded-full" />
                        <SkeletonBlock className="h-3.5 w-20" />
                        <div className="flex gap-2">
                            <SkeletonBlock className="h-8 w-8 rounded-lg" />
                            <SkeletonBlock className="h-8 w-8 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile member-card skeleton */}
            <div className="space-y-3 md:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                        <div className="flex items-start gap-3">
                            <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <SkeletonBlock className="h-4 w-36 max-w-full" />
                                <SkeletonBlock className="h-3 w-44 max-w-full" />
                                <SkeletonBlock className="h-6 w-20 rounded-full" />
                            </div>
                            <SkeletonBlock className="h-8 w-8 rounded-lg" />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
                            <div className="space-y-2">
                                <SkeletonBlock className="h-3 w-16" />
                                <SkeletonBlock className="h-3.5 w-24" />
                            </div>
                            <div className="space-y-2">
                                <SkeletonBlock className="h-3 w-16" />
                                <SkeletonBlock className="h-3.5 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RetryState({
    title,
    description,
    onRetry,
}: {
    title: string;
    description: string;
    onRetry: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mx-auto flex min-h-[280px] w-full max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
        >
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                    <AlertCircle size={22} />
                </div>

                <h2 className="mt-4 text-base font-semibold tracking-tight text-neutral-950">
                    {title}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                    {description}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                    <RefreshCw size={15} />
                    Try again
                </button>
            </div>
        </motion.div>
    );
}

export function AccessDeniedState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mx-auto flex min-h-[280px] w-full max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
        >
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                    <ShieldAlert size={22} />
                </div>

                <h2 className="mt-4 text-base font-semibold tracking-tight text-neutral-950">
                    Access restricted
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    You don’t have permission to view company members. Contact
                    your company administrator if you believe you need access.
                </p>
            </div>
        </motion.div>
    );
}