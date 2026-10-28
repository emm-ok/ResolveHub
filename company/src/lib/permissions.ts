
import type { PermissionCode } from "../types/company-member";

export function hasPermission(
    grantedPermissions: readonly PermissionCode[] | null | undefined,
    requiredPermission: PermissionCode,
): boolean {
    if (!grantedPermissions?.length) {
        return false;
    }

    return grantedPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
    grantedPermissions: readonly PermissionCode[] | null | undefined,
    requiredPermissions: readonly PermissionCode[],
): boolean {
    if (!grantedPermissions?.length) {
        return false;
    }

    return requiredPermissions.some((permission) =>
        grantedPermissions.includes(permission),
    );
}

export function hasAllPermissions(
    grantedPermissions: readonly PermissionCode[] | null | undefined,
    requiredPermissions: readonly PermissionCode[],
): boolean {
    if (!requiredPermissions.length) {
        return true;
    }

    if (!grantedPermissions?.length) {
        return false;
    }

    return requiredPermissions.every((permission) =>
        grantedPermissions.includes(permission),
    );
}
