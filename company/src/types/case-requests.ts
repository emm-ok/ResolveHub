
export type CaseRequestStatus =
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "ACCEPTED"
    | "REJECTED"
    | (string & {});

export type SortOrder = "asc" | "desc";

export interface CaseRequest {
    id: string;
    requestNumber: string;
    title: string;
    status: CaseRequestStatus;
    createdAt: string;
    updatedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

export interface CaseRequestDetails extends CaseRequest {
    description: string;
}

export interface RequestsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface CaseRequestsResponse {
    message: string;
    data: CaseRequest[];
    pagination: RequestsPagination;
}

export interface CaseRequestDetailsResponse {
    message: string;
    data: CaseRequestDetails;
}

export interface ListCaseRequestsParams {
    companyId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortOrder: SortOrder;
}
