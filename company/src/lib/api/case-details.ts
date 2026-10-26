
import { api } from "./axios";

import type {
    CaseActivity,
    CaseAssignment,
    CaseDetails,
    // CaseMember,
    CasePriority,
    CaseStatus,
    CompanyMembersResponse,
    CaseDetailsResponse,
} from "../../types/case-details";

interface ApiResponse<T> {
    success?: boolean;
    message: string;
    data: T;
}

export interface MemberListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export async function fetchCaseDetails(
    companyId: string,
    caseId: string,
): Promise<CaseDetails> {
    const { data } = await api.get<CaseDetailsResponse>(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}`,
    );

    return data.data;
}

export async function fetchCaseAssignments(
    companyId: string,
    caseId: string,
): Promise<CaseAssignment[]> {
    const { data } = await api.get<
        ApiResponse<CaseAssignment[] | { items: CaseAssignment[] }>
    >(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}/assignments`,
    );

    return Array.isArray(data.data) ? data.data : data.data.items;
}

export async function fetchCaseActivities(
    companyId: string,
    caseId: string,
): Promise<CaseActivity[]> {
    const { data } = await api.get<
        ApiResponse<CaseActivity[] | { items: CaseActivity[] }>
    >(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}/activities`,
        { params: { page: 1, limit: 50 } },
    );

    return Array.isArray(data.data) ? data.data : data.data.items;
}

export async function fetchCompanyMembers(
    companyId: string,
    params: MemberListParams = {},
): Promise<CompanyMembersResponse["data"]> {
    const { data } = await api.get<CompanyMembersResponse>(
        `/companies/${encodeURIComponent(companyId)}/members`,
        {
            params: {
                page: params.page ?? 1,
                limit: params.limit ?? 20,
                search: params.search || undefined,
                status: params.status ?? "ACTIVE",
            },
        },
    );

    return data.data;
}


export async function assignCaseToMember(input: {
    companyId: string;
    caseId: string;
    memberId: string;
    note?: string;
}) {
    const { companyId, caseId, memberId, note } = input;

    const { data } = await api.post(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}/assignments/${encodeURIComponent(memberId)}`,
        note?.trim() ? { note: note.trim() } : {},
    );

    return data;
}

export async function unassignCaseMember(input: {
    companyId: string;
    caseId: string;
    assignmentId: string;
}) {
    const { companyId, caseId, assignmentId } = input;

    const { data } = await api.delete(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}/assignments/${encodeURIComponent(assignmentId)}`,
    );

    return data;
}

export async function updateCase(input: {
    companyId: string;
    caseId: string;
    title?: string;
    description?: string;
    category?: string | null;
    status?: CaseStatus;
    priority?: CasePriority;
}) {
    const { companyId, caseId, ...body } = input;

    const { data } = await api.patch(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}`,
        body,
    );

    return data;
}

/**
 * Placeholder contract: confirm the escalation route and request body
 * against your existing backend controller before using in production.
 */
export async function escalateCase(input: {
    companyId: string;
    caseId: string;
    reason: string;
}) {
    const { companyId, caseId, reason } = input;

    const { data } = await api.post(
        `/manage-cases/${encodeURIComponent(companyId)}/cases/${encodeURIComponent(caseId)}/escalate`,
        { reason },
    );

    return data;
}

