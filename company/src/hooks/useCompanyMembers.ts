
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getCompanyMembers,
    removeCompanyMember,
    updateCompanyMember,
} from "../lib/api/company-members";

import type {
    MemberListParams,
    UpdateCompanyMemberInput,
} from "../types/company-member";

export const companyMemberKeys = {
    all: ["company-members"] as const,
    lists: (companyId: string) =>
        [...companyMemberKeys.all, companyId, "list"] as const,
    list: (companyId: string, params: MemberListParams) =>
        [...companyMemberKeys.lists(companyId), params] as const,
};

export function useCompanyMembers(
    companyId: string,
    params: MemberListParams,
) {
    return useQuery({
        queryKey: companyMemberKeys.list(companyId, params),
        queryFn: () => getCompanyMembers(companyId, params),
        enabled: Boolean(companyId),
        placeholderData: (previousData) => previousData,
    });
}

export function useUpdateCompanyMember(companyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            memberId,
            input,
        }: {
            memberId: string;
            input: UpdateCompanyMemberInput;
        }) =>
            updateCompanyMember({
                companyId,
                memberId,
                input,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: companyMemberKeys.lists(companyId),
            });
        },
    });
}

export function useRemoveCompanyMember(companyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: string) =>
            removeCompanyMember({ companyId, memberId }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: companyMemberKeys.lists(companyId),
            });
        },
    });
}
