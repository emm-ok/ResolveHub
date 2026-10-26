
import { api } from "./axios";

import type {
    GetCasesParams,
    GetCasesResponse,
    GetCaseKpisResponse,
} from "../../types/case";

export async function getCaseKpis(companyId: string) {
    const response = await api.get<GetCaseKpisResponse>(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/kpis`,
    );

    return response.data.data;
}

export async function getCases(
    companyId: string,
    params: GetCasesParams,
) {
    const response = await api.get<GetCasesResponse>(
        `/manage-cases/${encodeURIComponent(companyId)}/cases`,
        {
            params: {
                page: params.page,
                limit: params.limit,
                ...(params.search?.trim()
                    ? { search: params.search.trim() }
                    : {}),
                ...(params.status ? { status: params.status } : {}),
                sortOrder: params.sortOrder,
            },
        },
    );

    return response.data;
}
