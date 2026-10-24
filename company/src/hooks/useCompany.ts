
import { useQuery } from "@tanstack/react-query";
import {
    dashboardKeys,
    getMyCompanyDashboard,
} from "../lib/api/company";

export function useCompanyDashboard() {
    return useQuery({
        queryKey: dashboardKeys.myCompany(),
        queryFn: getMyCompanyDashboard,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
            const status = (
                error as { response?: { status?: number } }
            )?.response?.status;

            // Do not retry authentication or authorization errors.
            if (status === 401 || status === 403) return false;

            return failureCount < 2;
        },
    });
}
