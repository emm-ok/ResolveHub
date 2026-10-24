
import { ClerkProvider ,useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import CompanySignInPage from "./pages/CompanySignInPage";
import { clerkAppearance } from "./config/clerk";

function DashboardGate() {
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

  // Replace this placeholder with your actual company dashboard.
  // A signed-in Clerk user must still be verified against your backend
  // user, company membership, and role before protected company data is shown.
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-medium text-indigo-600">ResolveHub</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Company dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Authentication succeeded. Connect your company membership and
          authorization checks before displaying company data.
        </p>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<CompanySignInPage />} />
      <Route path="/dashboard/*" element={<DashboardGate />} />
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
    <ClerkProvider publishableKey={publishableKey} appearance={clerkAppearance}>
      <AppRoutes />
    </ClerkProvider>
  );
}
