"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getMyCaseRequest,
    getMyCaseRequests,
    type MyRequestsQuery,
} from "@/lib/api/my-requests";

export const myRequestsKeys = {
    all: ["my-case-requests"] as const,

    list: (query: MyRequestsQuery) =>
        [...myRequestsKeys.all, "list", query] as const,

    detail: (requestId: string) =>
        [...myRequestsKeys.all, "detail", requestId] as const,
};

export function useMyRequests(query: MyRequestsQuery) {
    return useQuery({
        queryKey: myRequestsKeys.list(query),
        queryFn: () => getMyCaseRequests(query),
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    });
}

export function useMyRequestDetails(
    requestId: string | null,
    enabled = true,
) {
    return useQuery({
        queryKey: myRequestsKeys.detail(requestId ?? ""),
        queryFn: () => {
            if (!requestId) {
                throw new Error("A request ID is required.");
            }

            return getMyCaseRequest(requestId);
        },
        enabled: Boolean(requestId) && enabled,
        staleTime: 30_000,
        retry: 1,
    });
}