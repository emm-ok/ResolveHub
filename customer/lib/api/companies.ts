import { api } from "@/lib/api/axios";
import type {
    CompaniesQuery,
    CompaniesResponse,
} from "@/types/company";

export async function fetchCompanies(
    params: CompaniesQuery,
    signal?: AbortSignal,
): Promise<CompaniesResponse> {
    const response = await api.get<CompaniesResponse>(
        "/companies/all-companies",
        {
            params: {
                page: params.page,
                limit: params.limit,
                ...(params.search ? { search: params.search } : {}),
            },
            signal,
        },
    );

    return response.data;
}