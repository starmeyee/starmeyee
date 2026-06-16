"use client";

import { useAuth } from "@/contexts/AuthContext";
import { hasAdminAccess } from "@/config/admin";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * Ensures the authenticated user actually has admin privileges.
 * Must be rendered inside <ProtectedRoute> (which guarantees a logged-in user).
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();

  // Wait for the profile (with role) to resolve before deciding.
  if (loading || (user && !profile)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const allowed = hasAdminAccess(user?.email ?? profile?.email, profile?.role);

  if (!allowed) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Access Restricted</h1>
          <p className="text-muted-foreground">
            Your account ({user?.email}) doesn&apos;t have permission to access the admin dashboard.
            If this is your site, add your email to <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_ADMIN_EMAILS</code>.
          </p>
          <Button variant="outline" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
