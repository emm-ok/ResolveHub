
import { api } from "./axios";
import type {
  ApiResponse,
  CompanyDashboard,
} from "../../types/company";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  myCompany: () => [...dashboardKeys.all, "me"] as const,
};

export async function getMyCompanyDashboard(): Promise<CompanyDashboard> {
  const response = await api.get<ApiResponse<CompanyDashboard>>(
    "/companies/me",
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Unable to load the company dashboard.",
    );
  }

  return response.data.data;
}
