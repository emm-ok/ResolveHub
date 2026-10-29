
import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    LoaderCircle,
    X,
    UserRound,
    Mail,
    ShieldCheck,
    Building2,
    BriefcaseBusiness,
    Hash,
    AlertCircle,
    CheckCircle2,
    Save,
} from "lucide-react";

import type {
    CompanyMember,
    CompanyRole,
    UpdateCompanyMemberInput,
} from "../../types/company-member";

const schema = z.object({
    roleId: z.string().min(1, "Select a role."),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    department: z.string().max(100, "Department cannot exceed 100 characters.").nullable(),
    jobTitle: z.string().max(100, "Job title cannot exceed 100 characters.").nullable(),
    employeeId: z.string().max(100, "Employee ID cannot exceed 100 characters.").nullable(),
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
    "mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

const labelClass =
    "block text-sm font-medium text-neutral-700";

const errorClass = "mt-1.5 flex items-start gap-1.5 text-xs text-violet-700";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <span className={errorClass} role="alert">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            {message}
        </span>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
                <Icon size={17} strokeWidth={1.8} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-neutral-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function EditMemberDialog({
    member,
    roles,
    currentUserId,
    isSaving,
    error,
    onClose,
    onSave,
}: Props) {
    const titleId = useId();
    const descriptionId = useId();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleId: "",
            status: "ACTIVE",
            department: "",
            jobTitle: "",
            employeeId: "",
        },
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

    useEffect(() => {
        if (!member) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSaving) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [member, isSaving, onClose]);

    if (!member) return null;

    const isSelf = member.user.id === currentUserId;
    const selectedRoleId = form.watch("roleId");
    const selectedStatus = form.watch("status");

    // The backend remains the authority for permission and last-admin checks.
    const selfRoleChange = isSelf && selectedRoleId !== member.role.id;
    const selfSuspension = isSelf && selectedStatus === "SUSPENDED";
    const hasInvalidSelfChange = selfRoleChange || selfSuspension;
    const isDirty = form.formState.isDirty;

    const submit = form.handleSubmit((values) => {
        if (hasInvalidSelfChange || isSaving) return;

        onSave({
            roleId: values.roleId,
            status: values.status,
            department: values.department?.trim() || null,
            jobTitle: values.jobTitle?.trim() || null,
            employeeId: values.employeeId?.trim() || null,
        });
    });

    return (
        <AnimatePresence>
            <motion.div
                key="edit-member-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isSaving) {
                        onClose();
                    }
                }}
            >
                <motion.section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    initial={{ opacity: 0, y: 24, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
                >
                    {/* Header */}
                    <header className="relative shrink-0 overflow-hidden border-b border-neutral-100 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
                        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-violet-100/70 blur-3xl" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-100 via-white to-purple-100 text-violet-800 shadow-sm">
                                    <UserRound size={22} strokeWidth={1.7} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2
                                            id={titleId}
                                            className="text-lg font-semibold tracking-tight text-neutral-950 sm:text-xl"
                                        >
                                            Edit team member
                                        </h2>
                                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
                                            Membership
                                        </span>
                                    </div>

                                    <p
                                        id={descriptionId}
                                        className="mt-1.5 max-w-md text-sm leading-6 text-neutral-500"
                                    >
                                        Update the role, membership status, and employment details
                                        for{" "}
                                        <span className="font-medium text-neutral-700">
                                            {member.user.name || member.user.email}
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                aria-label="Close edit dialog"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* Member summary */}
                        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-white text-sm font-semibold text-violet-800">
                                {(member.user.name?.trim() || member.user.email)
                                    .split(/[\s@._-]+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part[0].toUpperCase())
                                    .join("") || "U"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-neutral-900">
                                    {member.user.name || "Unnamed member"}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-neutral-500">
                                    {member.user.email}
                                </p>
                            </div>

                            <div className="hidden shrink-0 text-right sm:block">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Current role
                                </p>
                                <p className="mt-1 text-xs font-medium text-neutral-700">
                                    {member.role.name}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Form content */}
                    <form
                        onSubmit={submit}
                        className="flex min-h-0 flex-1 flex-col"
                        noValidate
                    >
                        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                            {/* Server error */}
                            <AnimatePresence initial={false}>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        role="alert"
                                        className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3.5 text-sm text-violet-900"
                                    >
                                        <AlertCircle
                                            size={18}
                                            className="mt-0.5 shrink-0 text-violet-700"
                                        />
                                        <div>
                                            <p className="font-semibold">Unable to save changes</p>
                                            <p className="mt-1 leading-5 text-violet-800">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Account and access */}
                            <section>
                                <SectionHeading
                                    icon={ShieldCheck}
                                    title="Account and access"
                                    description="Manage the member's company role and membership status."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className={labelClass}>
                                        Company role
                                        <select
                                            {...form.register("roleId")}
                                            disabled={isSaving || isSelf || roles.length === 0}
                                            aria-invalid={Boolean(form.formState.errors.roleId)}
                                            className={fieldClass}
                                        >
                                            {roles.length === 0 && (
                                                <option value="">No roles available</option>
                                            )}
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>

                                        {isSelf && (
                                            <span className="mt-1.5 block text-xs leading-5 text-neutral-500">
                                                You cannot change your own role.
                                            </span>
                                        )}

                                        {!isSelf && roles.length === 0 && (
                                            <span className="mt-1.5 block text-xs leading-5 text-neutral-500">
                                                No company roles are available to select.
                                            </span>
                                        )}

                                        <FieldError
                                            message={form.formState.errors.roleId?.message}
                                        />
                                    </label>

                                    <label className={labelClass}>
                                        Membership status
                                        <select
                                            {...form.register("status")}
                                            disabled={isSaving || isSelf}
                                            aria-invalid={Boolean(form.formState.errors.status)}
                                            className={fieldClass}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="SUSPENDED">Suspended</option>
                                        </select>

                                        {isSelf && (
                                            <span className="mt-1.5 block text-xs leading-5 text-neutral-500">
                                                You cannot suspend your own membership.
                                            </span>
                                        )}

                                        <FieldError
                                            message={form.formState.errors.status?.message}
                                        />
                                    </label>
                                </div>

                                <AnimatePresence initial={false}>
                                    {isSelf && hasInvalidSelfChange && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="mt-3 flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-3 text-xs leading-5 text-violet-800">
                                                <AlertCircle
                                                    size={15}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                You cannot change your own role or suspend your own
                                                membership. Restore the original values to continue.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>

                            <div className="border-t border-neutral-100" />

                            {/* Employment details */}
                            <section>
                                <SectionHeading
                                    icon={BriefcaseBusiness}
                                    title="Employment details"
                                    description="Keep this member's organizational information up to date."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className={labelClass}>
                                        Department
                                        <div className="relative">
                                            <Building2
                                                size={16}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                            />
                                            <input
                                                {...form.register("department")}
                                                placeholder="e.g. Customer Support"
                                                maxLength={100}
                                                disabled={isSaving}
                                                aria-invalid={Boolean(form.formState.errors.department)}
                                                className={`${fieldClass} pl-10`}
                                            />
                                        </div>
                                        <FieldError
                                            message={form.formState.errors.department?.message}
                                        />
                                    </label>

                                    <label className={labelClass}>
                                        Job title
                                        <div className="relative">
                                            <BriefcaseBusiness
                                                size={16}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                            />
                                            <input
                                                {...form.register("jobTitle")}
                                                placeholder="e.g. Support Specialist"
                                                maxLength={100}
                                                disabled={isSaving}
                                                aria-invalid={Boolean(form.formState.errors.jobTitle)}
                                                className={`${fieldClass} pl-10`}
                                            />
                                        </div>
                                        <FieldError
                                            message={form.formState.errors.jobTitle?.message}
                                        />
                                    </label>
                                </div>

                                <label className={`${labelClass} mt-4 block`}>
                                    Employee ID
                                    <div className="relative">
                                        <Hash
                                            size={16}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                        />
                                        <input
                                            {...form.register("employeeId")}
                                            placeholder="e.g. EMP-014"
                                            maxLength={100}
                                            disabled={isSaving}
                                            aria-invalid={Boolean(form.formState.errors.employeeId)}
                                            className={`${fieldClass} pl-10`}
                                        />
                                    </div>
                                    <FieldError
                                        message={form.formState.errors.employeeId?.message}
                                    />
                                    <span className="mt-1.5 block text-xs font-normal text-neutral-400">
                                        Leave blank if this member does not have an employee ID.
                                    </span>
                                </label>
                            </section>

                            {/* Read-only account details */}
                            <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
                                        <UserRound size={15} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-800">
                                            Account details
                                        </h3>
                                        <p className="text-xs text-neutral-500">
                                            Identity details cannot be edited here.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                            <UserRound size={13} />
                                            Full name
                                        </span>
                                        <p className="mt-1.5 break-words text-sm font-medium text-neutral-800">
                                            {member.user.name || "Unnamed member"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                            <Mail size={13} />
                                            Email address
                                        </span>
                                        <p className="mt-1.5 break-all text-sm font-medium text-neutral-800">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sticky footer actions */}
                        <footer className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4 sm:px-7">
                            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="hidden items-center gap-1.5 text-xs text-neutral-400 sm:flex">
                                    <ShieldCheck size={14} />
                                    Changes are subject to company permissions.
                                </p>

                                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <motion.button
                                        whileHover={!isSaving ? { y: -1 } : undefined}
                                        whileTap={!isSaving ? { scale: 0.98 } : undefined}
                                        type="submit"
                                        disabled={
                                            isSaving ||
                                            !isDirty ||
                                            !form.formState.isValid ||
                                            hasInvalidSelfChange ||
                                            roles.length === 0
                                        }
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
                                    >
                                        {isSaving ? (
                                            <>
                                                <LoaderCircle size={16} className="animate-spin" />
                                                Saving changes...
                                            </>
                                        ) : (
                                            <>
                                                {isDirty ? (
                                                    <Save size={16} />
                                                ) : (
                                                    <CheckCircle2 size={16} />
                                                )}
                                                Save changes
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </footer>
                    </form>
                </motion.section>
            </motion.div>
        </AnimatePresence>
    );
}
