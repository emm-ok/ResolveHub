
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, X } from "lucide-react";

import type {
    CompanyMember,
    CompanyRole,
    UpdateCompanyMemberInput,
} from "../../types/company-member";

const schema = z.object({
    roleId: z.string().min(1, "Select a role."),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    department: z.string().max(100).nullable(),
    jobTitle: z.string().max(100).nullable(),
    employeeId: z.string().max(100).nullable(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    member: CompanyMember | null;
    roles: CompanyRole[];
    currentUserId?: string;
    isSaving: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (input: UpdateCompanyMemberInput) => void;
};

const fieldClass =
    "mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:ring-neutral-900";

const labelClass = "text-sm font-medium text-neutral-700 dark:text-neutral-300";

export default function EditMemberDialog({
    member,
    roles,
    currentUserId,
    isSaving,
    error,
    onClose,
    onSave,
}: Props) {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!member) return;

        form.reset({
            roleId: member.role.id,
            status: member.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
            department: member.department ?? "",
            jobTitle: member.jobTitle ?? "",
            employeeId: member.employeeId ?? "",
        });
    }, [member, form]);

    if (!member) return null;

    const isSelf = member.user.id === currentUserId;
    // The backend remains the authority on whether an admin can be demoted
    // or suspended. This flag only prevents self-role changes in the UI.
    const selectedRoleId = form.watch("roleId");
    const selectedStatus = form.watch("status");
    const selfRoleChange = isSelf && selectedRoleId !== member.role.id;
    const selfSuspension = isSelf && selectedStatus === "SUSPENDED";

    const submit = form.handleSubmit((values) => {
        onSave({
            roleId: values.roleId,
            status: values.status,
            department: values.department?.trim() || null,
            jobTitle: values.jobTitle?.trim() || null,
            employeeId: values.employeeId?.trim() || null,
        });
    });

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-member-title"
                className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
                <header className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="edit-member-title"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Edit team member
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Update membership and employment details for {member.user.name || member.user.email}.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Close edit dialog"
                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                    >
                        <X size={18} />
                    </button>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className={labelClass}>
                            Full name
                            <input
                                value={member.user.name || "Unnamed member"}
                                disabled
                                className={fieldClass}
                            />
                        </label>
                        <label className={labelClass}>
                            Email address
                            <input
                                value={member.user.email}
                                disabled
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className={labelClass}>
                            Company role
                            <select
                                {...form.register("roleId")}
                                disabled={isSaving || isSelf}
                                className={fieldClass}
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {isSelf && (
                                <span className="mt-1 block text-xs font-normal text-neutral-500">
                                    You cannot change your own role.
                                </span>
                            )}
                            {form.formState.errors.roleId && (
                                <span className="mt-1 block text-xs text-red-600">
                                    {form.formState.errors.roleId.message}
                                </span>
                            )}
                        </label>

                        <label className={labelClass}>
                            Membership status
                            <select
                                {...form.register("status")}
                                disabled={isSaving || isSelf}
                                className={fieldClass}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                            {isSelf && (
                                <span className="mt-1 block text-xs font-normal text-neutral-500">
                                    You cannot suspend your own membership.
                                </span>
                            )}
                        </label>
                    </div>

                    {isSelf && (selfRoleChange || selfSuspension) && (
                        <p className="text-sm text-amber-700">
                            You cannot change your own role or suspend your own membership.
                        </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className={labelClass}>
                            Department
                            <input
                                {...form.register("department")}
                                placeholder="e.g. Customer Support"
                                disabled={isSaving}
                                className={fieldClass}
                            />
                            {form.formState.errors.department && (
                                <span className="mt-1 block text-xs text-red-600">
                                    {form.formState.errors.department.message}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Job title
                            <input
                                {...form.register("jobTitle")}
                                placeholder="e.g. Support Specialist"
                                disabled={isSaving}
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    <label className={labelClass + " block"}>
                        Employee ID
                        <input
                            {...form.register("employeeId")}
                            placeholder="e.g. EMP-014"
                            disabled={isSaving}
                            className={fieldClass}
                        />
                    </label>

                    <footer className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="h-11 rounded-xl border border-neutral-200 px-4 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isSaving ||
                                !form.formState.isDirty ||
                                selfRoleChange ||
                                selfSuspension
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {isSaving && <LoaderCircle size={16} className="animate-spin" />}
                            {isSaving ? "Saving changes..." : "Save changes"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
