
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



export const PERMISSION_CODES = [
    "USER_READ",
    "USER_UPDATE",
    "COMPANY_SETTINGS_READ",
    "COMPANY_SETTINGS_UPDATE",
    "MEMBER_READ",
    "MEMBER_INVITE",
    "MEMBER_UPDATE",
    "MEMBER_REMOVE",
    "ROLE_READ",
    "ROLE_MANAGE",
    "CASE_REQUEST_READ",
    "CASE_REQUEST_REVIEW",
    "CASE_CREATE",
    "CASE_READ",
    "CASE_UPDATE",
    "CASE_ASSIGN",
    "CASE_ESCALATE",
    "CASE_RESOLVE",
    "CASE_CLOSE",
    "CASE_REOPEN",
    "COMMENT_CREATE",
    "EVIDENCE_READ",
    "EVIDENCE_UPLOAD",
    "EVIDENCE_DELETE",
    "RESOLUTION_PROPOSE",
    "RESOLUTION_DECIDE",
    "SLA_MANAGE",
    "AUDIT_READ",
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export type SystemRoleType =
    | "ADMIN"
    | "AGENT"
    | "INVESTIGATOR"
    | "VIEWER";

export type CompanyRole = {
    id: string;
    companyId: string;
    name: string;
    slug: string;
    description: string | null;
    systemRole: SystemRoleType | null;
    isDefault: boolean;
    permissions: PermissionCode[];
};
