
import type { CompanyRole } from "../../types/company-member";
import { api } from "./axios";

export async function getCompanyRoles(
    companyId: string,
): Promise<CompanyRole[]> {
    const { data } = await api.get<{
        success: boolean;
        message: string;
        data: {
            items: CompanyRole[];
        };
    }>(`/companies/${companyId}/roles`);

    return data.data.items;
}
