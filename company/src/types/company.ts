export interface DashboardCompany {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    logoUrl: string | null;
    description: string | null;
    timezone: string;
    status: string;
    roles: {
        permissions: any[]
    }
}

export interface DashboardMember {
    membershipId: string;
    role: {
        id: string;
        name: string;
    } | null;
    department: string | null;
    jobTitle: string | null;
    joinedAt: string | null;
}

export interface DashboardStats {
    totalRequests: number;
    pendingRequests: number;
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
}

export interface DashboardRequest {
    id: string;
    requestNumber: string;
    title: string;
    status: string;
    submitter: {
        name: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

export interface CompanyDashboard {
    company: DashboardCompany;
    member: DashboardMember;
    stats: DashboardStats;
    recentRequests: DashboardRequest[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
