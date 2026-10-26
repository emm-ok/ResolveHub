
export type CaseStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

export type CasePriority =
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT";

export interface CaseMember {
    id: string;
    status: string;
    department: string | null;
    jobTitle: string | null;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    role: {
        id: string;
        name: string;
        slug: string;
        systemRole: string | null;
    };
}

export interface CaseAssignment {
    id: string;
    memberId: string;
    assignedAt: string;
    unassignedAt: string | null;
    note?: string | null;
    member: {
        id: string;
        name: string | null;
        email?: string;
    };
}

export interface CaseActivity {
    id: string;
    type: string;
    summary: string;
    visibility?: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    actor?: {
        id: string;
        name: string | null;
    } | null;
}

export interface CaseDetails {
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    category: string | null;
    status: CaseStatus;
    priority: CasePriority;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string;
        memberships?: Array<{
            role: { name: string };
        }>;
    };
    request: {
        id: string;
        requestNumber: string;
    } | null;
    assignments: Array<{
        member: {
            user: { name: string | null };
        };
    }>;
    sla: {
        policy?: {
            name?: string;
            responseTimeMinutes?: number;
            resolutionTimeMinutes?: number;
        } | null;
        dueAt?: string | null;
        responseDueAt?: string | null;
        resolutionDueAt?: string | null;
        breachedAt?: string | null;
    } | null;
    activities: CaseActivity[];
}

export interface CompanyMembersResponse {
    success: boolean;
    message: string;
    data: {
        items: CaseMember[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
}

export interface CaseDetailsResponse {
    message: string;
    data: CaseDetails;
}

export interface AssignCaseResponse {
    success: boolean;
    message: string;
    data: {
        unchanged: boolean;
        assignment: CaseAssignment;
    };
}
