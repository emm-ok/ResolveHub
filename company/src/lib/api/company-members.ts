
import api from "./axios";
import type {
    CompanyMember,
    MemberListParams,
    MemberListResponse,
    UpdateCompanyMemberInput,
} from "../../types/company-member";

export async function getCompanyMembers(
    companyId: string,
    params: MemberListParams,
): Promise<MemberListResponse> {
    const { data } = await api.get<{
        success: boolean;
        message: string;
        data: MemberListResponse;
    }>(`/companies/${companyId}/members`, { params });

    return data.data;
}

export async function updateCompanyMember({
    companyId,
    memberId,
    input,
}: {
    companyId: string;
    memberId: string;
    input: UpdateCompanyMemberInput;
}): Promise<CompanyMember> {
    const { data } = await api.patch<{
        success: boolean;
        message: string;
        data: CompanyMember;
    }>(`/companies/${companyId}/members/${memberId}`, input);

    return data.data;
}

export async function removeCompanyMember({
    companyId,
    memberId,
}: {
    companyId: string;
    memberId: string;
}): Promise<void> {
    await api.delete(
        `/companies/${companyId}/members/${memberId}`,
    );
}
