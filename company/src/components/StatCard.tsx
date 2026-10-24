
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    accent: string;
    delay?: number;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    accent,
    delay = 0,
}: StatCardProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : delay,
                ease: "easeOut",
            }}
            className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 dark:border-white/10 dark:bg-slate-900"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {value.toLocaleString()}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
                >
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </motion.article>
    );
}
