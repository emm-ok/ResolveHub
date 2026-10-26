
import { Activity, CircleDot, Clock3 } from "lucide-react";
import type { CaseActivity } from "../../types/case-details";

interface Props {
    activities: CaseActivity[];
    isLoading: boolean;
    error?: string | null;
    onRetry?: () => void;
}

function formatTimestamp(value: string) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function CaseActivityTimeline({
    activities,
    isLoading,
    error,
    onRetry,
}: Props) {
    return (
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4 sm:px-5">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                    <Activity size={17} className="text-neutral-700" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-black">
                        Activity history
                    </h2>
                    <p className="mt-1 text-xs text-neutral-500">
                        Recent changes and events on this case.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-5 p-5" aria-label="Loading activity">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex animate-pulse gap-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-100" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 w-2/3 rounded bg-neutral-100" />
                                <div className="h-3 w-1/3 rounded bg-neutral-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 text-center">
                    <p className="text-sm text-neutral-600">{error}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-2 text-sm font-semibold text-black underline underline-offset-4"
                        >
                            Try again
                        </button>
                    )}
                </div>
            ) : activities.length === 0 ? (
                <div className="px-5 py-9 text-center">
                    <Clock3 size={21} className="mx-auto text-neutral-400" />
                    <p className="mt-2 text-sm font-medium text-black">
                        No activity recorded yet
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                        Case changes will appear here.
                    </p>
                </div>
            ) : (
                <ol className="divide-y divide-neutral-100">
                    {activities.map((activity) => (
                        <li key={activity.id} className="flex gap-3 px-4 py-4 sm:px-5">
                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                                <CircleDot size={15} className="text-neutral-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="break-words text-sm leading-5 text-neutral-800">
                                    {activity.summary}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                                    {activity.actor?.name && (
                                        <span>{activity.actor.name}</span>
                                    )}
                                    {activity.actor?.name && <span>·</span>}
                                    <time dateTime={activity.createdAt}>
                                        {formatTimestamp(activity.createdAt)}
                                    </time>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
