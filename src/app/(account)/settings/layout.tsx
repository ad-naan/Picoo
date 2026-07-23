import "@/app/dashboard.css";
import { requireUser } from "@/modules/identity/application/authorization";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell area="settings" userName={user.name ?? user.email ?? "Picoo User"}>{children}</DashboardShell>;
}
