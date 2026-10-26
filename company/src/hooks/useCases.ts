
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCases } from "../lib/api/cases";

import type { GetCasesParams } from "../types/case";

export const caseKeys = {
    all: ["cases"] as const,
    lists: (companyId: string) =>
        [...caseKeys.all, companyId, "list"] as const,
    list: (companyId: string, params: GetCasesParams) =>
        [...caseKeys.lists(companyId), params] as const,
};

export function useCases(
    companyId: string,
    params: GetCasesParams,
) {
    return useQuery({
        queryKey: caseKeys.list(companyId, params),
        queryFn: () => getCases(companyId, params),
        enabled: Boolean(companyId),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        retry: 1,
    });
}
