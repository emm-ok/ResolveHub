export type CompanyStatus = "ACTIVE";

export interface Company {
    id: string;
    name: string;
    slug: string;
    email: string;
    logoUrl: string | null;
    status: CompanyStatus;
}

export interface CompaniesPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CompaniesResponse {
    success: boolean;
    data: Company[];
    pagination: CompaniesPagination;
}

export interface CompaniesQuery {
    page: number;
    limit: number;
    search?: string;
}