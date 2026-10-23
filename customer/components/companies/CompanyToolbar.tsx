"use client";

interface CompanyDirectoryControlsProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export function CompanyDirectoryControls({
    search,
    onSearchChange,
}: CompanyDirectoryControlsProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <label htmlFor="company-search" className="sr-only">
                    Search companies
                </label>

                <input
                    id="company-search"
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search companies by name..."
                    autoComplete="off"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
                />
            </div>
        </div>
    );
}