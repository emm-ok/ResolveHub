
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    fetchCaseDetails,
    fetchCaseAssignments,
    fetchCaseActivities,
    fetchCompanyMembers,
    assignCaseToMember,
    unassignCaseMember,
    updateCase,
    escalateCase,
} from "../lib/api/case-details";

import type {
    MemberListParams,
} from "../lib/api/case-details";

export const caseDetailKeys = {
    all: ["case-details"] as const,
    detail: (companyId: string, caseId: string) =>
        [...caseDetailKeys.all, companyId, caseId] as const,
    assignments: (companyId: string, caseId: string) =>
        [...caseDetailKeys.detail(companyId, caseId), "assignments"] as const,
    activities: (companyId: string, caseId: string) =>
        [...caseDetailKeys.detail(companyId, caseId), "activities"] as const,
    members: (companyId: string, params: MemberListParams) =>
        ["company-members", companyId, params] as const,
};

export function useCaseDetails(companyId: string, caseId: string) {
    return useQuery({
        queryKey: caseDetailKeys.detail(companyId, caseId),
        queryFn: () => fetchCaseDetails(companyId, caseId),
        enabled: Boolean(companyId && caseId),
        staleTime: 20_000,
        retry: 1,
    });
}

export function useCaseAssignments(companyId: string, caseId: string) {
    return useQuery({
        queryKey: caseDetailKeys.assignments(companyId, caseId),
        queryFn: () => fetchCaseAssignments(companyId, caseId),
        enabled: Boolean(companyId && caseId),
        staleTime: 15_000,
        retry: 1,
    });
}

export function useCaseActivities(companyId: string, caseId: string) {
    return useQuery({
        queryKey: caseDetailKeys.activities(companyId, caseId),
        queryFn: () => fetchCaseActivities(companyId, caseId),
        enabled: Boolean(companyId && caseId),
        staleTime: 15_000,
        retry: 1,
    });
}

export function useCompanyMembers(
    companyId: string,
    params: MemberListParams,
    enabled = true,
) {
    return useQuery({
        queryKey: caseDetailKeys.members(companyId, params),
        queryFn: () => fetchCompanyMembers(companyId, params),
        enabled: Boolean(companyId) && enabled,
        staleTime: 30_000,
        retry: 1,
    });
}

function useRefreshCaseQueries(companyId: string, caseId: string) {
    const queryClient = useQueryClient();

    return async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: caseDetailKeys.detail(companyId, caseId),
            }),
            queryClient.invalidateQueries({
                queryKey: caseDetailKeys.assignments(companyId, caseId),
            }),
            queryClient.invalidateQueries({
                queryKey: caseDetailKeys.activities(companyId, caseId),
            }),
            queryClient.invalidateQueries({
                queryKey: ["cases", companyId],
            }),
            queryClient.invalidateQueries({
                queryKey: ["case-kpis", companyId],
            }),
        ]);
    };
}

export function useAssignCase(companyId: string, caseId: string) {
    const refresh = useRefreshCaseQueries(companyId, caseId);

    return useMutation({
        mutationFn: (input: {
            memberId: string;
            note?: string;
        }) =>
            assignCaseToMember({
                companyId,
                caseId,
                ...input,
            }),
        onSuccess: refresh,
    });
}

export function useUnassignCase(companyId: string, caseId: string) {
    const refresh = useRefreshCaseQueries(companyId, caseId);

    return useMutation({
        mutationFn: (assignmentId: string) =>
            unassignCaseMember({
                companyId,
                caseId,
                assignmentId,
            }),
        onSuccess: refresh,
    });
}

export function useUpdateCase(companyId: string, caseId: string) {
    const refresh = useRefreshCaseQueries(companyId, caseId);

    return useMutation({
        mutationFn: (
            input: Parameters<typeof updateCase>[0] extends infer T
                ? Omit<T, "companyId" | "caseId">
                : never,
        ) =>
            updateCase({
                companyId,
                caseId,
                ...input,
            }),
        onSuccess: refresh,
    });
}

export function useEscalateCase(companyId: string, caseId: string) {
    const refresh = useRefreshCaseQueries(companyId, caseId);

    return useMutation({
        mutationFn: (reason: string) =>
            escalateCase({ companyId, caseId, reason }),
        onSuccess: refresh,
    });
}
