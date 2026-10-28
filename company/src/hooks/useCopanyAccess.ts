
import { useCallback, useMemo } from "react";
import {
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
} from "../lib/permissions";
import type { PermissionCode } from "../types/company-member";

export function useCompanyAccess(
    grantedPermissions: readonly PermissionCode[] | undefined,
) {
    const permissions = useMemo(
        () => grantedPermissions ?? [],
        [grantedPermissions],
    );

    const checkPermission = useCallback(
        (permission: PermissionCode) =>
            hasPermission(permissions, permission),
        [permissions],
    );

    const checkAnyPermission = useCallback(
        (required: readonly PermissionCode[]) =>
            hasAnyPermission(permissions, required),
        [permissions],
    );

    const checkAllPermissions = useCallback(
        (required: readonly PermissionCode[]) =>
            hasAllPermissions(permissions, required),
        [permissions],
    );

    return {
        permissions,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
    };
}
