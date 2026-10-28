
import { useQuery } from "@tanstack/react-query";
import { getCompanyRoles } from "../lib/api/company-roles";

export const companyRoleKeys = {
    all: ["company-roles"] as const,
    byCompany: (companyId: string) =>
        [...companyRoleKeys.all, companyId] as const,
};

export function useCompanyRoles(companyId: string) {
    return useQuery({
        queryKey: companyRoleKeys.byCompany(companyId),
        queryFn: () => getCompanyRoles(companyId),
        enabled: Boolean(companyId),
        staleTime: 60_000,
    });
}
