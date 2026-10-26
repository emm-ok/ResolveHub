
export type CaseStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "PENDING"
    | "RESOLVED"
    | "CLOSED"
    | "ESCALATED";

export type CasePriority =
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT";

export interface CaseRecord {
    id: string;
    caseNumber: string;
    title: string;
    category: string | null;
    status: CaseStatus;
    priority: CasePriority;
    createdAt: string;
    updatedAt: string;
}

export interface CaseKpis {
    totalCases: number;
    openCases: number;
    inProgressCases: number;
    resolvedCases: number;
    overdueCases: number;
    unassignedCases: number;
}

export interface CasesPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetCasesParams {
    page: number;
    limit: number;
    search?: string;
    status?: CaseStatus | "";
    sortOrder: "asc" | "desc";
}

export interface GetCasesResponse {
    message: string;
    data: CaseRecord[];
    pagination: CasesPagination;
}

export interface GetCaseKpisResponse {
    message: string;
    data: CaseKpis;
}
