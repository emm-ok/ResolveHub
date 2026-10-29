import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock3,
    UserRoundX,
} from "lucide-react";
import type { MembershipStatus } from "../../types/company-member";

const statusConfig: Record<
    MembershipStatus,
    {
        label: string;
        description: string;
        icon: typeof CheckCircle2;
        className: string;
        dotClassName: string;
    }
> = {
    ACTIVE: {
        label: "Active",
        description: "Membership is active",
        icon: CheckCircle2,
        className:
            "border-emerald-200/90 bg-emerald-50 text-emerald-800",
        dotClassName: "bg-emerald-500",
    },
    SUSPENDED: {
        label: "Suspended",
        description: "Membership is temporarily suspended",
        icon: Clock3,
        className:
            "border-amber-200/90 bg-amber-50 text-amber-800",
        dotClassName: "bg-amber-500",
    },
    REMOVED: {
        label: "Removed",
        description: "Membership has been removed",
        icon: UserRoundX,
        className:
            "border-neutral-200 bg-neutral-100 text-neutral-600",
        dotClassName: "bg-neutral-400",
    },
};

type Props = {
    status: MembershipStatus;
    showIcon?: boolean;
    size?: "sm" | "md";
    animated?: boolean;
};

export default function MemberStatusBadge({
    status,
    showIcon = false,
    size = "md",
    animated = true,
}: Props) {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    const sizeClasses = {
        sm: "gap-1.5 px-2 py-0.5 text-[10px]",
        md: "gap-1.5 px-2.5 py-1 text-xs",
    };

    const badgeClassName = [
        "inline-flex w-fit max-w-full shrink-0 items-center",
        "rounded-full border font-semibold leading-4 tracking-[0.01em]",
        "whitespace-nowrap transition-colors duration-200",
        "focus-within:ring-2 focus-within:ring-violet-300",
        sizeClasses[size],
        config.className,
    ].join(" ");

    const content = (
        <>
            {showIcon ? (
                <StatusIcon
                    size={size === "sm" ? 11 : 13}
                    strokeWidth={2.2}
                    aria-hidden="true"
                    className="shrink-0"
                />
            ) : (
                <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
                    {status === "ACTIVE" && (
                        <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500/35" />
                    )}
                    <span
                        className={`relative h-1.5 w-1.5 rounded-full ${config.dotClassName}`}
                    />
                </span>
            )}

            <span className="truncate">{config.label}</span>
        </>
    );

    if (!animated) {
        return (
            <span
                className={badgeClassName}
                title={config.description}
                aria-label={`Membership status: ${config.label}`}
            >
                {content}
            </span>
        );
    }

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={badgeClassName}
            title={config.description}
            aria-label={`Membership status: ${config.label}`}
        >
            {content}
        </motion.span>
    );
}