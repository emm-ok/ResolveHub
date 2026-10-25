
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListCaseRequestsParams } from "../types/case-requests";
import { acceptCaseRequest, getCaseRequest, getCaseRequests, rejectCaseRequest } from "../lib/api/case-requests";

export const caseRequestKeys = {
    all: ["case-requests"] as const,
    lists: (companyId: string) =>
        [...caseRequestKeys.all, companyId, "list"] as const,
    list: (params: ListCaseRequestsParams) =>
        [...caseRequestKeys.lists(params.companyId), params] as const,
    details: (companyId: string) =>
        [...caseRequestKeys.all, companyId, "detail"] as const,
    detail: (companyId: string, requestId: string) =>
        [...caseRequestKeys.details(companyId), requestId] as const,
};

export function useCaseRequests(params: ListCaseRequestsParams) {
    return useQuery({
        queryKey: caseRequestKeys.list(params),
        queryFn: () => getCaseRequests(params),
        enabled: Boolean(params.companyId),
        staleTime: 15_000,
        placeholderData: (previousData) => previousData,
        retry: (failureCount, error) => {
            const status = (
                error as { response?: { status?: number } }
            )?.response?.status;

            if (status === 401 || status === 403 || status === 404) {
                return false;
            }

            return failureCount < 2;
        },
    });
}

export function useCaseRequestDetails(
    companyId: string,
    requestId: string | null,
) {
    return useQuery({
        queryKey: caseRequestKeys.detail(companyId, requestId ?? ""),
        queryFn: () => getCaseRequest(companyId, requestId!),
        enabled: Boolean(companyId && requestId),
        staleTime: 30_000,
        retry: (failureCount, error) => {
            const status = (
                error as { response?: { status?: number } }
            )?.response?.status;

            if (status === 401 || status === 403 || status === 404) {
                return false;
            }

            return failureCount < 2;
        },
    });
}

export function useAcceptCaseRequest(companyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) =>
            acceptCaseRequest({ companyId, requestId }),

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.lists(companyId),
                }),
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.details(companyId),
                }),
                queryClient.invalidateQueries({
                    queryKey: ["company-dashboard"],
                }),
            ]);
        },
    });
}

export function useRejectCaseRequest(companyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            reason,
        }: {
            requestId: string;
            reason: string;
        }) =>
            rejectCaseRequest({
                companyId,
                requestId,
                reason,
            }),

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.lists(companyId),
                }),
                queryClient.invalidateQueries({
                    queryKey: caseRequestKeys.details(companyId),
                }),
                queryClient.invalidateQueries({
                    queryKey: ["company-dashboard"],
                }),
            ]);
        },
    });
}
