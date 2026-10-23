
export interface CurrentUser {
    id: string;
    clerkId: string;
    name: string | null;
    email: string;
    status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
    platformRole?: string | null;
    memberships: {
        id: string;
        companyId: string;
        company: {
            id: string;
            name: string;
            slug: string;
            logoUrl: string | null;
        };
        role: {
            id: string;
            name: string;
            systemRole: string | null;
            permissions: {
                permission: {
                    code: string;
                };
            }[];
        };
    }[];
}