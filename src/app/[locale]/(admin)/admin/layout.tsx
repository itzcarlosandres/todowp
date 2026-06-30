import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <div className="container-fluid py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
