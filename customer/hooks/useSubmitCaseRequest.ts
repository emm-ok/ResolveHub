"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    submitCaseRequest,
    type SubmitCaseRequestInput,
} from "@/lib/api/case-requests";

interface MutationInput {
    companyId: string;
    data: SubmitCaseRequestInput;
}

export function useSubmitCaseRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, data }: MutationInput) =>
            submitCaseRequest(companyId, data),

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["customer-requests"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["current-user"],
                }),
            ]);
        },
    });
}