import { api } from "@/lib/api/axios";

export type CaseRequestStatus =
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "RESOLVED"
    | "CLOSED";

export interface MyCaseRequest {
    id: string;
    requestNumber: string;
    title: string;
    status: CaseRequestStatus | string;
    createdAt: string;
    updatedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

export interface MyCaseRequestDetails extends MyCaseRequest {
    description: string;
}

export interface MyRequestsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface MyRequestsQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortOrder?: "asc" | "desc";
}

interface MyRequestsResponse {
    message: string;
    data: MyCaseRequest[];
    pagination: MyRequestsPagination;
}

interface MyRequestDetailsResponse {
    message: string;
    data: MyCaseRequestDetails;
}

export async function getMyCaseRequests(
    query: MyRequestsQuery = {},
): Promise<MyRequestsResponse> {
    const params = new URLSearchParams();

    params.set("page", String(query.page ?? 1));
    params.set("limit", String(query.limit ?? 10));
    params.set("sortOrder", query.sortOrder ?? "desc");

    if (query.search?.trim()) {
        params.set("search", query.search.trim());
    }

    if (query.status) {
        params.set("status", query.status);
    }

    const response = await api.get<MyRequestsResponse>(
        `/case-requests/requests/me?${params.toString()}`,
    );

    return response.data;
}

export async function getMyCaseRequest(
    requestId: string,
): Promise<MyCaseRequestDetails> {
    const response = await api.get<MyRequestDetailsResponse>(
        `/case-requests/requests/${encodeURIComponent(requestId)}/me`,
    );

    return response.data.data;
}