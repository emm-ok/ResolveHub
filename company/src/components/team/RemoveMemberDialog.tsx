import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    ShieldAlert,
    UserRound,
    X,
} from "lucide-react";
import type { CompanyMember } from "../../types/company-member";

type Props = {
    member: CompanyMember | null;
    isRemoving: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function RemoveMemberDialog({
    member,
    isRemoving,
    error,
    onClose,
    onConfirm,
}: Props) {
    const titleId = useId();
    const descriptionId = useId();
    const isAlreadyRemoved = member?.status === "REMOVED";

    useEffect(() => {
        if (!member) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isRemoving) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [member, isRemoving, onClose]);

    return (
        <AnimatePresence>
            {member && (
                <motion.div
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isRemoving
                        ) {
                            onClose();
                        }
                    }}
                >
                    <motion.section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-950/15 sm:rounded-3xl"
                    >
                        {/* Accent */}
                        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-rose-500 to-violet-500" />

                        <div className="p-5 sm:p-6">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                                    {isAlreadyRemoved ? (
                                        <CheckCircle2 size={22} />
                                    ) : (
                                        <AlertTriangle size={22} />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 pt-0.5">
                                    <h2
                                        id={titleId}
                                        className="text-lg font-semibold tracking-tight text-neutral-950 sm:text-xl"
                                    >
                                        {isAlreadyRemoved
                                            ? "Member already removed"
                                            : "Remove team member?"}
                                    </h2>

                                    <p
                                        id={descriptionId}
                                        className="mt-1.5 text-sm leading-6 text-neutral-500"
                                    >
                                        {isAlreadyRemoved
                                            ? "This member no longer has access to the company."
                                            : "Please review the consequences before confirming this action."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isRemoving}
                                    aria-label="Close confirmation dialog"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Member identity */}
                            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                    <UserRound size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-neutral-900">
                                        {member.user.name || "Unnamed member"}
                                    </p>
                                    <p className="mt-0.5 break-all text-xs leading-5 text-neutral-500">
                                        {member.user.email}
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${isAlreadyRemoved
                                            ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                                            : "border-amber-200 bg-amber-50 text-amber-700"
                                        }`}
                                >
                                    {isAlreadyRemoved ? "Removed" : "Member"}
                                </span>
                            </div>

                            {/* Consequences */}
                            {!isAlreadyRemoved && (
                                <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert
                                            size={17}
                                            className="shrink-0 text-amber-700"
                                        />
                                        <h3 className="text-sm font-semibold text-amber-950">
                                            What happens next?
                                        </h3>
                                    </div>

                                    <ul className="mt-3 space-y-2.5">
                                        {[
                                            "Their company membership will be marked as removed.",
                                            "Their active case assignments will be automatically unassigned.",
                                            "Historical records and audit history will be retained.",
                                        ].map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2.5 text-xs leading-5 text-amber-900 sm:text-sm"
                                            >
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Error */}
                            <AnimatePresence initial={false}>
                                {error && (
                                    <motion.div
                                        role="alert"
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -4,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -4,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                                            <AlertTriangle
                                                size={17}
                                                className="mt-0.5 shrink-0 text-red-600"
                                            />
                                            <p className="text-sm leading-5 text-red-700">
                                                {error}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isRemoving}
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-24"
                                >
                                    Cancel
                                </button>

                                {!isAlreadyRemoved && (
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={isRemoving}
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm shadow-red-600/15 transition-all hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
                                    >
                                        {isRemoving ? (
                                            <>
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                <span>Removing member...</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle
                                                    size={16}
                                                    className="transition-transform group-hover:scale-110"
                                                />
                                                <span>Confirm removal</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {!isAlreadyRemoved && (
                                <p className="mt-4 text-center text-[11px] leading-5 text-neutral-400">
                                    This action affects company access but
                                    preserves historical records.
                                </p>
                            )}
                        </div>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}