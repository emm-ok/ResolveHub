"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

interface RequestsToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    sortOrder: "asc" | "desc";
    onSortChange: (value: "asc" | "desc") => void;
}

export function RequestsToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    sortOrder,
    onSortChange,
}: RequestsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
                <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search by reference or title..."
                    aria-label="Search requests by reference or title"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                {search && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <label className="relative flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                    <SlidersHorizontal size={15} className="shrink-0 text-slate-400" />

                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value)}
                        aria-label="Filter requests by status"
                        className="min-w-0 flex-1 appearance-none bg-transparent pr-1 text-xs font-medium text-slate-700 outline-none sm:text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="SUBMITTED">Submitted</option>
                    </select>
                </label>

                <label className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3">
                    <select
                        value={sortOrder}
                        onChange={(event) =>
                            onSortChange(event.target.value as "asc" | "desc")
                        }
                        aria-label="Sort requests by date"
                        className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none sm:text-sm"
                    >
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                    </select>
                </label>
            </div>
        </div>
    );
}