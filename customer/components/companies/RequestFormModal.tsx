"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import { useCurrentUser } from "@/hooks/useUser";
import { useSubmitCaseRequest } from "@/hooks/useSubmitCaseRequest";

import {
    CASE_REQUEST_CATEGORIES,
    type CaseRequestCategory,
    type SubmittedCaseRequest,
} from "@/lib/api/case-requests";

import type { Company } from "@/types/company";

interface RequestFormModalProps {
    company: Company;
    onClose: () => void;
}

const categoryLabels: Record<CaseRequestCategory, string> = {
    BILLING: "Billing",
    REFUND: "Refund",
    PRODUCT_ISSUE: "Product issue",
    SERVICE_ISSUE: "Service issue",
    ACCOUNT_ACCESS: "Account access",
    COMPLAINT: "General complaint",
    INQUIRY: "General inquiry",
    OTHER: "Other",
};

interface FormValues {
    requesterName: string;
    requesterEmail: string;
    requesterPhone: string;
    title: string;
    description: string;
    category: CaseRequestCategory;
}

const initialFormValues: FormValues = {
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    title: "",
    description: "",
    category: "COMPLAINT",
};

export function RequestFormModal({
    company,
    onClose,
}: RequestFormModalProps) {
    const prefersReducedMotion = useReducedMotion();
    const userQuery = useCurrentUser();
    const submitMutation = useSubmitCaseRequest();

    const user = userQuery.data;

    const [form, setForm] = useState<FormValues>(initialFormValues);
    const [successRequest, setSuccessRequest] =
        useState<SubmittedCaseRequest | null>(null);
    const [validationError, setValidationError] =
        useState<string | null>(null);

    const isSubmitting = submitMutation.isPending;
    const isSuccess = successRequest !== null;

    // Prefill customer details from the authenticated profile.
    useEffect(() => {
        if (!user) return;

        setForm((current) => ({
            ...current,
            requesterName:
                current.requesterName || user.name?.trim() || "",
            requesterEmail:
                current.requesterEmail || user.email || "",
        }));
    }, [user]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isSubmitting, onClose]);

    function updateField<K extends keyof FormValues>(
        field: K,
        value: FormValues[K],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setValidationError(null);
        submitMutation.reset();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setValidationError(null);

        const requesterName = form.requesterName.trim();
        const requesterEmail = form.requesterEmail.trim();
        const requesterPhone = form.requesterPhone.trim();
        const title = form.title.trim();
        const description = form.description.trim();

        if (requesterName.length < 2) {
            setValidationError(
                "Please enter your name using at least 2 characters.",
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
            setValidationError("Please enter a valid email address.");
            return;
        }

        if (requesterPhone.length > 30) {
            setValidationError(
                "Your phone number must not exceed 30 characters.",
            );
            return;
        }

        if (title.length < 5 || title.length > 200) {
            setValidationError(
                "The title must contain between 5 and 200 characters.",
            );
            return;
        }

        if (description.length < 20 || description.length > 10_000) {
            setValidationError(
                "The description must contain between 20 and 10,000 characters.",
            );
            return;
        }

        try {
            const result = await submitMutation.mutateAsync({
                companyId: company.id,
                data: {
                    requesterName,
                    requesterEmail,
                    requesterPhone: requesterPhone || undefined,
                    title,
                    description,
                    category: form.category,
                },
            });

            setSuccessRequest(result.data);
        } catch {
            // The Axios interceptor already converts API failures to Errors.
            // Render the error below without clearing the user's form.
        }
    }

    const motionTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.18, ease: "easeOut" as const };

    return (
        <AnimatePresence>
            <motion.div
                key="request-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
                onMouseDown={(event) => {
                    if (
                        event.target === event.currentTarget &&
                        !isSubmitting
                    ) {
                        onClose();
                    }
                }}
            >
                <motion.section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="request-modal-title"
                    aria-describedby="request-modal-description"
                    initial={
                        prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 14, scale: 0.99 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                        prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 10 }
                    }
                    transition={motionTransition}
                    className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-7"
                >
                    <header className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-neutral-500">
                                {isSuccess ? "Request submitted" : "New request"}
                            </p>

                            <h2
                                id="request-modal-title"
                                className="mt-1 text-xl font-semibold text-neutral-950"
                            >
                                {isSuccess
                                    ? "Your request has been received"
                                    : "Submit a complaint"}
                            </h2>

                            <p
                                id="request-modal-description"
                                className="mt-2 text-sm text-neutral-600"
                            >
                                {isSuccess
                                    ? `Your request has been submitted to ${company.name}.`
                                    : `Send your request to ${company.name}.`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            aria-label="Close request dialog"
                            className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50"
                        >
                            Close
                        </button>
                    </header>

                    {isSuccess ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mt-7 space-y-5"
                        >
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="flex items-start gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="size-5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                d="m5 12 4 4L19 6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>

                                    <div>
                                        <h3 className="font-semibold text-emerald-950">
                                            Submission successful
                                        </h3>
                                        <p className="mt-1 text-sm text-emerald-800">
                                            Keep your reference number for future
                                            correspondence.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
                                    <p className="text-xs text-neutral-500">
                                        Request reference
                                    </p>

                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <p className="break-all font-semibold text-neutral-950">
                                            {successRequest.requestNumber}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                void navigator.clipboard
                                                    .writeText(successRequest.requestNumber)
                                                    .catch(() => { });
                                            }}
                                            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-3 text-sm text-emerald-900">
                                    Status:{" "}
                                    <span className="font-medium">
                                        {successRequest.status}
                                    </span>
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : userQuery.isPending ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mt-8 flex items-center gap-3 py-8 text-sm text-neutral-600"
                        >
                            <span className="size-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
                            Loading your customer details...
                        </div>
                    ) : userQuery.isError || !user ? (
                        <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4">
                            <h3 className="font-medium text-red-900">
                                Unable to load your profile
                            </h3>
                            <p className="mt-1 text-sm text-red-800">
                                We need your customer details before you can submit
                                a request. Please try again.
                            </p>

                            <button
                                type="button"
                                onClick={() => void userQuery.refetch()}
                                className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="mt-6 space-y-5"
                        >
                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    Your details
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="requester-name"
                                            className="mb-2 block text-sm font-medium text-neutral-700"
                                        >
                                            Full name *
                                        </label>
                                        <input
                                            id="requester-name"
                                            autoComplete="name"
                                            required
                                            minLength={2}
                                            maxLength={120}
                                            value={form.requesterName}
                                            onChange={(event) =>
                                                updateField("requesterName", event.target.value)
                                            }
                                            className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="requester-email"
                                            className="mb-2 block text-sm font-medium text-neutral-700"
                                        >
                                            Email address *
                                        </label>
                                        <input
                                            id="requester-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            maxLength={254}
                                            value={form.requesterEmail}
                                            onChange={(event) =>
                                                updateField("requesterEmail", event.target.value)
                                            }
                                            className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="requester-phone"
                                        className="mb-2 block text-sm font-medium text-neutral-700"
                                    >
                                        Phone number{" "}
                                        <span className="font-normal text-neutral-400">
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        id="requester-phone"
                                        type="tel"
                                        autoComplete="tel"
                                        maxLength={30}
                                        value={form.requesterPhone}
                                        onChange={(event) =>
                                            updateField("requesterPhone", event.target.value)
                                        }
                                        placeholder="Enter your contact number"
                                        className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                    />
                                </div>
                            </section>

                            <div className="border-t border-neutral-100" />

                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    Complaint details
                                </h3>

                                <div>
                                    <label
                                        htmlFor="request-title"
                                        className="mb-2 block text-sm font-medium text-neutral-700"
                                    >
                                        Request title *
                                    </label>
                                    <input
                                        id="request-title"
                                        required
                                        minLength={5}
                                        maxLength={200}
                                        value={form.title}
                                        onChange={(event) =>
                                            updateField("title", event.target.value)
                                        }
                                        placeholder="Briefly describe your issue"
                                        className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                    />
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Between 5 and 200 characters.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="request-category"
                                        className="mb-2 block text-sm font-medium text-neutral-700"
                                    >
                                        Category *
                                    </label>
                                    <select
                                        id="request-category"
                                        required
                                        value={form.category}
                                        onChange={(event) =>
                                            updateField(
                                                "category",
                                                event.target.value as CaseRequestCategory,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                    >
                                        {CASE_REQUEST_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>
                                                {categoryLabels[category]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="request-description"
                                        className="mb-2 block text-sm font-medium text-neutral-700"
                                    >
                                        Describe your complaint *
                                    </label>
                                    <textarea
                                        id="request-description"
                                        required
                                        minLength={20}
                                        maxLength={10_000}
                                        rows={5}
                                        value={form.description}
                                        onChange={(event) =>
                                            updateField("description", event.target.value)
                                        }
                                        placeholder="Explain what happened, relevant dates, and what outcome you are seeking."
                                        className="w-full resize-y rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                    />
                                    <div className="mt-1 flex justify-between gap-3 text-xs text-neutral-500">
                                        <span>Minimum 20 characters.</span>
                                        <span>{form.description.length}/10,000</span>
                                    </div>
                                </div>
                            </section>

                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                <p className="text-sm font-medium text-neutral-800">
                                    Supporting evidence
                                </p>
                                <p className="mt-1 text-sm text-neutral-600">
                                    Evidence uploads are not connected to this submission
                                    endpoint yet. You can submit the complaint now; attach
                                    supporting files once the evidence-upload API is integrated.
                                </p>
                            </div>

                            {(validationError || submitMutation.error) && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                                >
                                    {validationError ??
                                        (submitMutation.error instanceof Error
                                            ? submitMutation.error.message
                                            : "Unable to submit your request. Please try again.")}
                                </div>
                            )}

                            <footer className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting && (
                                        <span
                                            aria-hidden="true"
                                            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                        />
                                    )}
                                    {isSubmitting
                                        ? "Submitting request..."
                                        : "Submit complaint"}
                                </button>
                            </footer>

                            <p className="text-xs leading-5 text-neutral-500">
                                By submitting, you confirm that the information provided
                                is accurate and may be shared with the selected company
                                to handle your request.
                            </p>
                        </form>
                    )}
                </motion.section>
            </motion.div>
        </AnimatePresence>
    );
}