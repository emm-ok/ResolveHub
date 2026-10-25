
import { api } from "./axios";

import type {
    AcceptCaseRequestInput,
    AcceptedCaseRequestResult,
    CaseRequestActionResponse,
    CaseRequestDetails,
    CaseRequestsResponse,
    ListCaseRequestsParams,
    RejectCaseRequestInput,
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

export async function acceptCaseRequest({
    companyId,
    requestId,
}: AcceptCaseRequestInput) {
    const response = await api.post<CaseRequestActionResponse<AcceptedCaseRequestResult>>(
        `/manage-cases/${encodeURIComponent(companyId)}/requests/${encodeURIComponent(requestId)}/accept`,
    );

    return response.data;
}

export async function rejectCaseRequest({
    companyId,
    requestId,
    reason,
}: RejectCaseRequestInput) {
    const response = await api.post<CaseRequestActionResponse<unknown>>(
        `/manage-cases/${encodeURIComponent(companyId)}/requests/${encodeURIComponent(requestId)}/reject`,
        { reason },
    );

    return response.data;
}
