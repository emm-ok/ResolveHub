
import { motion } from "framer-motion";
import {
    BriefcaseBusiness,
    CircleDot,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    UserRoundX,
} from "lucide-react";

import type { CaseKpis } from "../../types/case";

const metrics = [
    {
        key: "totalCases",
        label: "Total cases",
        description: "All recorded cases",
        icon: BriefcaseBusiness,
    },
    {
        key: "openCases",
        label: "Open cases",
        description: "Awaiting progress",
        icon: CircleDot,
    },
    {
        key: "inProgressCases",
        label: "In progress",
        description: "Currently being handled",
        icon: Clock3,
    },
    {
        key: "resolvedCases",
        label: "Resolved",
        description: "Completed cases",
        icon: CheckCircle2,
    },
    {
        key: "overdueCases",
        label: "Overdue",
        description: "Past their SLA deadline",
        icon: AlertTriangle,
    },
    {
        key: "unassignedCases",
        label: "Unassigned",
        description: "Awaiting an owner",
        icon: UserRoundX,
    },
] as const;

interface Props {
    data?: CaseKpis;
    isLoading: boolean;
    onSelectStatus?: (status: string) => void;
}

export function CaseKpiCards({
    data,
    isLoading,
    onSelectStatus,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                    <motion.button
                        key={metric.key}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.035 }}
                        whileHover={{ y: -2 }}
                        onClick={() => {
                            if (
                                metric.key === "openCases" ||
                                metric.key === "inProgressCases" ||
                                metric.key === "resolvedCases"
                            ) {
                                onSelectStatus?.(
                                    metric.key === "openCases"
                                        ? "OPEN"
                                        : metric.key === "inProgressCases"
                                            ? "IN_PROGRESS"
                                            : "RESOLVED",
                                );
                            }
                        }}
                        className="group min-w-0 rounded-xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-600">
                                    {metric.label}
                                </p>

                                {isLoading ? (
                                    <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-neutral-100" />
                                ) : (
                                    <p className="mt-2 text-3xl font-semibold tracking-tight text-black tabular-nums">
                                        {(data?.[metric.key] ?? 0).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-700 transition-colors group-hover:bg-neutral-100">
                                <Icon size={19} strokeWidth={1.8} />
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-neutral-500">
                            {metric.description}
                        </p>
                    </motion.button>
                );
            })}
        </div>
    );
}
