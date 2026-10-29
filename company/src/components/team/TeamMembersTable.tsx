
import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil,
    UserRound,
    UserX,
    CalendarDays,
    BriefcaseBusiness,
    Building2,
    Hash,
    ShieldCheck,
    Eye,
} from "lucide-react";

import type { CompanyMember } from "../../types/company-member";
import { MemberStatusBadge } from "./StatusBadge";

type Props = {
    members: CompanyMember[];
    currentUserId?: string;
    canUpdate: boolean;
    canRemove: boolean;
    onEdit: (member: CompanyMember) => void;
    onRemove: (member: CompanyMember) => void;
};

function initials(name: string | null, email: string) {
    const value = name?.trim() || email;

    return (
        value
            .split(/[\s@._-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("") || "U"
    );
}

function dateLabel(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function MemberAvatar({
    name,
    email,
    size = "md",
}: {
    name: string | null;
    email: string;
    size?: "md" | "lg";
}) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-100 via-white to-purple-100 font-semibold text-violet-800 shadow-sm ${size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
                }`}
            aria-hidden="true"
        >
            {initials(name, email)}
        </div>
    );
}

function MemberActions({
    member,
    currentUserId,
    canUpdate,
    canRemove,
    onEdit,
    onRemove,
}: Props & { member: CompanyMember }) {
    const isSelf = member.user.id === currentUserId;
    const isRemoved = member.status === "REMOVED";
    const showEdit = canUpdate && !isRemoved;
    const showRemove = canRemove && !isRemoved && !isSelf;

    if (!showEdit && !showRemove) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-2 text-xs font-medium text-neutral-500">
                <Eye size={14} />
                {isRemoved ? "No actions available" : isSelf ? "Your account" : "View only"}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {showEdit && (
                <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onEdit(member)}
                    aria-label={`Edit ${member.user.name || member.user.email}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                    <Pencil size={14} />
                    <span>Edit</span>
                </motion.button>
            )}

            {showRemove && (
                <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onRemove(member)}
                    aria-label={`Remove ${member.user.name || member.user.email}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                    <UserX size={14} />
                    <span>Remove</span>
                </motion.button>
            )}
        </div>
    );
}

function MemberIdentity({
    member,
    currentUserId,
}: {
    member: CompanyMember;
    currentUserId?: string;
}) {
    const isSelf = member.user.id === currentUserId;

    return (
        <div className="flex min-w-0 items-center gap-3">
            <MemberAvatar name={member.user.name} email={member.user.email} />

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="max-w-[240px] truncate text-sm font-semibold text-neutral-900">
                        {member.user.name || "Unnamed member"}
                    </p>

                    {isSelf && (
                        <span className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                            You
                        </span>
                    )}
                </div>

                <p className="mt-1 max-w-[260px] truncate text-xs text-neutral-500">
                    {member.user.email}
                </p>

                {member.employeeId && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                        <Hash size={11} />
                        {member.employeeId}
                    </p>
                )}
            </div>
        </div>
    );
}

function EmptyMembers() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-16 text-center"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-700">
                <UserRound size={25} strokeWidth={1.7} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-neutral-900">
                No team members found
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                No members match your current search or filters. Try adjusting your
                selection to see more results.
            </p>
        </motion.div>
    );
}

export default function TeamMembersTable(props: Props) {
    const { members, currentUserId } = props;

    if (members.length === 0) {
        return <EmptyMembers />;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.section
                key={members.map((member) => member.id).join("-")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                aria-label="Company team members"
                className="space-y-3"
            >
                {/* Desktop and tablet table */}
                <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900">
                                Team directory
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                                Member details, roles and account status
                            </p>
                        </div>

                        <span className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium tabular-nums text-neutral-600">
                            {members.length} {members.length === 1 ? "member" : "members"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-neutral-50/80">
                                <tr className="border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                                    <th scope="col" className="px-5 py-4">
                                        Member
                                    </th>
                                    <th scope="col" className="px-4 py-4">
                                        Role
                                    </th>
                                    <th scope="col" className="px-4 py-4">
                                        Department
                                    </th>
                                    <th scope="col" className="px-4 py-4">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-4">
                                        Joined
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-neutral-100">
                                {members.map((member) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.18 }}
                                        className="group transition-colors hover:bg-violet-50/40"
                                    >
                                        <td className="px-5 py-4">
                                            <MemberIdentity
                                                member={member}
                                                currentUserId={currentUserId}
                                            />
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors group-hover:border-violet-100 group-hover:bg-violet-50 group-hover:text-violet-700">
                                                    <ShieldCheck size={15} />
                                                </div>
                                                <span className="font-medium text-neutral-800">
                                                    {member.role.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-neutral-700">
                                                {member.department || "—"}
                                            </p>
                                            {member.jobTitle && (
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    {member.jobTitle}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <MemberStatusBadge status={member.status} />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-neutral-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays size={14} className="text-neutral-400" />
                                                {dateLabel(member.joinedAt)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end">
                                                <MemberActions {...props} member={member} />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-5 py-3">
                        <p className="text-xs text-neutral-500">
                            Showing {members.length} {members.length === 1 ? "member" : "members"}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                            <Building2 size={13} />
                            Company directory
                        </span>
                    </div>
                </div>

                {/* Mobile member cards */}
                <div className="grid gap-3 md:hidden">
                    {members.map((member, index) => (
                        <motion.article
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: Math.min(index * 0.035, 0.2) }}
                            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-violet-200"
                        >
                            <div className="flex items-start gap-3">
                                <MemberAvatar
                                    name={member.user.name}
                                    email={member.user.email}
                                    size="lg"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="break-words text-sm font-semibold text-neutral-900">
                                            {member.user.name || "Unnamed member"}
                                        </h3>

                                        {member.user.id === currentUserId && (
                                            <span className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                                                You
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 break-all text-xs leading-5 text-neutral-500">
                                        {member.user.email}
                                    </p>

                                    {member.employeeId && (
                                        <p className="mt-1 text-xs text-neutral-400">
                                            Employee ID: {member.employeeId}
                                        </p>
                                    )}
                                </div>

                                <div className="shrink-0">
                                    <MemberStatusBadge status={member.status} />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-neutral-100 py-4">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                                        <ShieldCheck size={13} />
                                        Role
                                    </p>
                                    <p className="mt-1.5 break-words text-sm font-medium text-neutral-800">
                                        {member.role.name}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                                        <Building2 size={13} />
                                        Department
                                    </p>
                                    <p className="mt-1.5 break-words text-sm font-medium text-neutral-800">
                                        {member.department || "—"}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                                        <BriefcaseBusiness size={13} />
                                        Job title
                                    </p>
                                    <p className="mt-1.5 break-words text-sm font-medium text-neutral-800">
                                        {member.jobTitle || "—"}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                                        <CalendarDays size={13} />
                                        Joined
                                    </p>
                                    <p className="mt-1.5 text-sm font-medium text-neutral-800">
                                        {dateLabel(member.joinedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap justify-end">
                                <MemberActions {...props} member={member} />
                            </div>
                        </motion.article>
                    ))}
                </div>
            </motion.section>
        </AnimatePresence>
    );
}
