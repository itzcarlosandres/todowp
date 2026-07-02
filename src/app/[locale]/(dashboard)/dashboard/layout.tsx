import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardInnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <div className="container-fluid py-8">{children}</div>
      </div>
    </div>
  );
}
