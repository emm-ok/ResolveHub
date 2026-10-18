import { PermissionCode, SystemRoleType } from "@prisma/client"

export const ROLE_PERMISSIONS: Record<
    SystemRoleType,
    PermissionCode[]
> = {
    ADMIN: [
        PermissionCode.USER_READ,
        PermissionCode.USER_UPDATE,

        PermissionCode.COMPANY_SETTINGS_READ,
        PermissionCode.COMPANY_SETTINGS_UPDATE,

        PermissionCode.MEMBER_READ,
        PermissionCode.MEMBER_INVITE,
        PermissionCode.MEMBER_UPDATE,
        PermissionCode.MEMBER_REMOVE,

        PermissionCode.ROLE_READ,
        PermissionCode.ROLE_MANAGE,

        PermissionCode.CASE_REQUEST_READ,
        PermissionCode.CASE_REQUEST_REVIEW,

        PermissionCode.CASE_CREATE,
        PermissionCode.CASE_READ,
        PermissionCode.CASE_UPDATE,
        PermissionCode.CASE_ASSIGN,
        PermissionCode.CASE_ESCALATE,
        PermissionCode.CASE_RESOLVE,
        PermissionCode.CASE_CLOSE,
        PermissionCode.CASE_REOPEN,

        PermissionCode.COMMENT_CREATE,

        PermissionCode.EVIDENCE_READ,
        PermissionCode.EVIDENCE_UPLOAD,
        PermissionCode.EVIDENCE_DELETE,

        PermissionCode.RESOLUTION_PROPOSE,
        PermissionCode.RESOLUTION_DECIDE,

        PermissionCode.SLA_MANAGE,
        PermissionCode.AUDIT_READ,
    ],

    AGENT: [
        PermissionCode.CASE_REQUEST_READ,
        PermissionCode.CASE_READ,
        PermissionCode.CASE_UPDATE,
        PermissionCode.CASE_ASSIGN,

        PermissionCode.COMMENT_CREATE,

        PermissionCode.EVIDENCE_READ,
        PermissionCode.EVIDENCE_UPLOAD,

        PermissionCode.RESOLUTION_PROPOSE,
    ],

    INVESTIGATOR: [
        PermissionCode.CASE_REQUEST_READ,
        PermissionCode.CASE_READ,
        PermissionCode.CASE_UPDATE,

        PermissionCode.COMMENT_CREATE,

        PermissionCode.EVIDENCE_READ,
        PermissionCode.EVIDENCE_UPLOAD,

        PermissionCode.RESOLUTION_PROPOSE,
    ],

    VIEWER: [
        PermissionCode.CASE_REQUEST_READ,
        PermissionCode.CASE_READ,
        PermissionCode.EVIDENCE_READ,
    ],
};