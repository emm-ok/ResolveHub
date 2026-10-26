
import { useQuery } from "@tanstack/react-query";
import { getCaseKpis } from "../lib/api/cases";

export const caseKpiKeys = {
    all: ["case-kpis"] as const,
    company: (companyId: string) =>
        [...caseKpiKeys.all, companyId] as const,
};

export function useCaseKpis(companyId: string) {
    return useQuery({
        queryKey: caseKpiKeys.company(companyId),
        queryFn: () => getCaseKpis(companyId),
        enabled: Boolean(companyId),
        staleTime: 30_000,
        retry: 1,
    });
}
