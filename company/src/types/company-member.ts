
export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";

export type CompanyMember = {
    id: string;
    status: MembershipStatus;
    department: string | null;
    jobTitle: string | null;
    employeeId: string | null;
    joinedAt: string | null;
    suspendedAt: string | null;
    removedAt: string | null;
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
};

export type CompanyRole = {
    id: string;
    name: string;
    slug: string;
    systemRole: string | null;
};

export type MemberListResponse = {
    items: CompanyMember[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type MemberListParams = {
    page: number;
    limit: number;
    search?: string;
    status?: MembershipStatus;
    roleId?: string;
};

export type UpdateCompanyMemberInput = {
    roleId?: string;
    status?: Exclude<MembershipStatus, "REMOVED">;
    department?: string | null;
    jobTitle?: string | null;
    employeeId?: string | null;
};

export type ApiErrorResponse = {
    success?: false;
    message?: string;
    errors?: unknown;
};
