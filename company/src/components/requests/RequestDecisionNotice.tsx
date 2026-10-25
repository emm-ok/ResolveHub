
import { CheckCircle2, X } from "lucide-react";

interface RequestDecisionNoticeProps {
    message: string;
    onDismiss: () => void;
}

export function RequestDecisionNotice({
    message,
    onDismiss,
}: RequestDecisionNoticeProps) {
    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-500 bg-emerald-200/30 px-4 py-3 text-sm text-emerald-900"
        >
            <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
            />

            <p className="min-w-0 flex-1 leading-6">{message}</p>

            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-emerald-900/5 hover:opacity-100 dark:hover:bg-white/10"
            >
                <X size={15} aria-hidden="true" />
            </button>
        </div>
    );
}
