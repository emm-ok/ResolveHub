export declare function ensureUserExists(clerkUserId: string): Promise<{
    id: string;
    clerkId: string;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    platformRole: import("@prisma/client").$Enums.PlatformRole;
    status: import("@prisma/client").$Enums.UserStatus;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}>;
//# sourceMappingURL=user.service.d.ts.map