
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";

import { useUpdateCase } from "../../hooks/useCaseDetails";
import type {
    CaseDetails,
    CasePriority,
    CaseStatus,
} from "../../types/case-details";

interface Props {
    open: boolean;
    companyId: string;
    caseData: CaseDetails;
    onClose: () => void;
}

const statusOptions: { label: string; value: CaseStatus }[] = [
    { label: "Open", value: "OPEN" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Closed", value: "CLOSED" },
];

const priorityOptions: { label: string; value: CasePriority }[] = [
    { label: "Low", value: "LOW" },
    { label: "Normal", value: "NORMAL" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
];

function getErrorMessage(error: unknown) {
    if (
        error &&
        typeof error === "object" &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { data?: { message?: string } };
            }
        ).response;

        if (response?.data?.message) return response.data.message;
    }

    return error instanceof Error
        ? error.message
        : "Unable to update this case.";
}

export function EditCaseModal({
    open,
    companyId,
    caseData,
    onClose,
}: Props) {
    const mutation = useUpdateCase(companyId, caseData.id);

    const [title, setTitle] = useState(caseData.title);
    const [description, setDescription] = useState(caseData.description);
    const [category, setCategory] = useState(caseData.category ?? "");
    const [status, setStatus] = useState<CaseStatus>(caseData.status);
    const [priority, setPriority] = useState<CasePriority>(caseData.priority);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setTitle(caseData.title);
            setDescription(caseData.description);
            setCategory(caseData.category ?? "");
            setStatus(caseData.status);
            setPriority(caseData.priority);
            setError(null);
        }
    }, [open, caseData]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await mutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                category: category.trim() || null,
                status,
                priority,
            });

            onClose();
        } catch (cause) {
            setError(getErrorMessage(cause));
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !mutation.isPending) {
                            onClose();
                        }
                    }}
                >
                    <motion.section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-case-title"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white shadow-2xl sm:rounded-2xl"
                    >
                        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-6">
                            <div>
                                <h2
                                    id="edit-case-title"
                                    className="text-lg font-semibold text-black"
                                >
                                    Edit case
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    Update case details and workflow status.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={mutation.isPending}
                                onClick={onClose}
                                aria-label="Close edit form"
                                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                            <div className="space-y-1.5">
                                <label htmlFor="case-title" className="text-sm font-medium text-neutral-800">
                                    Case title
                                </label>
                                <input
                                    id="case-title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={200}
                                    className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="case-description" className="text-sm font-medium text-neutral-800">
                                    Description
                                </label>
                                <textarea
                                    id="case-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    required
                                    rows={5}
                                    maxLength={10000}
                                    className="w-full resize-y rounded-lg border border-neutral-200 p-3 text-sm leading-6 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="case-category" className="text-sm font-medium text-neutral-800">
                                        Category
                                    </label>
                                    <input
                                        id="case-category"
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        maxLength={100}
                                        className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="case-priority" className="text-sm font-medium text-neutral-800">
                                        Priority
                                    </label>
                                    <select
                                        id="case-priority"
                                        value={priority}
                                        onChange={(event) => setPriority(event.target.value as CasePriority)}
                                        className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
                                    >
                                        {priorityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="case-status" className="text-sm font-medium text-neutral-800">
                                        Status
                                    </label>
                                    <select
                                        id="case-status"
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value as CaseStatus)}
                                        className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div role="alert" className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                                    {error}
                                </div>
                            )}

                            <footer className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={mutation.isPending}
                                    onClick={onClose}
                                    className="h-11 rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending || !title.trim() || !description.trim()}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {mutation.isPending && (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    )}
                                    {mutation.isPending ? "Saving changes..." : "Save changes"}
                                </button>
                            </footer>
                        </form>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
