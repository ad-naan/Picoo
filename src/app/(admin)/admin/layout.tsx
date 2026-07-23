import "@/app/dashboard.css";
import { requireRole } from "@/modules/identity/application/authorization";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin", "super_admin"]);
  return <DashboardShell area="admin" userName={user.name ?? user.email ?? "Administrator"}>{children}</DashboardShell>;
}
