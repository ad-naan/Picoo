import "@/app/dashboard.css";
import { requireUser } from "@/modules/identity/application/authorization";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell area="studio" userName={user.name ?? user.email ?? "Creator"}>{children}</DashboardShell>;
}
