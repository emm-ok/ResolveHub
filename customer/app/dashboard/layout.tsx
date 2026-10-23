import { CustomerDashboardShell } from "@/components/dashboard/CustomerDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Dashboard | ResolveHub",
        template: "%s | ResolveHub",
    },
    description: "Manage and track your requests on ResolveHub.",
};

export default function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <CustomerDashboardShell>{children}</CustomerDashboardShell>;
}