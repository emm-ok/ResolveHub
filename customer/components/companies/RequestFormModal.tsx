"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Company } from "@/types/company";

export interface RequestFormValues {
    title: string;
    description: string;
    files: File[];
}

interface RequestFormModalProps {
    company: Company;
    onClose: () => void;
    onSubmit?: (values: RequestFormValues) => Promise<void>;
}

export function RequestFormModal({
    company,
    onClose,
    onSubmit,
}: RequestFormModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    }, [onClose, isSubmitting]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setError(null);

        if (!onSubmit) {
            setError(
                "Request submission is not connected to the backend yet.",
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({ title, description, files });
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to submit your request. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isSubmitting) {
                        onClose();
                    }
                }}
            >
                <motion.section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="request-modal-title"
                    initial={{ opacity: 0, y: 16, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.18 }}
                    className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-7"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-neutral-500">
                                New request
                            </p>

                            <h2
                                id="request-modal-title"
                                className="mt-1 text-xl font-semibold text-neutral-950"
                            >
                                Submit a complaint
                            </h2>

                            <p className="mt-2 text-sm text-neutral-600">
                                Your request will be directed to{" "}
                                <span className="font-medium text-neutral-900">
                                    {company.name}
                                </span>
                                .
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            aria-label="Close request form"
                            className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                        >
                            Close
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="request-title"
                                className="mb-2 block text-sm font-medium text-neutral-800"
                            >
                                Complaint title *
                            </label>

                            <input
                                id="request-title"
                                required
                                maxLength={150}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Briefly describe your issue"
                                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="request-description"
                                className="mb-2 block text-sm font-medium text-neutral-800"
                            >
                                Describe your complaint *
                            </label>

                            <textarea
                                id="request-description"
                                required
                                minLength={10}
                                maxLength={5000}
                                rows={5}
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Explain what happened and how you would like the issue resolved."
                                className="w-full resize-y rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                            />

                            <p className="mt-1 text-right text-xs text-neutral-500">
                                {description.length}/5000
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="request-evidence"
                                className="mb-2 block text-sm font-medium text-neutral-800"
                            >
                                Supporting evidence
                            </label>

                            <input
                                id="request-evidence"
                                type="file"
                                multiple
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                onChange={(event) =>
                                    setFiles(Array.from(event.target.files ?? []))
                                }
                                className="block w-full rounded-xl border border-neutral-200 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm"
                            />

                            {files.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {files.map((file, index) => (
                                        <li
                                            key={`${file.name}-${file.size}-${index}`}
                                            className="flex items-center justify-between gap-3 text-sm text-neutral-600"
                                        >
                                            <span className="truncate">{file.name}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFiles((current) =>
                                                        current.filter((_, i) => i !== index),
                                                    )
                                                }
                                                className="shrink-0 text-neutral-500 underline hover:text-neutral-900"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <p className="mt-2 text-xs text-neutral-500">
                                Only upload relevant supporting documents. File types,
                                sizes, and upload permissions must also be validated
                                by the backend.
                            </p>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="h-11 rounded-xl border border-neutral-200 px-5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!onSubmit || isSubmitting}
                                className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit complaint"}
                            </button>
                        </div>
                    </form>
                </motion.section>
            </motion.div>
        </AnimatePresence>
    );
}