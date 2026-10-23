import type { Metadata } from "next";
import { MyRequestsPage } from "@/components/dashboard/requests/MyRequestPage";

export const metadata: Metadata = {
    title: "My Requests",
    description: "View and track your ResolveHub requests.",
};

export default function RequestsPage() {
    return <MyRequestsPage />;
}