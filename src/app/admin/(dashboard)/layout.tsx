import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminGuard from "@/components/auth/AdminGuard";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminGuard>
        <div className="flex min-h-screen bg-muted/20">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          <main className="flex-1 flex flex-col min-w-0">
            <Header />
            <div className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </AdminGuard>
    </ProtectedRoute>
  );
}
