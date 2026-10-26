
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    FileSearch,
    RefreshCw,
} from "lucide-react";

export type CasePageState =
    | "loading"
    | "error"
    | "not-found"
    | "invalid-id";

interface CasePageStatesProps {
    state: CasePageState;
    onRetry?: () => void;
    onBack?: () => void;
    message?: string;
}

const stateContent = {
    error: {
        icon: AlertCircle,
        title: "Unable to load this case",
        description:
            "Something went wrong while retrieving the case details. Check your connection and try again.",
        action: "Try again",
    },
    "not-found": {
        icon: FileSearch,
        title: "Case not found",
        description:
            "This case may have been removed, or you may not have access to it.",
        action: "Back to cases",
    },
    "invalid-id": {
        icon: FileSearch,
        title: "Invalid case link",
        description:
            "The case link is incomplete or invalid. Return to your cases list to select a case.",
        action: "Back to cases",
    },
};

export default function CasePageStates({
    state,
    onRetry,
    onBack,
    message,
}: CasePageStatesProps) {
    if (state === "loading") {
        return (
            <main
                className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
                aria-label="Loading case details"
                aria-busy="true"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-100" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
                        <div className="h-6 w-48 max-w-full animate-pulse rounded bg-neutral-200" />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                            <div className="mb-5 h-4 w-24 animate-pulse rounded bg-neutral-100" />
                            <div className="mb-4 h-7 w-3/4 animate-pulse rounded bg-neutral-200" />
                            <div className="space-y-2">
                                <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                                <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                            <div className="mb-6 h-5 w-36 animate-pulse rounded bg-neutral-200" />
                            <div className="space-y-5">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex gap-3">
                                        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-100" />
                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
                                            <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="rounded-2xl border border-neutral-200 bg-white p-5"
                            >
                                <div className="mb-5 h-4 w-28 animate-pulse rounded bg-neutral-200" />
                                <div className="space-y-4">
                                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                                    <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
                                    <div className="h-3 w-3/5 animate-pulse rounded bg-neutral-100" />
                                </div>
                            </div>
                        ))}
                    </aside>
                </div>
            </main>
        );
    }

    const content = stateContent[state];
    const Icon = content.icon;
    const isRetryable = state === "error";
    const handleAction = isRetryable ? onRetry : onBack;

    return (
        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6">
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-md text-center"
                role="alert"
                aria-live="polite"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                    <Icon className="h-7 w-7 text-neutral-700" strokeWidth={1.6} />
                </div>

                <h1 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                    {content.title}
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                    {message || content.description}
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    {handleAction && (
                        <button
                            type="button"
                            onClick={handleAction}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                        >
                            {isRetryable ? (
                                <RefreshCw className="h-4 w-4" />
                            ) : (
                                <ArrowLeft className="h-4 w-4" />
                            )}
                            {content.action}
                        </button>
                    )}

                    {isRetryable && onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to cases
                        </button>
                    )}
                </div>
            </motion.section>
        </main>
    );
}
