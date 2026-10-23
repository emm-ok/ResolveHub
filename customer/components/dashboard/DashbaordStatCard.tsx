import type { ReactNode } from "react";

interface DashboardStatCardProps {
    label: string;
    description: string;
    icon: ReactNode;
    accent: "indigo" | "emerald" | "amber";
}

const accentStyles = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
};

export function DashboardStatCard({
    label,
    description,
    icon,
    accent,
}: DashboardStatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
                    {icon}
                </div>

                <span
                    className={`rounded-lg p-2 ring-1 ${accentStyles[accent]}`}
                >
                    <span className="block size-4">{icon}</span>
                </span>
            </div>

            <h2 className="mt-5 text-sm font-semibold text-slate-900">
                {label}
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}