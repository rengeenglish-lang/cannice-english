import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { DashboardSidebar } from "@/components/admin/AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  return (
    <div className="dashboard-frame lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={user.role} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
