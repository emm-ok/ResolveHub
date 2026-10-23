import { api } from "@/lib/api/axios";

export const CASE_REQUEST_CATEGORIES = [
    "BILLING",
    "REFUND",
    "PRODUCT_ISSUE",
    "SERVICE_ISSUE",
    "ACCOUNT_ACCESS",
    "COMPLAINT",
    "INQUIRY",
    "OTHER",
] as const;

export type CaseRequestCategory =
    (typeof CASE_REQUEST_CATEGORIES)[number];

export interface SubmitCaseRequestInput {
    requesterName: string;
    requesterEmail: string;
    requesterPhone?: string;
    title: string;
    description: string;
    category: CaseRequestCategory;
}

export interface SubmittedCaseRequest {
    id: string;
    requestNumber: string;
    title: string;
    status: string;
    createdAt: string;
}

interface SubmitCaseRequestResponse {
    message: string;
    data: SubmittedCaseRequest;
}

export async function submitCaseRequest(
    companyId: string,
    input: SubmitCaseRequestInput,
): Promise<SubmitCaseRequestResponse> {
    const response = await api.post<SubmitCaseRequestResponse>(
        `/case-requests/${encodeURIComponent(companyId)}/requests`,
        input,
    );

    return response.data;
}