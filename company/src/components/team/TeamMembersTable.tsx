
import { Pencil, UserRound, UserX } from "lucide-react";

import type { CompanyMember } from "../../types/company-member";
import MemberStatusBadge from "./MemberStatusbadge";

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
    return value
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
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

    if ((!canUpdate || isRemoved) && (!canRemove || isRemoved || isSelf)) {
        return (
            <span className="text-xs text-neutral-400">
                {isRemoved ? "No actions available" : "View only"}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {canUpdate && !isRemoved && (
                <button
                    type="button"
                    onClick={() => onEdit(member)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                    <Pencil size={14} />
                    Edit
                </button>
            )}

            {canRemove && !isRemoved && !isSelf && (
                <button
                    type="button"
                    onClick={() => onRemove(member)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                    <UserX size={14} />
                    Remove
                </button>
            )}
        </div>
    );
}

export default function TeamMembersTable(props: Props) {
    const { members } = props;

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-5 py-16 text-center dark:border-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-900">
                    <UserRound size={23} />
                </div>
                <h3 className="mt-4 font-semibold">No team members found</h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500">
                    Try adjusting your search or filters. Members will appear here when they match your selection.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop and tablet table */}
            <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-950">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <tr>
                                <th className="px-5 py-4">Member</th>
                                <th className="px-4 py-4">Role</th>
                                <th className="px-4 py-4">Department</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Joined</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {members.map((member) => (
                                <tr
                                    key={member.id}
                                    className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                                {initials(member.user.name, member.user.email)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="max-w-[220px] truncate font-medium text-neutral-900 dark:text-white">
                                                        {member.user.name || "Unnamed member"}
                                                    </p>
                                                    {member.user.id === props.currentUserId && (
                                                        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-500">
                                                    {member.user.email}
                                                </p>
                                                {member.employeeId && (
                                                    <p className="mt-1 text-xs text-neutral-400">
                                                        ID: {member.employeeId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-medium">{member.role.name}</span>
                                    </td>
                                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">
                                        <div>{member.department || "—"}</div>
                                        {member.jobTitle && (
                                            <div className="mt-1 text-xs text-neutral-400">
                                                {member.jobTitle}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <MemberStatusBadge status={member.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-neutral-500">
                                        {dateLabel(member.joinedAt)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end">
                                            <MemberActions {...props} member={member} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
                {members.map((member) => (
                    <article
                        key={member.id}
                        className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800">
                                {initials(member.user.name, member.user.email)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="break-words text-sm font-semibold">
                                        {member.user.name || "Unnamed member"}
                                    </h3>
                                    {member.user.id === props.currentUserId && (
                                        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                            You
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 break-all text-xs text-neutral-500">
                                    {member.user.email}
                                </p>
                            </div>
                            <MemberStatusBadge status={member.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-neutral-100 py-3 text-sm dark:border-neutral-800">
                            <div>
                                <p className="text-xs text-neutral-500">Role</p>
                                <p className="mt-1 font-medium">{member.role.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Department</p>
                                <p className="mt-1 font-medium">
                                    {member.department || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Job title</p>
                                <p className="mt-1 font-medium">{member.jobTitle || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Joined</p>
                                <p className="mt-1 font-medium">{dateLabel(member.joinedAt)}</p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap justify-end">
                            <MemberActions {...props} member={member} />
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
