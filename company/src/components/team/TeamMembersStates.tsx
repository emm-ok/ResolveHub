
import { AlertCircle, LoaderCircle, RefreshCw, Users } from "lucide-react";

type Props = {
    state: "loading" | "error" | "empty";
    message?: string;
    onRetry?: () => void;
};

export default function TeamMembersStates({
    state,
    message,
    onRetry,
}: Props) {
    if (state === "loading") {
        return (
            <div
                aria-label="Loading team members"
                aria-busy="true"
                className="overflow-hidden rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800"
            >
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    <LoaderCircle size={18} className="animate-spin text-neutral-500" />
                    <p className="text-sm text-neutral-500">Loading team members...</p>
                </div>
                <div className="mt-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                            </div>
                            <div className="hidden h-7 w-20 animate-pulse rounded-full bg-neutral-100 sm:block dark:bg-neutral-800" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50/50 px-5 py-12 text-center dark:border-red-900 dark:bg-red-950/20">
                <AlertCircle size={24} className="text-red-600 dark:text-red-300" />
                <h3 className="mt-3 font-semibold">Couldn't load team members</h3>
                <p className="mt-1 max-w-md text-sm text-neutral-500">
                    {message || "Something went wrong while retrieving your team."}
                </p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                    >
                        <RefreshCw size={15} />
                        Try again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-5 py-14 text-center dark:border-neutral-800">
            <Users size={24} className="text-neutral-400" />
            <h3 className="mt-3 font-semibold">No members yet</h3>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Your company team will appear here once members have joined.
            </p>
        </div>
    );
}
