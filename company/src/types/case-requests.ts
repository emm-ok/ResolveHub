
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
    submitter: {
        name: string;
    }
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




export interface RejectCaseRequestInput {
    companyId: string;
    requestId: string;
    reason: string;
}

export interface AcceptCaseRequestInput {
    companyId: string;
    requestId: string;
}

export interface CaseRequestActionResponse<T> {
    success?: boolean;
    message: string;
    data: T;
}

export interface AcceptedCaseRequestResult {
    request: {
        id: string;
        requestNumber: string;
        status: string;
    };
    case: {
        id: string;
        caseNumber: string;
        title: string;
        status: string;
        priority: string;
    };
}

export interface CaseRequestDetails extends CaseRequest {
    description: string;
    category?: string | null;
    requestedPriority?: string | null;
    channel?: string | null;
    requesterName?: string | null;
    requesterEmail?: string | null;
    requesterPhone?: string | null;
    caseId?: string | null;
}
