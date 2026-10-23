"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/lib/api/companies";
import type { CompaniesQuery } from "@/types/company";

export function useCompanies(params: CompaniesQuery) {
    return useQuery({
        queryKey: ["companies", params],
        queryFn: ({ signal }) => fetchCompanies(params, signal),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        placeholderData: (previousData) => previousData,
    });
}