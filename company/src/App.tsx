
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import CompanySignInPage from "./pages/CompanySignInPage";
import { clerkAppearance } from "./config/clerk";
import { Providers } from "./providers/ClerkProvider";
import CompanyDashboardLayout from "./components/CompanyDashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RequestsPage from "./pages/dashboard/RequestsPage";
import CompanySignUpPage from "./pages/CompanySignUpPage";
import CasesPage from "./pages/dashboard/CasesPage";
import CaseDetailsPage from "./pages/dashboard/CaseDetailsPage";
import RequestDetailsPage from "./pages/dashboard/RequestDetailsPage";
import TeamMembersPage from "./pages/dashboard/TeamMembersPage";
import { Toaster } from "sonner"
// function DashboardGate() {
//   const { isLoaded, isSignedIn } = useAuth();

//   if (!isLoaded) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-50">
//         <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
//       </div>
//     );
//   }

//   if (!isSignedIn) {
//     return <Navigate to="/sign-in" replace />;
//   }

//   // Replace this placeholder with your actual company dashboard.
//   // A signed-in Clerk user must still be verified against your backend
//   // user, company membership, and role before protected company data is shown.
//   return (
//     <main className="min-h-screen bg-slate-50 p-8">
//       <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8">
//         <p className="text-sm font-medium text-indigo-600">ResolveHub</p>
//         <h1 className="mt-3 text-2xl font-semibold tracking-tight">
//           Company dashboard
//         </h1>
//         <p className="mt-2 text-sm text-slate-500">
//           Authentication succeeded. Connect your company membership and
//           authorization checks before displaying company data.
//         </p>
//       </div>
//     </main>
//   );
// }


function RequireSignedInMember() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}


function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        This section is ready for its dedicated page and API integration.
      </p>
    </section>
  );
}

function AppRoutes() {

  return (
    <Routes>
      <Route path="/sign-in" element={<CompanySignInPage />} />
      <Route path="/sign-up" element={<CompanySignUpPage />} />
      <Route element={<RequireSignedInMember />}>
        <Route path="/dashboard" element={<CompanyDashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/:requestId" element={<RequestDetailsPage />} />

          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:caseId" element={<CaseDetailsPage />} />

          <Route path="team" element={<TeamMembersPage />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route
            path="audit-logs"
            element={<PlaceholderPage title="Audit activity" />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable.");
  }

  return (
    <>
      <Toaster position="top-right" />
      <ClerkProvider publishableKey={publishableKey} appearance={clerkAppearance}>
        <Providers>
          <AppRoutes />
        </Providers>
      </ClerkProvider>
    </>
  );
}
