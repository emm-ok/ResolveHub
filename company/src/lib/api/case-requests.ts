
import { api } from "./axios";

import type {
    CaseRequestDetails,
    CaseRequestsResponse,
    ListCaseRequestsParams,
} from "../../types/case-requests";

export async function getCaseRequests({
    companyId,
    page,
    limit,
    search,
    status,
    sortOrder,
}: ListCaseRequestsParams) {
    const response = await api.get<CaseRequestsResponse>(
        `/case-requests/${encodeURIComponent(companyId)}/requests`,
        {
            params: {
                page,
                limit,
                sortOrder,
                ...(search?.trim() ? { search: search.trim() } : {}),
                ...(status ? { status } : {}),
            },
        },
    );

    return {
        items: response.data.data,
        pagination: response.data.pagination,
    };
}

export async function getCaseRequest(
    companyId: string,
    requestId: string,
): Promise<CaseRequestDetails> {
    const response = await api.get<{
        message: string;
        data: CaseRequestDetails;
    }>(
        `/case-requests/${encodeURIComponent(companyId)}/requests/${encodeURIComponent(requestId)}`,
    );

    return response.data.data;
}
